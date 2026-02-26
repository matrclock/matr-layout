import { rasterize } from './rasterizer.js';

const SCALE = 20;

function toHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

/**
 * Renders the entire box tree onto an HTML Canvas element with round pixels.
 * Each logical pixel is drawn as a filled circle at SCALE× magnification.
 * @param {import('../core/Box.js').Box} root
 * @param {HTMLCanvasElement} canvas
 */
export function renderTree(root, canvas) {
  const { width, height } = root.resolved;
  const pixels = rasterize(root);

  canvas.width = width * SCALE;
  canvas.height = height * SCALE;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const radius = SCALE / 2 - 3;
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const i = (py * width + px) * 4;
      if (pixels[i + 3] === 0) continue;
      ctx.fillStyle = toHex(pixels[i], pixels[i + 1], pixels[i + 2]);
      ctx.beginPath();
      ctx.arc(px * SCALE + radius, py * SCALE + radius, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
