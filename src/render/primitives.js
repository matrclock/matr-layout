// Pure pixel-math helpers shared across rasterizer and transitions.

export function fillRect(buf, x, y, w, h, r, g, b, clip) {
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

export function intersectClip(a, b) {
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
export function blitOffset(src, dst, width, height, offsetX, offsetY) {
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
export function pixelHash(x, y) {
  let h = (Math.imul(x, 1664525) + Math.imul(y, 1013904223)) | 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x45d9f3b);
  h ^= h >>> 16;
  return (h >>> 0) / 0x100000000;
}

// Ray-cast point-in-polygon for a 5-pointed star centered at (cx, cy) with given outerR.
export function pointInStar5(px, py, cx, cy, outerR) {
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
