import { Text } from '../core/Text.js';
import { Padding } from '../core/Padding.js';
import { Animation } from '../core/Animation.js';
import { Deck } from '../core/Deck.js';
import { Raster } from '../core/Raster.js';
import { getFont, getFontCellHeight, getTextWidth, layoutText, renderGlyph, parseColor } from '../font/glyphFont.js';
import { resolveBox } from '../layout/dimensionResolver.js';
import { resolveStyles, StyleContext } from '../style/StyleContext.js';
import { positionTree } from '../layout/coordinateResolver.js';

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

// Blit src into dst with pixel offsets (offsetX, offsetY).
// dst pixel at (cx, cy) samples src at (cx - offsetX, cy - offsetY).
function blitOffset(src, dst, width, height, offsetX, offsetY) {
  for (let cy = 0; cy < height; cy++) {
    const srcY = cy - offsetY;
    if (srcY < 0 || srcY >= height) continue;
    for (let cx = 0; cx < width; cx++) {
      const srcX = cx - offsetX;
      if (srcX < 0 || srcX >= width) continue;
      const si = (srcY * width + srcX) * 4;
      const di = (cy * width + cx) * 4;
      dst[di]     = src[si];
      dst[di + 1] = src[si + 1];
      dst[di + 2] = src[si + 2];
      dst[di + 3] = src[si + 3];
    }
  }
}

// Simple integer hash for dissolve/checkerboard determinism.
function pixelHash(x, y) {
  let h = (Math.imul(x, 1664525) + Math.imul(y, 1013904223)) | 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x45d9f3b);
  h ^= h >>> 16;
  return (h >>> 0) / 0x100000000;
}

// Ray-cast point-in-polygon for a 5-pointed star centered at (cx, cy) with given outerR.
function pointInStar5(px, py, cx, cy, outerR) {
  if (outerR <= 0) return false;
  const innerR = outerR * 0.4;
  let inside = false;
  let j = 9;
  for (let i = 0; i < 10; i++) {
    const aI = (i * Math.PI / 5) - Math.PI / 2;
    const rI = i % 2 === 0 ? outerR : innerR;
    const xi = cx + rI * Math.cos(aI);
    const yi = cy + rI * Math.sin(aI);
    const aJ = (j * Math.PI / 5) - Math.PI / 2;
    const rJ = j % 2 === 0 ? outerR : innerR;
    const xj = cx + rJ * Math.cos(aJ);
    const yj = cy + rJ * Math.sin(aJ);
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
    j = i;
  }
  return inside;
}

