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

The **Text Box** uses fixed-height bitmap fonts. Logic toggles based on the `height` attribute:

* **Single-Line (Height Undefined):**
* Box Height = Font Height.
* Text never wraps; it is **clipped on the right** edge.


* **Multi-Line (Height Defined):**
* Text wraps at the Box Width boundary.
* **Rule:** Never break a word. If a word exceeds the width, it moves to the next line.
* The entire block is **clipped at the bottom** edge.

### **Text Alignment (`align` prop)**

Controls the horizontal position of each rendered text line within the Text box's width. Applies per-line after layout.

| Value | Behavior |
| --- | --- |
| `start` (default) | Text begins at the left edge of the box. |
| `center` | Text is centered within the box width. |
| `end` | Text is flush with the right edge of the box. |

The offset is computed as: `charX = x + (width - lineWidth) * factor`, where `lineWidth = chars * FONT_WIDTH`.



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