import { Box } from './Box.js';

export class Raster extends Box {
  static ownProps = new Set(['pixels', 'child']);

  constructor(props = {}) {
    const { pixels = null, child = null } = props;

    let derivedWidth = props.width;
    let derivedHeight = props.height;

    if (pixels) {
      if (derivedWidth === undefined)
        derivedWidth = pixels.reduce((max, row) => row ? Math.max(max, row.length) : max, 0);
      if (derivedHeight === undefined)
        derivedHeight = pixels.length;
    }

    if (child) {
      if (derivedWidth === undefined && child.widthSpec.type === 'px')
        derivedWidth = child.widthSpec.value;
      if (derivedHeight === undefined && child.heightSpec.type === 'px')
        derivedHeight = child.heightSpec.value;
    }

    super({ ...props, width: derivedWidth, height: derivedHeight, children: child ? [child] : [] });
    this.pixels = pixels;
  }
}