function paint(box, buf, parentClip) {
  const { x, y, width, height, fill, color } = box.resolved;

  const ownBounds = { x, y, width, height };
  const clip = intersectClip(ownBounds, parentClip);

  if (clip.width <= 0 || clip.height <= 0) return;

  if (box instanceof Deck) {
    if (box.precomputedFrames) {
      const frameIdx = box.activeFrame % Math.max(1, box.precomputedFrames.length);
      const frameData = box.precomputedFrames[frameIdx];
      if (frameData) {
        for (let py = 0; py < height; py++) {
          for (let px = 0; px < width; px++) {
            const cx = x + px;
            const cy = y + py;
            if (cx < clip.x || cx >= clip.x + clip.width) continue;
            if (cy < clip.y || cy >= clip.y + clip.height) continue;
            if (cx < 0 || cx >= buf.width || cy < 0 || cy >= buf.height) continue;
            const si = (py * width + px) * 4;
            const di = (cy * buf.width + cx) * 4;
            buf.data[di]     = frameData[si];
            buf.data[di + 1] = frameData[si + 1];
            buf.data[di + 2] = frameData[si + 2];
            buf.data[di + 3] = frameData[si + 3];
          }
        }
      }
      return;
    }
    // Not pre-rasterized: show active slide child.
    const child = box.children[box.activeFrame % Math.max(1, box.children.length)];
    if (child) paint(child, buf, clip);
    return;
  }

  if (box instanceof Animation) {
    const frame = box.children[box.activeFrame % Math.max(1, box.children.length)];
    if (frame) paint(frame, buf, clip);
    return;
  }

  if (box instanceof Padding) {
    if (box.padColor !== null) {
      const [pr, pg, pb] = parseColor(box.padColor);
      const { top, right, bottom, left } = box.pad;
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

// After pre-rasterization, skip recursing into a Deck's slide subtree.
function collectAnimations(root) {
  const list = [];
  function walk(box) {
    if (box instanceof Animation || box instanceof Deck) {
      list.push(box);
      if (box instanceof Deck && box.precomputedFrames) return;
    }
    for (const child of box.children) walk(child);
  }
  walk(root);
  return list;
}

function totalDuration(anim) {
  return anim.durations.reduce((a, b) => a + b, 0);
}

function getActiveFrame(anim, t) {
  const total = totalDuration(anim);
  if (total === 0) return 0;
  const tMod = t % total;
  let cumulative = 0;
  for (let i = 0; i < anim.durations.length; i++) {
    cumulative += anim.durations[i];
    if (tMod < cumulative) return i;
  }
  return anim.durations.length - 1;
}

// Rasterize a slide's content into a fixed-length frame sequence at masterDuration resolution.
function rasterizeSlideContent(slide, root, masterDuration) {
  const { width, height } = root.resolved;
  const rootFill = root.resolved.fill;
  const clip = { x: 0, y: 0, width, height };

  function makeFrame() {
    const buf = { data: new Uint8Array(width * height * 4), width, height };
    if (rootFill) {
      const [r, g, b] = parseColor(rootFill);
      fillRect(buf, 0, 0, width, height, r, g, b, clip);
    }
    const child = slide.children[0];
    if (child) paint(child, buf, clip);
    return buf.data;
  }

  // Collect Animation nodes within the slide subtree.
  const animations = [];
  function walkSlide(box) {
    if (box instanceof Animation) animations.push(box);
    for (const c of box.children) walkSlide(c);
  }
  if (slide.children[0]) walkSlide(slide.children[0]);

  const frameCount = Math.max(1, Math.round(slide.duration / masterDuration));

  if (animations.length === 0) {
    const frame = makeFrame();
    return {
      frames: Array(frameCount).fill(frame),
      durations: Array(frameCount).fill(masterDuration),
    };
  }

  const frames = [];
  for (let i = 0; i < frameCount; i++) {
    const t = i * masterDuration;
    for (const anim of animations) {
      anim.activeFrame = getActiveFrame(anim, t);
    }
    frames.push(makeFrame());
  }
  for (const anim of animations) anim.activeFrame = 0;

  return { frames, durations: Array(frameCount).fill(masterDuration) };
}

// Resolve and rasterize a standalone box (e.g. transition.from) into a pixel buffer.
// The box is resolved as if it fills the full canvas, then painted over rootFill.
function rasterizeBoxToFrame(box, width, height, rootFill) {
  const clip = { x: 0, y: 0, width, height };
  const buf = { data: new Uint8Array(width * height * 4), width, height };
  if (rootFill) {
    const [r, g, b] = parseColor(rootFill);
    fillRect(buf, 0, 0, width, height, r, g, b, clip);
  }
  resolveBox(box, width, height);
  resolveStyles(box, new StyleContext());
  positionTree(box);
  paint(box, buf, clip);
  return buf.data;
}

// Build transition frames between fromFrame and toFrame.
function generateTransitionFrames(transition, fromFrame, toFrame, width, height, masterDuration) {
  const frameCount = Math.max(1, Math.round(transition.duration / masterDuration));
  const frames = [];
  const type = transition.type;

  for (let i = 0; i < frameCount; i++) {
    const p = (i + 1) / frameCount; // 0 < p <= 1
    const buf = new Uint8Array(width * height * 4);

    if (type === 'fade') {
      for (let j = 0; j < buf.length; j += 4) {
        buf[j]     = Math.round(fromFrame[j]     * (1 - p) + toFrame[j]     * p);
        buf[j + 1] = Math.round(fromFrame[j + 1] * (1 - p) + toFrame[j + 1] * p);
        buf[j + 2] = Math.round(fromFrame[j + 2] * (1 - p) + toFrame[j + 2] * p);
        buf[j + 3] = 255;
      }
    } else if (type === 'slideLeft') {
      const offset = Math.round(p * width);
      blitOffset(fromFrame, buf, width, height, -offset, 0);
      blitOffset(toFrame,   buf, width, height, width - offset, 0);
    } else if (type === 'slideRight') {
      const offset = Math.round(p * width);
      blitOffset(fromFrame, buf, width, height, offset, 0);
      blitOffset(toFrame,   buf, width, height, offset - width, 0);
    } else if (type === 'slideUp') {
      const offset = Math.round(p * height);
      blitOffset(fromFrame, buf, width, height, 0, -offset);
      blitOffset(toFrame,   buf, width, height, 0, height - offset);
    } else if (type === 'slideDown') {
      const offset = Math.round(p * height);
      blitOffset(fromFrame, buf, width, height, 0, offset);
      blitOffset(toFrame,   buf, width, height, 0, offset - height);
    } else if (type === 'wipeRight') {
      const boundary = Math.round(p * width);
      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const idx = (py * width + px) * 4;
          const src = px < boundary ? toFrame : fromFrame;
          buf[idx] = src[idx]; buf[idx+1] = src[idx+1]; buf[idx+2] = src[idx+2]; buf[idx+3] = 255;
        }
      }
    } else if (type === 'wipeLeft') {
      const boundary = Math.round((1 - p) * width);
      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const idx = (py * width + px) * 4;
          const src = px >= boundary ? toFrame : fromFrame;
          buf[idx] = src[idx]; buf[idx+1] = src[idx+1]; buf[idx+2] = src[idx+2]; buf[idx+3] = 255;
        }
      }
    } else if (type === 'wipeDown') {
      const boundary = Math.round(p * height);
      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const idx = (py * width + px) * 4;
          const src = py < boundary ? toFrame : fromFrame;
          buf[idx] = src[idx]; buf[idx+1] = src[idx+1]; buf[idx+2] = src[idx+2]; buf[idx+3] = 255;
        }
      }
    } else if (type === 'wipeUp') {
      const boundary = Math.round((1 - p) * height);
      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const idx = (py * width + px) * 4;
          const src = py >= boundary ? toFrame : fromFrame;
          buf[idx] = src[idx]; buf[idx+1] = src[idx+1]; buf[idx+2] = src[idx+2]; buf[idx+3] = 255;
        }
      }
    } else if (type === 'flipLeft' || type === 'flipRight') {
      // Phase 1 (p<0.5): A compresses to 0. Phase 2 (p>=0.5): B expands from 0.
      // flipLeft: pivot on left edge. flipRight: pivot on right edge.
      const phase2 = p >= 0.5;
      const src = phase2 ? toFrame : fromFrame;
      const scale = phase2 ? (2 * p - 1) : (1 - 2 * p);
      const visW = Math.round(scale * width);
      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const di = (py * width + px) * 4;
          if (visW <= 0) continue;
          let srcX;
          if (type === 'flipLeft') {
            if (px >= visW) continue;
            srcX = Math.round((px / visW) * (width - 1));
          } else {
            if (px < width - visW) continue;
            srcX = Math.round(((px - (width - visW)) / visW) * (width - 1));
          }
          const si = (py * width + srcX) * 4;
          buf[di] = src[si]; buf[di+1] = src[si+1]; buf[di+2] = src[si+2]; buf[di+3] = 255;
        }
      }
    } else if (type === 'flipUp' || type === 'flipDown') {
      // Phase 1 (p<0.5): A compresses to 0. Phase 2 (p>=0.5): B expands from 0.
      // flipUp: pivot on top edge. flipDown: pivot on bottom edge.
      const phase2 = p >= 0.5;
      const src = phase2 ? toFrame : fromFrame;
      const scale = phase2 ? (2 * p - 1) : (1 - 2 * p);
      const visH = Math.round(scale * height);
      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const di = (py * width + px) * 4;
          if (visH <= 0) continue;
          let srcY;
          if (type === 'flipUp') {
            if (py >= visH) continue;
            srcY = Math.round((py / visH) * (height - 1));
          } else {
            if (py < height - visH) continue;
            srcY = Math.round(((py - (height - visH)) / visH) * (height - 1));
          }
          const si = (srcY * width + px) * 4;
          buf[di] = src[si]; buf[di+1] = src[si+1]; buf[di+2] = src[si+2]; buf[di+3] = 255;
        }
      }
    } else if (type === 'starWipe') {
      const maxR = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2) * 1.5;
      const outerR = p * maxR;
      const cx = width / 2;
      const cy = height / 2;
      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const idx = (py * width + px) * 4;
          const src = pointInStar5(px + 0.5, py + 0.5, cx, cy, outerR) ? toFrame : fromFrame;
          buf[idx] = src[idx]; buf[idx+1] = src[idx+1]; buf[idx+2] = src[idx+2]; buf[idx+3] = 255;
        }
      }
    } else if (type === 'dissolve') {
      const blockSize = Math.max(2, Math.round(Math.min(width, height) / 8));
      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const bx = Math.floor(px / blockSize);
          const by = Math.floor(py / blockSize);
          const idx = (py * width + px) * 4;
          const src = pixelHash(bx, by) < p ? toFrame : fromFrame;
          buf[idx] = src[idx]; buf[idx+1] = src[idx+1]; buf[idx+2] = src[idx+2]; buf[idx+3] = 255;
        }
      }
    } else if (type === 'checkerboard') {
      const cellSize = Math.max(2, Math.round(Math.min(width, height) / 4));
      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const col = Math.floor(px / cellSize);
          const row = Math.floor(py / cellSize);
          const even = (col + row) % 2 === 0;
          // Even cells open in p=[0..0.5], odd cells in p=[0.5..1].
          const localP = even ? Math.min(1, p * 2) : Math.min(1, Math.max(0, (p - 0.5) * 2));
          const cellCX = (col + 0.5) * cellSize;
          const cellCY = (row + 0.5) * cellSize;
          const halfSize = localP * cellSize * 0.5;
          const idx = (py * width + px) * 4;
          const inCell = Math.abs(px + 0.5 - cellCX) < halfSize && Math.abs(py + 0.5 - cellCY) < halfSize;
          const src = inCell ? toFrame : fromFrame;
          buf[idx] = src[idx]; buf[idx+1] = src[idx+1]; buf[idx+2] = src[idx+2]; buf[idx+3] = 255;
        }
      }
    } else if (type === 'blinds') {
      const numBlinds = Math.max(2, Math.round(height / 4));
      const slatH = height / numBlinds;
      for (let py = 0; py < height; py++) {
        const localY = (py % slatH) / slatH; // 0..1 within slat
        for (let px = 0; px < width; px++) {
          const idx = (py * width + px) * 4;
          const src = localY < p ? toFrame : fromFrame;
          buf[idx] = src[idx]; buf[idx+1] = src[idx+1]; buf[idx+2] = src[idx+2]; buf[idx+3] = 255;
        }
      }
    }

    frames.push(buf);
  }
  return frames;
}

