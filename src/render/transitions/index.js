import { applyFade } from './fade.js';
import { applySlideLeft, applySlideRight, applySlideUp, applySlideDown } from './slide.js';
import { applyWipeRight, applyWipeLeft, applyWipeDown, applyWipeUp } from './wipe.js';
import { applyFlipLeft, applyFlipRight, applyFlipUp, applyFlipDown } from './flip.js';
import { applyStarWipe, applyDissolve, applyCheckerboard, applyBlinds } from './misc.js';

const TRANSITION_HANDLERS = {
  fade:         applyFade,
  slideLeft:    applySlideLeft,
  slideRight:   applySlideRight,
  slideUp:      applySlideUp,
  slideDown:    applySlideDown,
  wipeRight:    applyWipeRight,
  wipeLeft:     applyWipeLeft,
  wipeDown:     applyWipeDown,
  wipeUp:       applyWipeUp,
  flipLeft:     applyFlipLeft,
  flipRight:    applyFlipRight,
  flipUp:       applyFlipUp,
  flipDown:     applyFlipDown,
  starWipe:     applyStarWipe,
  dissolve:     applyDissolve,
  checkerboard: applyCheckerboard,
  blinds:       applyBlinds,
};

export function generateTransitionFrames(transition, fromFrame, toFrame, width, height, masterDuration) {
  const delayFrames = Math.round((transition.delay ?? 0) / masterDuration);
  const transFrames = Math.max(1, Math.round(transition.duration / masterDuration));
  const handler = TRANSITION_HANDLERS[transition.type];
  if (!handler) return [];
  const frames = [];
  for (let i = 0; i < delayFrames; i++) frames.push(fromFrame);
  for (let i = 0; i < transFrames; i++) {
    const p = (i + 1) / transFrames; // 0 < p <= 1
    const buf = new Uint8Array(width * height * 4);
    handler(buf, fromFrame, toFrame, width, height, p);
    frames.push(buf);
  }
  return frames;
}
