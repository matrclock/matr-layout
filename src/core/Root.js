import { BitmapImage, GifFrame } from 'gifwrap';
import { Box } from './Box.js';
import { resolveStyles } from '../style/StyleContext.js';
import { resolveTree } from '../layout/dimensionResolver.js';
import { positionTree } from '../layout/coordinateResolver.js';
import { rasterizeFrames } from '../render/rasterizer.js';

export class Root extends Box {
  constructor(props = {}) {
    super(props);

    if (this.widthSpec.type !== 'px') {
      throw new Error('Root requires an explicit pixel width');
    }
    if (this.heightSpec.type !== 'px') {
      throw new Error('Root requires an explicit pixel height');
    }

    // Root starts at origin with fixed dimensions.
    this.resolved.x = 0;
    this.resolved.y = 0;
    this.resolved.width = this.widthSpec.value;
    this.resolved.height = this.heightSpec.value;
  }

  toGifFrames() {
    resolveStyles(this);
    resolveTree(this);
    positionTree(this);
    const { width, height } = this.resolved;
    const { frames, durations } = rasterizeFrames(this);
    return frames.map((frameData, i) => {
      const bmp = new BitmapImage({ width, height, data: Buffer.from(frameData) });
      const delayCentisecs = durations[i] ? Math.round(durations[i] / 10) : 100;
      return new GifFrame(bmp, { delayCentisecs });
    });
  }
}