// Pre-rasterize all slides in a Deck into a flat frame sequence (including transitions).
// Each slide's transition is its ENTRANCE: frames are inserted before the slide's content.
//   - transition.from (if set): rasterized as the fromFrame (e.g. for the very first slide)
//   - otherwise: the previous slide's last frame is used as fromFrame
// Sets deck.precomputedFrames, deck.precomputedDurations, and deck.durations.
function preRasterizeDeck(deck, root, masterDuration) {
  const { width, height } = root.resolved;
  const rootFill = root.resolved.fill;
  const slideDataList = deck.children.map(slide =>
    rasterizeSlideContent(slide, root, masterDuration)
  );

  const allFrames = [];
  const allDurations = [];

  for (let i = 0; i < slideDataList.length; i++) {
    const slide = deck.children[i];
    const { frames, durations } = slideDataList[i];

    // Insert entrance transition BEFORE this slide's content frames.
    if (slide.transition) {
      let fromFrame = null;
      if (slide.transition.from) {
        // Caller provided an explicit from-frame (e.g. for the first slide).
        fromFrame = rasterizeBoxToFrame(slide.transition.from, width, height, rootFill);
      } else if (i > 0) {
        // Default: use the previous slide's last frame.
        const prev = slideDataList[i - 1].frames;
        fromFrame = prev[prev.length - 1];
      }

      if (fromFrame) {
        const transFrames = generateTransitionFrames(
          slide.transition, fromFrame, frames[0], width, height, masterDuration,
        );
        allFrames.push(...transFrames);
        allDurations.push(...Array(transFrames.length).fill(masterDuration));
      }
    }

    allFrames.push(...frames);
    allDurations.push(...durations);
  }

  deck.precomputedFrames = allFrames;
  deck.precomputedDurations = allDurations;
  deck.durations = allDurations;
}

