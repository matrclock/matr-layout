import _10x20           from '../glyphs/10x20.json'            with { type: 'json' };
import _4x6             from '../glyphs/4x6.json'              with { type: 'json' };
import _5x7             from '../glyphs/5x7.json'              with { type: 'json' };
import _5x8             from '../glyphs/5x8.json'              with { type: 'json' };
import _6x10            from '../glyphs/6x10.json'             with { type: 'json' };
import _6x10_rounded    from '../glyphs/6x10-rounded.json'     with { type: 'json' };
import _6x12            from '../glyphs/6x12.json'             with { type: 'json' };
import _6x13            from '../glyphs/6x13.json'             with { type: 'json' };
import _6x13B           from '../glyphs/6x13B.json'            with { type: 'json' };
import _6x13O           from '../glyphs/6x13O.json'            with { type: 'json' };
import _6x9             from '../glyphs/6x9.json'              with { type: 'json' };
import _7Segments_26x42 from '../glyphs/7Segments_26x42.json'  with { type: 'json' };
import _7x13            from '../glyphs/7x13.json'             with { type: 'json' };
import _7x13B           from '../glyphs/7x13B.json'            with { type: 'json' };
import _7x13O           from '../glyphs/7x13O.json'            with { type: 'json' };
import _7x14            from '../glyphs/7x14.json'             with { type: 'json' };
import _7x14B           from '../glyphs/7x14B.json'            with { type: 'json' };
import _8x13            from '../glyphs/8x13.json'             with { type: 'json' };
import _8x13B           from '../glyphs/8x13B.json'            with { type: 'json' };
import _8x13O           from '../glyphs/8x13O.json'            with { type: 'json' };
import _9x15            from '../glyphs/9x15.json'             with { type: 'json' };
import _9x15B           from '../glyphs/9x15B.json'            with { type: 'json' };
import _9x18            from '../glyphs/9x18.json'             with { type: 'json' };
import _9x18B           from '../glyphs/9x18B.json'            with { type: 'json' };
import CG_pixel_3x5_mono from '../glyphs/CG-pixel-3x5-mono.json' with { type: 'json' };
import CG_pixel_4x5_mono from '../glyphs/CG-pixel-4x5-mono.json' with { type: 'json' };
import Dina_r400_6      from '../glyphs/Dina_r400-6.json'      with { type: 'json' };
import profont10        from '../glyphs/profont10.json'         with { type: 'json' };
import profont11        from '../glyphs/profont11.json'         with { type: 'json' };
import profont12        from '../glyphs/profont12.json'         with { type: 'json' };
import profont15        from '../glyphs/profont15.json'         with { type: 'json' };
import profont17        from '../glyphs/profont17.json'         with { type: 'json' };
import profont22        from '../glyphs/profont22.json'         with { type: 'json' };
import profont29        from '../glyphs/profont29.json'         with { type: 'json' };
import spleen_5x8       from '../glyphs/spleen-5x8.json'       with { type: 'json' };
import spleen_6x12      from '../glyphs/spleen-6x12.json'      with { type: 'json' };
import spleen_8x16      from '../glyphs/spleen-8x16.json'      with { type: 'json' };
import spleen_12x24     from '../glyphs/spleen-12x24.json'     with { type: 'json' };
import spleen_16x32     from '../glyphs/spleen-16x32.json'     with { type: 'json' };
import spleen_32x64     from '../glyphs/spleen-32x64.json'     with { type: 'json' };
import streamline_all   from '../glyphs/streamline_all.json'   with { type: 'json' };
import tb_8             from '../glyphs/tb-8.json'             with { type: 'json' };
import Tiny5_Bold       from '../glyphs/Tiny5-Bold.json'       with { type: 'json' };
import Tiny5_Regular    from '../glyphs/Tiny5-Regular.json'    with { type: 'json' };
import tom_thumb        from '../glyphs/tom-thumb.json'        with { type: 'json' };

const FONT_REGISTRY = new Map([
  ['10x20',             _10x20],
  ['4x6',               _4x6],
  ['5x7',               _5x7],
  ['5x8',               _5x8],
  ['6x10',              _6x10],
  ['6x10-rounded',      _6x10_rounded],
  ['6x12',              _6x12],
  ['6x13',              _6x13],
  ['6x13B',             _6x13B],
  ['6x13O',             _6x13O],
  ['6x9',               _6x9],
  ['7Segments_26x42',   _7Segments_26x42],
  ['7x13',              _7x13],
  ['7x13B',             _7x13B],
  ['7x13O',             _7x13O],
  ['7x14',              _7x14],
  ['7x14B',             _7x14B],
  ['8x13',              _8x13],
  ['8x13B',             _8x13B],
  ['8x13O',             _8x13O],
  ['9x15',              _9x15],
  ['9x15B',             _9x15B],
  ['9x18',              _9x18],
  ['9x18B',             _9x18B],
  ['CG-pixel-3x5-mono', CG_pixel_3x5_mono],
  ['CG-pixel-4x5-mono', CG_pixel_4x5_mono],
  ['Dina_r400-6',       Dina_r400_6],
  ['profont10',         profont10],
  ['profont11',         profont11],
  ['profont12',         profont12],
  ['profont15',         profont15],
  ['profont17',         profont17],
  ['profont22',         profont22],
  ['profont29',         profont29],
  ['spleen-5x8',        spleen_5x8],
  ['spleen-6x12',       spleen_6x12],
  ['spleen-8x16',       spleen_8x16],
  ['spleen-12x24',      spleen_12x24],
  ['spleen-16x32',      spleen_16x32],
  ['spleen-32x64',      spleen_32x64],
  ['streamline_all',    streamline_all],
  ['tb-8',              tb_8],
  ['Tiny5-Bold',        Tiny5_Bold],
  ['Tiny5-Regular',     Tiny5_Regular],
  ['tom-thumb',         tom_thumb],
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
