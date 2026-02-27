import { blitOffset } from '../primitives.js';

export function applySlideLeft(buf, fromFrame, toFrame, width, height, p) {
  const offset = Math.round(p * width);
  blitOffset(fromFrame, buf, width, height, -offset, 0);
  blitOffset(toFrame,   buf, width, height, width - offset, 0);
}

export function applySlideRight(buf, fromFrame, toFrame, width, height, p) {
  const offset = Math.round(p * width);
  blitOffset(fromFrame, buf, width, height, offset, 0);
  blitOffset(toFrame,   buf, width, height, offset - width, 0);
}

export function applySlideUp(buf, fromFrame, toFrame, width, height, p) {
  const offset = Math.round(p * height);
  blitOffset(fromFrame, buf, width, height, 0, -offset);
  blitOffset(toFrame,   buf, width, height, 0, height - offset);
}

export function applySlideDown(buf, fromFrame, toFrame, width, height, p) {
  const offset = Math.round(p * height);
  blitOffset(fromFrame, buf, width, height, 0, offset);
  blitOffset(toFrame,   buf, width, height, 0, offset - height);
}
