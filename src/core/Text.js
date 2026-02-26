import { Box } from './Box.js';

export class Text extends Box {
  static ownProps = new Set(['content', 'font']);

  constructor(props = {}) {
    super(props);
    this.content = props.content ?? '';
    this.fontName = props.font ?? 'Tiny5-Regular';
  }

  defaultWidthSpec() {
    return undefined; // neutral
  }

  defaultHeightSpec() {
    return undefined; // neutral → resolved to FONT_HEIGHT by dimension resolver
  }
}
