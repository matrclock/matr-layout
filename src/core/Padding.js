import { Box } from './Box.js';

function parsePad(p) {
  if (typeof p === 'number') {
    return { top: p, right: p, bottom: p, left: p };
  }
  if (p && typeof p === 'object') {
    return { top: p.top ?? 0, right: p.right ?? 0, bottom: p.bottom ?? 0, left: p.left ?? 0 };
  }
  return { top: 0, right: 0, bottom: 0, left: 0 };
}

export class Padding extends Box {
  constructor(props = {}) {
    const child = props.child ?? null;
    super({ children: child ? [child] : [] });
    this.pad = parsePad(props.padding);
    this.padColor = props.color ?? null;
  }
}
