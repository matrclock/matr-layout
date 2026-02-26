/**
 * Parses a dimension value into a tagged union.
 * @param {number|string|undefined} value
 * @returns {{ type: 'px'|'pct'|'neutral', value?: number }}
 */
export function parseDim(value) {
  if (value === undefined || value === null) {
    return { type: 'neutral' };
  }
  if (typeof value === 'number') {
    return { type: 'px', value };
  }
  if (typeof value === 'string') {
    if (value.endsWith('%')) {
      return { type: 'pct', value: parseFloat(value) };
    }
    if (value.endsWith('px')) {
      return { type: 'px', value: parseFloat(value) };
    }
    const n = parseFloat(value);
    if (!isNaN(n)) {
      return { type: 'px', value: n };
    }
  }
  return { type: 'neutral' };
}

export class Box {
  constructor(props = {}) {
    this.children = props.children ?? [];

    this.widthSpec = parseDim(props.width ?? this.defaultWidthSpec());
    this.heightSpec = parseDim(props.height ?? this.defaultHeightSpec());

    // Only track styles that were explicitly provided by the caller.
    this._explicitStyles = {};
    if ('color' in props) this._explicitStyles.color = props.color;
    if ('fill' in props) this._explicitStyles.fill = props.fill;

    // align prop for Row/Column (default: 'start')
    this.align = props.align ?? 'start';

    // Resolved values written by layout passes, read by renderer.
    this.resolved = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      color: '#FFFFFF',
      fill: '#000000',
    };
  }

  /** Override in subclasses to provide default width dimension spec value. */
  defaultWidthSpec() {
    return undefined;
  }

  /** Override in subclasses to provide default height dimension spec value. */
  defaultHeightSpec() {
    return undefined;
  }
}
