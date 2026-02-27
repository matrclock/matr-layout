import { Box } from './Box.js';

export class Animation extends Box {
  static ownProps = new Set(['duration', 'children']);

  constructor(props = {}) {
    super(props);
    const d = props.duration ?? 1000;
    this.durations = Array(this.children.length).fill(d);
    this.activeFrame = 0;
  }
}
