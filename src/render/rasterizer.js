import { Text } from '../core/Text.js';
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

  const [fr, fg, fb] = parseColor(fill);
  fillRect(buf, x, y, width, height, fr, fg, fb, clip);

  if (box instanceof Text && box.content.length > 0) {
    const [cr, cg, cb] = parseColor(color);
    const font = getFont(box.fontName);
    const cellHeight = getFontCellHeight(font);
    const isMultiLine = box.heightSpec.type !== 'neutral';
    const lines = layoutText(box.content, width, isMultiLine, font);

    let lineY = y;
    for (const line of lines) {
      if (lineY + cellHeight > y + height) break;

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
