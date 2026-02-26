import { Box } from './Box.js';

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
}
