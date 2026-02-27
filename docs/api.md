# API Reference

## Dimensions

Most size and position props accept the following formats:

| Value | Meaning |
|-------|---------|
| `64` | 64 pixels |
| `'50%'` | 50% of the parent's available space |
| omitted | **neutral** — fills all available space |

---

## Box

The base element. All other classes extend `Box`. Can be used directly as a plain rectangular region.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | dimension | neutral | Element width |
| `height` | dimension | neutral | Element height |
| `fill` | `string` | none | Background color (CSS hex, e.g. `'#ff0000'`) |
| `color` | `string` | `'#ffffff'` | Foreground/text color. Inherited by children |
| `top` | dimension | — | Offset from parent's top edge |
| `left` | dimension | — | Offset from parent's left edge |
| `align` | `'start'`\|`'center'`\|`'end'` | `'start'` | Alignment along the primary axis (used by `Row`/`Column`) |
| `children` | `Box[]` | `[]` | Child elements |

### Example

```js
new Box({ width: 16, height: 16, fill: '#ff0000' })

// Positioned box — 5px from top, 10px from left
new Box({ width: 8, height: 8, fill: '#00ff00', top: 5, left: 10 })
```

---

## Root

The top-level container. Defines the canvas size. Every scene must start with a `Root`. Both `width` and `height` must be explicit pixel values.

### Props

Inherits all `Box` props. `width` and `height` are **required**.

### Example

```js
new Root({
  width: 64,
  height: 32,
  fill: '#000000',
  children: [ /* ... */ ],
})
```

---

## Row

Lays out children **horizontally**, left to right. Children with neutral width share the remaining space equally. Neutral-height children stretch to fill the row's height.

### Props

Inherits all `Box` props.

| Prop | Notes |
|------|-------|
| `align` | Aligns children along the horizontal axis: `'start'` (left), `'center'`, `'end'` (right) |

### Example

```js
new Row({
  height: 8,
  fill: '#111111',
  children: [
    new Box({ width: 16, fill: '#ff0000' }),  // fixed width
    new Box({ fill: '#00ff00' }),              // takes remaining space
  ],
})
```

---

## Column

Lays out children **vertically**, top to bottom. Children with neutral height share the remaining space equally. Neutral-width children stretch to fill the column's width.

### Props

Inherits all `Box` props.

| Prop | Notes |
|------|-------|
| `align` | Aligns children along the vertical axis: `'start'` (top), `'center'`, `'end'` (bottom) |

### Example

```js
new Column({
  children: [
    new Box({ height: 8, fill: '#ff0000' }),  // fixed height
    new Box({ fill: '#0000ff' }),             // takes remaining space
  ],
})
```

---

## Text

Renders a string of text using a bitmap font. Width is neutral by default (fills available space). Height is neutral by default and resolves to the font's cell height.

### Props

Inherits all `Box` props, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | `''` | The text to render |
| `font` | `string` | `'Tiny5-Regular'` | Font name (see available fonts below) |

The `color` prop (inherited from `Box`) controls the text colour.

When `height` is set explicitly, text wraps across multiple lines.

### Available fonts

`4x6`, `5x7`, `5x8`, `6x9`, `6x10`, `6x12`, `6x13`, `6x13B`, `6x13O`, `7x13`, `7x13B`, `7x14`, `7x14B`, `8x13`, `8x13B`, `9x15`, `9x15B`, `9x18`, `9x18B`, `10x20`, `CG-pixel-3x5-mono`, `CG-pixel-4x5-mono`, `Dina_r400-6`, `profont10`, `profont11`, `profont12`, `profont15`, `profont17`, `profont22`, `profont29`, `spleen-5x8`, `spleen-6x12`, `spleen-8x16`, `spleen-12x24`, `spleen-16x32`, `spleen-32x64`, `tb-8`, `Tiny5-Regular` *(default)*, `Tiny5-Bold`, `tom-thumb`

### Example

```js
// Single line — height auto-sized to font
new Text({ content: 'Hello', color: '#ffffff', font: 'profont11' })

// Multi-line — wraps within the given height
new Text({ content: 'Hello world', height: 20, color: '#ffff00', font: 'Tiny5-Regular' })

// Right-aligned
new Text({ content: 'Score: 42', align: 'end', color: '#ffffff' })
```

