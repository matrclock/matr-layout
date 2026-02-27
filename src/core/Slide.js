import { Box } from './Box.js';

export class Slide extends Box {
  static ownProps = new Set(['child', 'duration', 'transition']);

  constructor(props = {}) {
    const child = props.child ?? null;
    super({ ...props, children: child ? [child] : [] });
    this.duration = props.duration ?? 1000;
    this.transition = props.transition ?? null;
  }
}
