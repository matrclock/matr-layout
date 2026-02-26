const DEFAULT_COLOR = '#FFFFFF';

export class StyleContext {
  constructor(color = null) {
    this.color = color;
  }

  /**
   * Returns a new context that merges explicitly-set styles from a box.
   * Only non-undefined explicit styles propagate to children.
   * @param {Object} explicitStyles - { color?, fill? }
   * @returns {StyleContext}
   */
  extend(explicitStyles) {
    return new StyleContext(
      'color' in explicitStyles ? explicitStyles.color : this.color,
    );
  }

  /**
   * Returns resolved { color, fill } for a box, applying its own explicit
   * styles over inherited context, falling back to global defaults.
   * @param {Object} explicitStyles - { color?, fill? }
   * @returns {{ color: string, fill: string }}
   */
  resolveFor(explicitStyles) {
    const color =
      ('color' in explicitStyles ? explicitStyles.color : null) ??
      this.color ??
      DEFAULT_COLOR;
    const fill = 'fill' in explicitStyles ? explicitStyles.fill : null;
    return { color, fill };
  }
}

/**
 * Walks the tree and resolves styles onto each box's `resolved` object.
 * @param {import('../core/Box.js').Box} box
 * @param {StyleContext} [parentCtx]
 */
export function resolveStyles(box, parentCtx = new StyleContext()) {
  const { color, fill } = parentCtx.resolveFor(box._explicitStyles);
  box.resolved.color = color;
  box.resolved.fill = fill;

  const childCtx = parentCtx.extend(box._explicitStyles);
  for (const child of box.children) {
    resolveStyles(child, childCtx);
  }
}
