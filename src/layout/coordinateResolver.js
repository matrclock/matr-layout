import { Row } from '../core/Row.js';
import { Column } from '../core/Column.js';
import { Padding } from '../core/Padding.js';

/**
 * Computes the starting offset for children based on alignment.
 * @param {'start'|'center'|'end'} align
 * @param {number} available - remaining space after all children are sized
 * @returns {number}
 */
function alignmentOffset(align, available) {
  if (available <= 0) return 0;
  if (align === 'center') return Math.floor(available / 2);
  if (align === 'end') return available;
  return 0; // 'start'
}

function applyExplicitPosition(child, parent) {
  if (child.leftSpec && child.leftSpec.type !== 'neutral') {
    const val = child.leftSpec.type === 'px'
      ? child.leftSpec.value
      : Math.floor((child.leftSpec.value / 100) * parent.resolved.width);
    child.resolved.x = parent.resolved.x + val;
  }
  if (child.topSpec && child.topSpec.type !== 'neutral') {
    const val = child.topSpec.type === 'px'
      ? child.topSpec.value
      : Math.floor((child.topSpec.value / 100) * parent.resolved.height);
    child.resolved.y = parent.resolved.y + val;
  }
}

/**
 * Positions a box's children using the resolved dimensions.
 * @param {import('../core/Box.js').Box} box
 */
function positionChildren(box) {
  const children = box.children;
  if (children.length === 0) return;

  const isRow = box instanceof Row;
  const isColumn = box instanceof Column;

  if (isRow || isColumn) {
    const axis = isRow ? 'horizontal' : 'vertical';

    // Sum of children primary-axis dimensions.
    const primaryTotal = children.reduce(
      (sum, c) => sum + (axis === 'horizontal' ? c.resolved.width : c.resolved.height),
      0,
    );

    const parentPrimary = axis === 'horizontal' ? box.resolved.width : box.resolved.height;
    const available = parentPrimary - primaryTotal;
    const offset = alignmentOffset(box.align, available);

    let cursor = (axis === 'horizontal' ? box.resolved.x : box.resolved.y) + offset;

    for (const child of children) {
      if (axis === 'horizontal') {
        child.resolved.x = cursor;
        child.resolved.y = box.resolved.y;
        cursor += child.resolved.width;
      } else {
        child.resolved.x = box.resolved.x;
        child.resolved.y = cursor;
        cursor += child.resolved.height;
      }

      applyExplicitPosition(child, box);
      positionChildren(child);
    }
  } else if (box instanceof Padding) {
    const { top, left } = box.pad;
    for (const child of children) {
      child.resolved.x = box.resolved.x + left;
      child.resolved.y = box.resolved.y + top;
      applyExplicitPosition(child, box);
      positionChildren(child);
    }
  } else {
    // Generic box: children inherit parent origin.
    for (const child of children) {
      child.resolved.x = box.resolved.x;
      child.resolved.y = box.resolved.y;
      applyExplicitPosition(child, box);
      positionChildren(child);
    }
  }
}

/**
 * Entry point: walk tree and set absolute x/y for all boxes.
 * @param {import('../core/Box.js').Box} root
 */
export function positionTree(root) {
  root.resolved.x = 0;
  root.resolved.y = 0;
  positionChildren(root);
}
