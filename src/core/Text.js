import { Box } from './Box.js';

export class Text extends Box {
  constructor(props = {}) {
    super(props);
    this.content = props.content ?? '';
  }

  defaultWidthSpec() {
    return undefined; // neutral
  }

  defaultHeightSpec() {
    return undefined; // neutral → resolved to FONT_HEIGHT by dimension resolver
  }
}
