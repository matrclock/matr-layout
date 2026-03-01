import { resolveStyles } from '../src/style/StyleContext.js';
import { resolveTree } from '../src/layout/dimensionResolver.js';
import { positionTree } from '../src/layout/coordinateResolver.js';
import { rasterizeFrames } from '../src/render/rasterizer.js';
import { renderBufferToTerminal } from '../src/render/terminalRenderer.js';

const sceneName = process.argv[2] ?? 'scene';
const { buildScene } = await import(`../src/demo/${sceneName}.js`);

process.stdout.write('\x1b[?25l');

const root = buildScene();
resolveStyles(root);
resolveTree(root);
positionTree(root);

const { width, height } = root.resolved;
const { frames, durations } = rasterizeFrames(root);

renderBufferToTerminal(frames[0], width, height);

if (frames.length > 1) {
  let i = 0;
  function schedule() {
    setTimeout(() => {
      i = (i + 1) % frames.length;
      renderBufferToTerminal(frames[i], width, height);
      schedule();
    }, durations[i]);
  }
  schedule();
}

process.on('SIGINT', () => {
  process.stdout.write('\x1b[?25h\n');
  process.exit(0);
});
