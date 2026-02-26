import { rasterize } from './rasterizer.js';

const SCALE = 1;

let firstRender = true;

/**
 * Renders the box tree to the terminal using ANSI true-colour escape codes.
 * @param {import('../core/Box.js').Box} root
 */
export function renderToTerminal(root) {
  const { width, height } = root.resolved;
  const pixels = rasterize(root);

  const cols = Math.floor(width / SCALE);
  const rows = Math.floor(height / SCALE);
  const halfScale = Math.floor(SCALE / 2);

  let out = firstRender ? '\x1b[2J\x1b[H' : '\x1b[H';
  firstRender = false;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const px = col * SCALE + halfScale;
      const py = row * SCALE + halfScale;
      const i = (py * width + px) * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      out += `\x1b[38;2;${r};${g};${b}m● `;
    }
    out += '\x1b[0m\n';
  }

  process.stdout.write(out);
}
