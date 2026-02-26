import { Row } from '../core/Row.js';
import { Column } from '../core/Column.js';
import { Text } from '../core/Text.js';
import { getFont, getFontCellHeight } from '../font/glyphFont.js';

/**
 * Resolves dimensions for a single box given its allocated width and height.
 * Recursively resolves children.
 * @param {import('../core/Box.js').Box} box
 * @param {number} availableWidth
 * @param {number} availableHeight
 */
export function resolveBox(box, availableWidth, availableHeight) {
  // Resolve own dimensions from specs.
  const width = resolveDim(box.widthSpec, availableWidth);
  const height = resolveDim(box.heightSpec, availableHeight);

  box.resolved.width = width;

  // Text with neutral height → single-line, use font cell height.
  if (box instanceof Text && box.heightSpec.type === 'neutral') {
    box.resolved.height = getFontCellHeight(getFont(box.fontName));
  } else {
    box.resolved.height = height;
  }

  if (box.children.length === 0) return;

  if (box instanceof Row) {
    allocateChildren(box, box.resolved.width, box.resolved.height, 'horizontal');
  } else if (box instanceof Column) {
    allocateChildren(box, box.resolved.width, box.resolved.height, 'vertical');
  } else {
    // Generic box: children get full parent space, no stacking.
    for (const child of box.children) {
      resolveBox(child, box.resolved.width, box.resolved.height);
    }
  }
}

/**
 * Runs the 3-phase allocation on children of a Row or Column.
 */
function allocateChildren(box, width, height, axis) {
  const children = box.children;
  const primaryParent = axis === 'horizontal' ? width : height;
  const secondaryParent = axis === 'horizontal' ? height : width;

  // Phase 1: Claim — compute fixed sizes, track remaining.
  let remaining = primaryParent;
  let neutralCount = 0;

  for (const child of children) {
    const spec = axis === 'horizontal' ? child.widthSpec : child.heightSpec;
    if (spec.type === 'px') {
      remaining -= spec.value;
    } else if (spec.type === 'pct') {
      remaining -= Math.floor((spec.value / 100) * primaryParent);
    } else {
      neutralCount++;
    }
  }

  // Phase 2: Greedy — divide remaining equally among neutral children.
  const greedySize = neutralCount > 0 ? Math.floor(remaining / neutralCount) : 0;

  // Phase 3: Recurse — assign resolved primary size and recurse.
  for (const child of children) {
    const spec = axis === 'horizontal' ? child.widthSpec : child.heightSpec;

    let primarySize;
    if (spec.type === 'px') {
      primarySize = spec.value;
    } else if (spec.type === 'pct') {
      primarySize = Math.floor((spec.value / 100) * primaryParent);
    } else {
      primarySize = greedySize;
    }

    // Resolve secondary axis for the child.
    const secondarySpec = axis === 'horizontal' ? child.heightSpec : child.widthSpec;
    let secondarySize;
    if (secondarySpec.type === 'px') {
      secondarySize = secondarySpec.value;
    } else if (secondarySpec.type === 'pct') {
      secondarySize = Math.floor((secondarySpec.value / 100) * secondaryParent);
    } else {
      secondarySize = secondaryParent;
    }

    const childWidth = axis === 'horizontal' ? primarySize : secondarySize;
    const childHeight = axis === 'horizontal' ? secondarySize : primarySize;

    resolveBox(child, childWidth, childHeight);
  }
}

/**
 * Resolves a single dimension spec to a pixel value.
 */
function resolveDim(spec, available) {
  if (spec.type === 'px') return spec.value;
  if (spec.type === 'pct') return Math.floor((spec.value / 100) * available);
  return available; // neutral at top level → fill available
}

/**
 * Entry point: resolve dimensions starting from the root.
 * @param {import('../core/Box.js').Box} root
 */
export function resolveTree(root) {
  resolveBox(root, root.resolved.width, root.resolved.height);
}
