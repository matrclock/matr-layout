// Phase 1 (p<0.5): fromFrame compresses toward pivot edge.
// Phase 2 (p>=0.5): toFrame expands from pivot edge.

export function applyFlipLeft(buf, fromFrame, toFrame, width, height, p) {
  const phase2 = p >= 0.5;
  const src = phase2 ? toFrame : fromFrame;
  const scale = phase2 ? (2 * p - 1) : (1 - 2 * p);
  const visW = Math.round(scale * width);
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const di = (py * width + px) * 4;
      if (visW <= 0 || px >= visW) continue;
      const srcX = Math.round((px / visW) * (width - 1));
      const si = (py * width + srcX) * 4;
      buf[di] = src[si]; buf[di+1] = src[si+1]; buf[di+2] = src[si+2]; buf[di+3] = 255;
    }
  }
}

export function applyFlipRight(buf, fromFrame, toFrame, width, height, p) {
  const phase2 = p >= 0.5;
  const src = phase2 ? toFrame : fromFrame;
  const scale = phase2 ? (2 * p - 1) : (1 - 2 * p);
  const visW = Math.round(scale * width);
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const di = (py * width + px) * 4;
      if (visW <= 0 || px < width - visW) continue;
      const srcX = Math.round(((px - (width - visW)) / visW) * (width - 1));
      const si = (py * width + srcX) * 4;
      buf[di] = src[si]; buf[di+1] = src[si+1]; buf[di+2] = src[si+2]; buf[di+3] = 255;
    }
  }
}

export function applyFlipUp(buf, fromFrame, toFrame, width, height, p) {
  const phase2 = p >= 0.5;
  const src = phase2 ? toFrame : fromFrame;
  const scale = phase2 ? (2 * p - 1) : (1 - 2 * p);
  const visH = Math.round(scale * height);
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const di = (py * width + px) * 4;
      if (visH <= 0 || py >= visH) continue;
      const srcY = Math.round((py / visH) * (height - 1));
      const si = (srcY * width + px) * 4;
      buf[di] = src[si]; buf[di+1] = src[si+1]; buf[di+2] = src[si+2]; buf[di+3] = 255;
    }
  }
}

export function applyFlipDown(buf, fromFrame, toFrame, width, height, p) {
  const phase2 = p >= 0.5;
  const src = phase2 ? toFrame : fromFrame;
  const scale = phase2 ? (2 * p - 1) : (1 - 2 * p);
  const visH = Math.round(scale * height);
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const di = (py * width + px) * 4;
      if (visH <= 0 || py < height - visH) continue;
      const srcY = Math.round(((py - (height - visH)) / visH) * (height - 1));
      const si = (srcY * width + px) * 4;
      buf[di] = src[si]; buf[di+1] = src[si+1]; buf[di+2] = src[si+2]; buf[di+3] = 255;
    }
  }
}