---

## Padding

Wraps a single child with inset space on any or all sides. The padding strips can be given their own colour; the inner area is left transparent (the child paints on top of whatever is behind).

### Props

Inherits `Box` props for sizing/positioning (`width`, `height`, `top`, `left`, `fill`). Does **not** use `children` — use `child` instead.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `child` | `Box` | — | The element to wrap |
| `padding` | `number` \| `{top?, right?, bottom?, left?}` | `0` | Inset in pixels. A number applies to all sides |
| `color` | `string` | none | Colour of the padding strips (not the child area) |

### Example

```js
// Uniform padding
new Padding({
  padding: 4,
  color: '#333333',
  child: new Text({ content: 'Hi', color: '#ffffff' }),
})

// Per-side padding
new Padding({
  padding: { top: 2, left: 4 },
  child: new Box({ fill: '#ff0000' }),
})
```

---

## Animation

Cycles through its children as animation frames. Each child is a full box tree representing one frame. All frames are given the same dimensions as the `Animation` node itself.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `Box[]` | `[]` | The frames, shown in order |
| `duration` | `number` | `1000` | Milliseconds each frame is shown |

Sizing props (`width`, `height`, `top`, `left`) are inherited from `Box`.

### Example

```js
new Animation({
  duration: 500,
  children: [
    new Box({ fill: '#ff0000' }),
    new Box({ fill: '#00ff00' }),
    new Box({ fill: '#0000ff' }),
  ],
})
```

---

## Slide

A single slide within a `Deck`. Holds one child and specifies how long it is displayed and what transition plays when the next slide begins.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `child` | `Box` | — | Content of the slide |
| `duration` | `number` | `1000` | Milliseconds this slide is shown |
| `transition` | `object` | none | Transition to the next slide (see below) |

### Transition object

| Field | Type | Description |
|-------|------|-------------|
| `type` | `string` | Transition type (see table below) |
| `duration` | `number` | Transition duration in milliseconds |

| Type | Effect |
|------|--------|
| `'fade'` | Cross-fade between slides |
| `'slideLeft'` | Current slides left, next enters from the right |
| `'slideRight'` | Current slides right, next enters from the left |
| `'slideUp'` | Current slides up, next enters from the bottom |
| `'slideDown'` | Current slides down, next enters from the top |
| `'wipeRight'` | Boundary sweeps right, revealing next slide from the left |
| `'wipeLeft'` | Boundary sweeps left, revealing next slide from the right |
| `'wipeDown'` | Boundary sweeps down, revealing next slide from the top |
| `'wipeUp'` | Boundary sweeps up, revealing next slide from the bottom |
| `'flipLeft'` | Current compresses to left edge, next expands from left edge |
| `'flipRight'` | Current compresses to right edge, next expands from right edge |
| `'flipUp'` | Current compresses to top edge, next expands from top edge |
| `'flipDown'` | Current compresses to bottom edge, next expands from bottom edge |
| `'starWipe'` | A 5-pointed star grows from the centre to reveal the next slide |
| `'dissolve'` | Chunky random blocks dissolve from current to next |
| `'checkerboard'` | Alternating checkerboard cells open to reveal the next slide |
| `'blinds'` | Horizontal slats open top-to-bottom to reveal the next slide |

### Example

```js
new Slide({
  duration: 2000,
  transition: { type: 'fade', duration: 500 },
  child: new Box({ fill: '#ff0000' }),
})
```

---

## Deck

Sequences `Slide` children into an animated presentation. Each slide is pre-rasterized; transitions between slides are baked into the frame sequence.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `Slide[]` | `[]` | The slides, shown in order |

Sizing props (`width`, `height`, `top`, `left`, `fill`) are inherited from `Box`.

### Example

```js
new Deck({
  width: 64,
  height: 32,
  children: [
    new Slide({
      duration: 1000,
      transition: { type: 'slideLeft', duration: 300 },
      child: new Box({ fill: '#ff0000' }),
    }),
    new Slide({
      duration: 1000,
      transition: { type: 'checkerboard', duration: 400 },
      child: new Box({ fill: '#0000ff' }),
    }),
    new Slide({
      duration: 1000,
      child: new Box({ fill: '#00ff00' }),
    }),
  ],
})
```
