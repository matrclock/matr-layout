import { Box } from '../core/Box.js';
import { Text } from '../core/Text.js';
import { Padding } from '../core/Padding.js';
import { Animation } from '../core/Animation.js';
import { Deck } from '../core/Deck.js';
import { Slide } from '../core/Slide.js';
import { Raster } from '../core/Raster.js';
import { getFont, getFontCellHeight, getTextWidth, layoutText, renderGlyph, parseColor } from '../font/glyphFont.js';
import { resolveBox } from '../layout/dimensionResolver.js';
import { resolveStyles, StyleContext } from '../style/StyleContext.js';
import { positionTree } from '../layout/coordinateResolver.js';
import { fillRect, intersectClip } from './primitives.js';
import { generateTransitionFrames } from './transitions/index.js';

class RasterFrame extends Box {
  constructor(data, width, height) {
    super({ width, height });
    this.data = data; // Uint8Array RGBA
    this.resolved.width = width;
    this.resolved.height = height;
  }
}

function paintRasterFrame(box, buf, clip) {
  const { x, y, width, height } = box.resolved;
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const cx = x + px, cy = y + py;
      if (cx < clip.x || cx >= clip.x + clip.width) continue;
      if (cy < clip.y || cy >= clip.y + clip.height) continue;
      if (cx < 0 || cx >= buf.width || cy < 0 || cy >= buf.height) continue;
      const si = (py * width + px) * 4;
      const di = (cy * buf.width + cx) * 4;
      buf.data[di]     = box.data[si];
      buf.data[di + 1] = box.data[si + 1];
      buf.data[di + 2] = box.data[si + 2];
      buf.data[di + 3] = box.data[si + 3];
    }
  }
}

function paintAnimation(box, buf, clip) {
  const frame = box.children[box.activeFrame % Math.max(1, box.children.length)];
  if (frame) paint(frame, buf, clip);
}

function paintPadding(box, buf, clip) {
  const { x, y, width, height } = box.resolved;
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
}

function paintRaster(box, buf, clip) {
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
}

function paintText(box, buf, clip) {
  const { x, y, width, height, color } = box.resolved;
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

function paint(box, buf, parentClip) {
  const { x, y, width, height, fill } = box.resolved;

  const clip = intersectClip({ x, y, width, height }, parentClip);

  if (clip.width <= 0 || clip.height <= 0) return;

  if (box instanceof RasterFrame)                   return paintRasterFrame(box, buf, clip);
  if (box instanceof Animation)                     return paintAnimation(box, buf, clip);
  if (box instanceof Slide && box.children[0] instanceof RasterFrame) return paintAnimation(box, buf, clip);
  if (box instanceof Padding)                       return paintPadding(box, buf, clip);
  if (box instanceof Raster && box.pixels !== null) return paintRaster(box, buf, clip);

  if (fill !== null) {
    const [fr, fg, fb] = parseColor(fill);
    fillRect(buf, x, y, width, height, fr, fg, fb, clip);
  }

  if (box instanceof Text && box.content.length > 0) paintText(box, buf, clip);

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

// After pre-rasterization, skip recursing into a Deck's RasterFrame children.
function collectAnimations(root) {
  const list = [];
  function walk(box) {
    if (box instanceof Animation) {
      list.push(box);
      if (box instanceof Deck) return; // children are RasterFrames, nothing to walk
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

// Pre-rasterize a bare Slide's transition (not in a Deck) into a RasterFrame sequence.
// Generates transition frames followed by content frames that fill the outer slide's duration.
function preRasterizeBareSlide(innerSlide, outerDuration, root, masterDuration) {
  const { width, height } = root.resolved;
  const rootFill = root.resolved.fill;
  const clip = { x: 0, y: 0, width, height };

  const toBuf = { data: new Uint8Array(width * height * 4), width, height };
  if (rootFill) {
    const [r, g, b] = parseColor(rootFill);
    fillRect(toBuf, 0, 0, width, height, r, g, b, clip);
  }
  if (innerSlide.children[0]) paint(innerSlide.children[0], toBuf, clip);
  const toFrame = toBuf.data;

  const fromFrame = rasterizeBoxToFrame(innerSlide.transition.from, width, height, rootFill);
  const transFrames = generateTransitionFrames(
    innerSlide.transition, fromFrame, toFrame, width, height, masterDuration,
  );

  const allFrames = [...transFrames];
  const allDurations = Array(transFrames.length).fill(masterDuration);

  const transMs = transFrames.length * masterDuration;
  const contentCount = Math.max(1, Math.round((outerDuration - transMs) / masterDuration));
  for (let i = 0; i < contentCount; i++) allFrames.push(toFrame);
  allDurations.push(...Array(contentCount).fill(masterDuration));

  innerSlide.children = allFrames.map(f => new RasterFrame(f, width, height));
  innerSlide.durations = allDurations;
  innerSlide.activeFrame = 0;
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

  // Collect animated nodes within the slide subtree.
  // Bare Slides with a `transition.from` are pre-rasterized in place and treated as animations.
  const animations = [];
  function walkSlide(box) {
    if (box instanceof Animation) {
      animations.push(box);
      if (box instanceof Deck) return; // children are RasterFrames after pre-rasterization
    } else if (box instanceof Slide && box.transition?.from) {
      preRasterizeBareSlide(box, slide.duration, root, masterDuration);
      animations.push(box);
      return; // children are now RasterFrames
    }
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

  deck.children = allFrames.map(f => new RasterFrame(f, width, height));
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

  // Pass 2: pre-rasterize all Decks into flat frame sequences (inner-first).
  for (let i = decks.length - 1; i >= 0; i--) {
    preRasterizeDeck(decks[i], root, masterDuration);
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
