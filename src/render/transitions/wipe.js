export function applyWipeRight(buf, fromFrame, toFrame, width, height, p) {
  const boundary = Math.round(p * width);
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const idx = (py * width + px) * 4;
      const src = px < boundary ? toFrame : fromFrame;
      buf[idx] = src[idx]; buf[idx+1] = src[idx+1]; buf[idx+2] = src[idx+2]; buf[idx+3] = 255;
    }
  }
}

export function applyWipeLeft(buf, fromFrame, toFrame, width, height, p) {
  const boundary = Math.round((1 - p) * width);
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const idx = (py * width + px) * 4;
      const src = px >= boundary ? toFrame : fromFrame;
      buf[idx] = src[idx]; buf[idx+1] = src[idx+1]; buf[idx+2] = src[idx+2]; buf[idx+3] = 255;
    }
  }
}

export function applyWipeDown(buf, fromFrame, toFrame, width, height, p) {
  const boundary = Math.round(p * height);
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const idx = (py * width + px) * 4;
      const src = py < boundary ? toFrame : fromFrame;
      buf[idx] = src[idx]; buf[idx+1] = src[idx+1]; buf[idx+2] = src[idx+2]; buf[idx+3] = 255;
    }
  }
}

export function applyWipeUp(buf, fromFrame, toFrame, width, height, p) {
  const boundary = Math.round((1 - p) * height);
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const idx = (py * width + px) * 4;
      const src = py >= boundary ? toFrame : fromFrame;
      buf[idx] = src[idx]; buf[idx+1] = src[idx+1]; buf[idx+2] = src[idx+2]; buf[idx+3] = 255;
    }
  }
}