/**
 * Produces one raster per animation frame.
 * Returns a single-frame result if no Animation or Deck nodes are present.
 * @param {import('../core/Box.js').Box} root
 * @returns {{ frames: Uint8Array[], durations: number[] }}
 */
export function rasterizeFrames(root) {
  // Pass 1: walk the entire tree (including slide subtrees) to find all Animations and Decks.
  const allAnims = [];
  const decks = [];
  function walkAll(box) {
    if (box instanceof Deck) decks.push(box);
    else if (box instanceof Animation) allAnims.push(box);
    for (const child of box.children) walkAll(child);
  }
  walkAll(root);

  if (allAnims.length === 0 && decks.length === 0) {
    return { frames: [rasterize(root)], durations: [] };
  }

  // masterDuration = smallest Animation frame unit (default 50ms if none).
  const animDurations = allAnims.flatMap(a => a.durations);
  const masterDuration = animDurations.length > 0 ? Math.min(...animDurations) : 50;

  // Pass 2: pre-rasterize all Decks into flat frame sequences.
  for (const deck of decks) {
    preRasterizeDeck(deck, root, masterDuration);
  }

  // Pass 3: standard frame loop (collectAnimations skips pre-rasterized Deck subtrees).
  const animations = collectAnimations(root);

  if (animations.length === 0) {
    return { frames: [rasterize(root)], durations: [] };
  }

  const primary = animations[0];
  const primaryTotal = totalDuration(primary);
  const frameCount = Math.round(primaryTotal / masterDuration);

  const frames = [];
  for (let i = 0; i < frameCount; i++) {
    const t = i * masterDuration;
    for (const anim of animations) {
      anim.activeFrame = getActiveFrame(anim, t);
    }
    frames.push(rasterize(root));
  }

  for (const anim of animations) anim.activeFrame = 0;
  return { frames, durations: Array(frameCount).fill(masterDuration) };
}
