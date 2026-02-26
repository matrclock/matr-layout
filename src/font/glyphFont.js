import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const FONT_REGISTRY = new Map([
  ['10x20',             require('../glyphs/10x20.json')],
  ['4x6',               require('../glyphs/4x6.json')],
  ['5x7',               require('../glyphs/5x7.json')],
  ['5x8',               require('../glyphs/5x8.json')],
  ['6x10',              require('../glyphs/6x10.json')],
  ['6x10-rounded',      require('../glyphs/6x10-rounded.json')],
  ['6x12',              require('../glyphs/6x12.json')],
  ['6x13',              require('../glyphs/6x13.json')],
  ['6x13B',             require('../glyphs/6x13B.json')],
  ['6x13O',             require('../glyphs/6x13O.json')],
  ['6x9',               require('../glyphs/6x9.json')],
  ['7Segments_26x42',   require('../glyphs/7Segments_26x42.json')],
  ['7x13',              require('../glyphs/7x13.json')],
  ['7x13B',             require('../glyphs/7x13B.json')],
  ['7x13O',             require('../glyphs/7x13O.json')],
  ['7x14',              require('../glyphs/7x14.json')],
  ['7x14B',             require('../glyphs/7x14B.json')],
  ['8x13',              require('../glyphs/8x13.json')],
  ['8x13B',             require('../glyphs/8x13B.json')],
  ['8x13O',             require('../glyphs/8x13O.json')],
  ['9x15',              require('../glyphs/9x15.json')],
  ['9x15B',             require('../glyphs/9x15B.json')],
  ['9x18',              require('../glyphs/9x18.json')],
  ['9x18B',             require('../glyphs/9x18B.json')],
  ['CG-pixel-3x5-mono', require('../glyphs/CG-pixel-3x5-mono.json')],
  ['CG-pixel-4x5-mono', require('../glyphs/CG-pixel-4x5-mono.json')],
  ['Dina_r400-6',       require('../glyphs/Dina_r400-6.json')],
  ['profont10',         require('../glyphs/profont10.json')],
  ['profont11',         require('../glyphs/profont11.json')],
  ['profont12',         require('../glyphs/profont12.json')],
  ['profont15',         require('../glyphs/profont15.json')],
  ['profont17',         require('../glyphs/profont17.json')],
  ['profont22',         require('../glyphs/profont22.json')],
  ['profont29',         require('../glyphs/profont29.json')],
  ['spleen-5x8',        require('../glyphs/spleen-5x8.json')],
  ['spleen-6x12',       require('../glyphs/spleen-6x12.json')],
  ['spleen-8x16',       require('../glyphs/spleen-8x16.json')],
  ['spleen-12x24',      require('../glyphs/spleen-12x24.json')],
  ['spleen-16x32',      require('../glyphs/spleen-16x32.json')],
  ['spleen-32x64',      require('../glyphs/spleen-32x64.json')],
  ['streamline_all',    require('../glyphs/streamline_all.json')],
  ['tb-8',              require('../glyphs/tb-8.json')],
  ['Tiny5-Bold',        require('../glyphs/Tiny5-Bold.json')],
  ['Tiny5-Regular',     require('../glyphs/Tiny5-Regular.json')],
  ['tom-thumb',         require('../glyphs/tom-thumb.json')],
]);

export const DEFAULT_FONT_NAME = 'Tiny5-Regular';

export function registerFont(name, data) {
  FONT_REGISTRY.set(name, data);
}

export function getFont(name) {
  const font = FONT_REGISTRY.get(name);
  if (!font) throw new Error(`Font "${name}" not registered. Call registerFont() first.`);
  return font;
}

/** Cell height = number of bitmap rows in the first glyph. */
export function getFontCellHeight(font) {
  const firstGlyph = Object.values(font)[0];
  return firstGlyph ? firstGlyph.bitmap.length : 8;
}

function getGlyphAdvance(glyph) {
  return glyph.width + 1;
}

/** Total pixel width of a string in a given font (no trailing gap). */
export function getTextWidth(text, font) {
  let w = 0;
  for (const ch of text) {
    const glyph = font[ch];
    if (glyph) w += getGlyphAdvance(glyph);
  }
  return Math.max(0, w - 1);
}

/** Word-wrap content to fit boxWidth; returns array of lines. */
export function layoutText(content, boxWidth, multiLine, font) {
  if (!multiLine) return [content];

  const spaceGlyph = font[' '];
  const spaceAdv = spaceGlyph ? getGlyphAdvance(spaceGlyph) : 3;
  const words = content.split(' ');
  const lines = [];
  let currentLine = '';
  let currentWidth = 0;

  for (const word of words) {
    const wordWidth = getTextWidth(word, font);
    if (currentLine.length === 0) {
      currentLine = word;
      currentWidth = wordWidth;
    } else if (currentWidth + spaceAdv + wordWidth <= boxWidth) {
      currentLine += ' ' + word;
      currentWidth += spaceAdv + wordWidth;
    } else {
      lines.push(currentLine);
      currentLine = word;
      currentWidth = wordWidth;
    }
  }

  if (currentLine.length > 0) lines.push(currentLine);
  return lines;
}

/**
 * Renders a single glyph into buf. Returns the advance width.
 * @returns {number} pixels to advance charX
 */
export function renderGlyph(buf, char, x, y, r, g, b, clip, font) {
  const glyph = font[char];
  if (!glyph) return 0;

  const { bitmap, xOffset = 0 } = glyph;
  const { width: bufWidth, height: bufHeight, data } = buf;
  const clipRight = clip.x + clip.width;
  const clipBottom = clip.y + clip.height;

  for (let row = 0; row < bitmap.length; row++) {
    const py = y + row;
    if (py < clip.y || py >= clipBottom || py < 0 || py >= bufHeight) continue;
    const bitmapRow = bitmap[row];
    for (let col = 0; col < bitmapRow.length; col++) {
      if (!bitmapRow[col]) continue;
      const px = x + col + xOffset;
      if (px < clip.x || px >= clipRight || px < 0 || px >= bufWidth) continue;
      const i = (py * bufWidth + px) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }

  return getGlyphAdvance(glyph);
}

/** Parses a CSS hex color string into [r, g, b]. */
export function parseColor(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}
