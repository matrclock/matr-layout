import { Animation } from './Animation.js';
import { Slide } from './Slide.js';

export class Deck extends Animation {
  static ownProps = new Set(['children']);

  constructor(props = {}) {
    super(props);
    this.durations = this.children.map(child =>
      child instanceof Slide ? (child.duration ?? 1000) : 1000
    );
    this.activeFrame = 0;
  }
}
