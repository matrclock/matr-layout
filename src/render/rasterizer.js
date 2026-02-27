import { Text } from '../core/Text.js';
import { Padding } from '../core/Padding.js';
import { Animation } from '../core/Animation.js';
import { Raster } from '../core/Raster.js';
import { getFont, getFontCellHeight, getTextWidth, layoutText, renderGlyph, parseColor } from '../font/glyphFont.js';

function fillRect(buf, x, y, w, h, r, g, b, clip) {
  const { width, height, data } = buf;
  const left = Math.max(x, clip.x, 0);
  const top = Math.max(y, clip.y, 0);
  const right = Math.min(x + w, clip.x + clip.width, width);
  const bottom = Math.min(y + h, clip.y + clip.height, height);

  for (let py = top; py < bottom; py++) {
    for (let px = left; px < right; px++) {
      const i = (py * width + px) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
}

function intersectClip(a, b) {
  const left = Math.max(a.x, b.x);
  const top = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  return {
    x: left,
    y: top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

function paint(box, buf, parentClip) {
  const { x, y, width, height, fill, color } = box.resolved;

  const ownBounds = { x, y, width, height };
  const clip = intersectClip(ownBounds, parentClip);

  if (clip.width <= 0 || clip.height <= 0) return;

  if (box instanceof Animation) {
    const frame = box.children[box.activeFrame % Math.max(1, box.children.length)];
    if (frame) paint(frame, buf, clip);
    return;
  }

  if (box instanceof Padding) {
    if (box.padColor !== null) {
      const [pr, pg, pb] = parseColor(box.padColor);
      const { top, right, bottom, left } = box.pad;
      // Only fill the padding strips, not the inner content area.
      if (top > 0)    fillRect(buf, x,                   y,                    width,         top,    pr, pg, pb, clip);
      if (bottom > 0) fillRect(buf, x,                   y + height - bottom,  width,         bottom, pr, pg, pb, clip);
      if (left > 0)   fillRect(buf, x,                   y + top,              left,          height - top - bottom, pr, pg, pb, clip);
      if (right > 0)  fillRect(buf, x + width - right,   y + top,              right,         height - top - bottom, pr, pg, pb, clip);
    }
    for (const child of box.children) {
      paint(child, buf, clip);
    }
    return;
  }

  if (box instanceof Raster && box.pixels !== null) {
    const { x, y } = box.resolved;
    for (let row = 0; row < box.pixels.length; row++) {
      const rowData = box.pixels[row];
      if (rowData == null) continue;
      for (let col = 0; col < rowData.length; col++) {
        const hex = rowData[col];
        if (hex == null) continue;
        const [r, g, b] = parseColor(hex);
        fillRect(buf, x + col, y + row, 1, 1, r, g, b, clip);
      }
    }
    return;
  }

  if (fill !== null) {
    const [fr, fg, fb] = parseColor(fill);
    fillRect(buf, x, y, width, height, fr, fg, fb, clip);
  }

  if (box instanceof Text && box.content.length > 0) {
    const [cr, cg, cb] = parseColor(color);
    const font = getFont(box.fontName);
    const cellHeight = getFontCellHeight(font);
    const isMultiLine = box.heightSpec.type !== 'neutral';
    const lines = layoutText(box.content, width, isMultiLine, font);

    let lineY = y;
    for (const line of lines) {
      if (lineY >= y + height) break;

      const lineWidth = getTextWidth(line, font);
      let charX;
      if (box.align === 'end') {
        charX = x + width - lineWidth;
      } else if (box.align === 'center') {
        charX = x + Math.floor((width - lineWidth) / 2);
      } else {
        charX = x;
      }
      for (const ch of line) {
        charX += renderGlyph(buf, ch, charX, lineY, cr, cg, cb, clip, font);
      }

      lineY += cellHeight;
    }
  }

  for (const child of box.children) {
    paint(child, buf, clip);
  }
}

/**
 * Rasterizes a resolved box tree into a flat RGBA Uint8Array.
 * @param {import('../core/Box.js').Box} root
 * @returns {Uint8Array} RGBA buffer, row-major, length = width * height * 4
 */
export function rasterize(root) {
  const { width, height } = root.resolved;
  const buf = {
    data: new Uint8Array(width * height * 4),
    width,
    height,
  };
  paint(root, buf, { x: 0, y: 0, width, height });
  return buf.data;
}

function collectAnimations(root) {
  const list = [];
  function walk(box) {
    if (box instanceof Animation) list.push(box);
    for (const child of box.children) walk(child);
  }
  walk(root);
  return list;
}

/**
 * Produces one raster per animation frame.
 * Returns a single-frame result if no Animation nodes are present.
 * @param {import('../core/Box.js').Box} root
 * @returns {{ frames: Uint8Array[], durations: number[] }}
 */
export function rasterizeFrames(root) {
  const animations = collectAnimations(root);
  if (animations.length === 0) {
    return { frames: [rasterize(root)], durations: [] };
  }

  const masterDuration = Math.min(...animations.map(a => Math.min(...a.durations)));
  const primary = animations[0];
  const totalDuration = primary.children.length * primary.durations[0];
  const frameCount = Math.round(totalDuration / masterDuration);

  const frames = [];
  for (let i = 0; i < frameCount; i++) {
    const t = i * masterDuration;
    for (const anim of animations) {
      anim.activeFrame = Math.floor(t / anim.durations[0]) % anim.children.length;
    }
    frames.push(rasterize(root));
  }

  for (const anim of animations) anim.activeFrame = 0;
  return { frames, durations: Array(frameCount).fill(masterDuration) };
}
