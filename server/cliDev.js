import { buildScene } from '../src/demo/scene.js';
import { resolveStyles } from '../src/style/StyleContext.js';
import { resolveTree } from '../src/layout/dimensionResolver.js';
import { positionTree } from '../src/layout/coordinateResolver.js';
import { renderToTerminal } from '../src/render/terminalRenderer.js';

process.stdout.write('\x1b[?25l');

const root = buildScene();
resolveStyles(root);
resolveTree(root);
positionTree(root);
renderToTerminal(root);

process.on('SIGINT', () => {
  process.stdout.write('\x1b[?25h\n');
  process.exit(0);
});
