import { pixelHash, pointInStar5 } from '../primitives.js';

export function applyStarWipe(buf, fromFrame, toFrame, width, height, p) {
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
}

export function applyDissolve(buf, fromFrame, toFrame, width, height, p) {
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
}

export function applyCheckerboard(buf, fromFrame, toFrame, width, height, p) {
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
}

export function applyBlinds(buf, fromFrame, toFrame, width, height, p) {
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
