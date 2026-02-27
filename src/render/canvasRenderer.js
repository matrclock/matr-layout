import { rasterize } from './rasterizer.js';

const SCALE = 20;

function toHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

/**
 * Renders a pre-rasterized RGBA buffer onto an HTML Canvas element.
 * @param {Uint8Array} buf
 * @param {number} width
 * @param {number} height
 * @param {HTMLCanvasElement} canvas
 */
export function renderBuffer(buf, width, height, canvas) {
  canvas.width = width * SCALE;
  canvas.height = height * SCALE;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const radius = SCALE / 2 - 3;
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const i = (py * width + px) * 4;
      if (buf[i + 3] === 0) continue;
      ctx.fillStyle = toHex(buf[i], buf[i + 1], buf[i + 2]);
      ctx.beginPath();
      ctx.arc(px * SCALE + radius, py * SCALE + radius, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Renders the entire box tree onto an HTML Canvas element with round pixels.
 * Each logical pixel is drawn as a filled circle at SCALE× magnification.
 * @param {import('../core/Box.js').Box} root
 * @param {HTMLCanvasElement} canvas
 */
export function renderTree(root, canvas) {
  const { width, height } = root.resolved;
  renderBuffer(rasterize(root), width, height, canvas);
}
