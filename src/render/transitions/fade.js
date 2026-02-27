export function applyFade(buf, fromFrame, toFrame, _width, _height, p) {
  for (let j = 0; j < buf.length; j += 4) {
    buf[j]     = Math.round(fromFrame[j]     * (1 - p) + toFrame[j]     * p);
    buf[j + 1] = Math.round(fromFrame[j + 1] * (1 - p) + toFrame[j + 1] * p);
    buf[j + 2] = Math.round(fromFrame[j + 2] * (1 - p) + toFrame[j + 2] * p);
    buf[j + 3] = 255;
  }
}
