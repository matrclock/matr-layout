# Layout Engine: Master Design Document

## 1. Core Architecture

The system is built on a tree of **Box** objects. All components inherit from the base Box class.

### **The Base Box Class**

* **Geometric Properties:** `x`, `y` (coordinates), `width`, `height` (dimensions). All are optional.
* **Coordinate System:** Absolute **Top-Left (0,0)** origin.
* **Hierarchy:** Each box maintains a list of `children`.
* **Z-Order:** Painter’s Algorithm (rendering follows the list index; higher indices are drawn on top).

### **Visual Style Properties**

* **Attributes:** `Color` (Foreground/Text) and `Fill` (Background).
* **Defaults:** `Color: #FFFFFF` (White), `Fill: #000000` (Black).
* **Inheritance Logic:**
* **User-Defined:** Styles explicitly set by the user are **inherited** by all descendants.
* **Default-Isolation:** Default styles of a box type are **local**; they are not passed to children.
* **Priority:** Local explicit overrides > Parent Inheritance > Global Defaults.



---

## 2. Specialized Box Types

| Type | Dimension Logic | Unique Behavior |
| --- | --- | --- |
| **Root** | **Required** (Fixed W/H) | No position; defines the global clipping boundary. |
| **Column** | Defaults to 100% Parent | Primary axis: Vertical. Children stack top-to-bottom. |
| **Row** | Defaults to 100% Parent | Primary axis: Horizontal. Children stack left-to-right. |
| **Text** | Varies (see Section 4) | Displays bitmap font content. |

---

## 3. Space Allocation & Alignment

### **Dimension Units**

* **Pixels (px):** Absolute size.
* **Percentages (%):** Relative to Parent's size.
* **Neutral:** Undefined; participates in "Greedy" distribution.

### **The Allocation Algorithm**

1. **Claim Phase:** Subtract Fixed and Percentage child sizes from the Parent's total primary axis.
2. **Greedy Phase:** Divide the remaining space equally among all **Neutral** children.
3. **Position Phase:** Calculate child `X/Y` by summing the dimensions of all previous siblings.

### **Alignment Logic**

Alignment is an offset applied to the entire group of children after their sizes are calculated.

* **Start:** Offset = 0.
* **Center:** Offset = (Available Space / 2).
* **End:** Offset = (Available Space).

---

## 4. Text Content Rules

The **Text Box** renders bitmap glyphs from a JSON font. Logic toggles based on the `height` attribute:

* **Single-Line (Height Undefined):**
  * Box Height = font cell height (bitmap row count of the active font).
  * Text never wraps; it is **clipped on the right** edge.

* **Multi-Line (Height Defined):**
  * Text wraps at the Box Width boundary using pixel-accurate widths.
  * **Rule:** Never break a word. If a word exceeds the width, it moves to the next line.
  * The entire block is **clipped at the bottom** edge.

### **Font (`font` prop)**

Selects the font by name. Defaults to `'Tiny5-Regular'`.

```js
new Text({ content: 'hi', font: 'Tiny5-Bold' })
```

Fonts must be registered before use via `registerFont(name, data)` from `src/font/glyphFont.js`. `Tiny5-Regular` is pre-registered automatically.

### **Text Alignment (`align` prop)**

Controls the horizontal position of each rendered text line within the Text box's width. Applies per-line after layout.

| Value | Behavior |
| --- | --- |
| `start` (default) | Text begins at the left edge of the box. |
| `center` | Text is centered within the box width. |
| `end` | Text is flush with the right edge of the box. |

The offset is computed as: `charX = x + (width - lineWidth) * factor`, where `lineWidth = getTextWidth(line, font)` (sum of per-glyph advance widths, no trailing gap).

---

## 6. Font System

Fonts are stored as JSON files in `src/glyphs/`, converted from BDF sources. The active font is referenced by name on each `Text` box.

### **Glyph JSON Format**

Each file is a map from character to glyph descriptor:

```json
{
  "A": {
    "encoding": 65,
    "width": 4,
    "height": 5,
    "xOffset": 0,
    "yOffset": 0,
    "bitmap": [
      [0, 1, 1, 0],
      [1, 0, 0, 1],
      [1, 1, 1, 1],
      [1, 0, 0, 1],
      [1, 0, 0, 1]
    ],
    "char": "A"
  }
}
```

| Field | Meaning |
| --- | --- |
| `width` | Glyph advance width in pixels (character cell, not just ink) |
| `height` | Bounding box height of the ink area |
| `xOffset` / `yOffset` | Ink offset from the draw cursor |
| `bitmap` | 2D array of `0`/`1` rows; **`bitmap.length` is the cell height** (used for line height) |

### **Proportional Layout**

Fonts are proportional — each character has its own `width`. The advance per character is `glyph.width + 1` (1 px gap). Total string width = `sum(advance for each char) − 1` (no trailing gap).

### **Font Registry** (`src/font/glyphFont.js`)

| Export | Purpose |
| --- | --- |
| `DEFAULT_FONT_NAME` | `'Tiny5-Regular'` |
| `registerFont(name, data)` | Adds a font to the runtime registry |
| `getFont(name)` | Looks up a registered font (throws if missing) |
| `getFontCellHeight(font)` | Returns `bitmap.length` of the first glyph |
| `getTextWidth(text, font)` | Pixel width of a string |
| `layoutText(content, w, multi, font)` | Word-wrap → `string[]` |
| `renderGlyph(buf, ch, x, y, r, g, b, clip, font)` | Draws one glyph, returns advance |
| `parseColor(hex)` | `'#RRGGBB'` → `[r, g, b]` |



---

## 5. Rendering Pipeline

The engine processes the tree in three logical stages:

### Stage 1 — Layout (tree → resolved dimensions + coordinates)

1. **Style Resolution:** Resolve `Color` and `Fill` (Local > Inherited > Default).
2. **Dimension Pass:** Resolve all `%` and `Neutral` dimensions into absolute pixels.
3. **Coordinate Pass:** Calculate absolute screen positions and apply **Alignment** offsets.

### Stage 2 — Rasterization (resolved tree → flat RGBA pixel buffer)

Performed by `src/render/rasterizer.js`. Walks the resolved tree and writes pixels into a `Uint8Array` of length `width × height × 4` (RGBA, row-major).

* **Fill:** Draw the background rectangle using the `Fill` color.
* **Content:** Render local content (e.g., Text glyphs) using the `Color` style.
* **Clip:** Each box is clipped to its parent's bounds; clipping regions are intersected recursively.
* **Recursion:** Children are painted on top (painter's algorithm).

The rasterizer is the only module that understands boxes, text, fonts, and alignment. It owns all scene-graph-to-pixel logic.

### Stage 3 — Display (pixel buffer → output medium)

Thin renderer modules read the flat buffer and display it. They have no knowledge of boxes or fonts.

| Renderer | File | Output |
| --- | --- | --- |
| **Canvas** | `src/render/canvasRenderer.js` | Each pixel drawn as a filled circle at 20× scale on an HTML Canvas |
| **Terminal** | `src/render/terminalRenderer.js` | Each pixel emitted as an ANSI true-colour `●` character |