# Example: Building a Scene

This walks through building a complete 64×32 scene using the layout library.

## Setup

Import the classes you need from the package root:

```js
import { Root, Row, Column, Box, Text, Padding, Animation } from './src/index.js';
```

Run the scene through the layout pipeline to get a rasterized output:

```js
import { resolveStyles } from './src/style/StyleContext.js';
import { resolveTree } from './src/layout/dimensionResolver.js';
import { positionTree } from './src/layout/coordinateResolver.js';
import { rasterizeFrames } from './src/render/rasterizer.js';

const root = buildScene();
resolveStyles(root);
resolveTree(root);
positionTree(root);

const { frames, durations } = rasterizeFrames(root);
// frames[i] is a Uint8Array of RGBA pixels, width × height × 4 bytes
```

---

## A complete scene

The scene below is a 64×32 LED matrix layout with a header bar, a content area, and a blinking status indicator.

```js
function buildScene() {
  return new Root({
    width: 64,
    height: 32,
    fill: '#0d0d0d',
    children: [
      new Column({
        children: [

          // Header: fixed 8px tall, label on the left, value on the right
          new Row({
            height: 8,
            fill: '#1a1a2e',
            children: [
              new Text({
                content: 'matr',
                color: '#e94560',
                font: 'Tiny5-Bold',
              }),
              new Text({
                content: 'v1',
                color: '#555555',
                align: 'end',
              }),
            ],
          }),

          // Body: fills remaining height
          new Row({
            children: [

              // Left panel: padded content area
              new Padding({
                padding: { top: 2, left: 2 },
                child: new Column({
                  children: [
                    new Text({ content: 'TEMP', color: '#888888', font: '4x6' }),
                    new Text({ content: '24.5', color: '#ffffff', font: 'profont11' }),
                  ],
                }),
              }),

              // Right panel: animated status dot
              new Animation({
                duration: 800,
                width: 8,
                children: [
                  new Box({ fill: '#00ff88' }),
                  new Box({ fill: '#004422' }),
                ],
              }),

            ],
          }),

        ],
      }),
    ],
  });
}
```

---

## What each part does

**`Root`** sets the canvas to 64×32 pixels with a near-black background.

**`Column`** stacks the header and body vertically. The header has a fixed `height: 8`; the body's height is neutral so it takes the remaining 24px.

**`Row` (header)** places two `Text` elements side by side. Both have neutral width, so they share the 64px equally — but `align: 'end'` on the right label pushes its text to the far right within its half.

**`Padding`** in the body adds a 2px top and 2px left inset before the temperature readout, keeping it away from the edges.

**`Column` (inner)** stacks the label and value vertically. Both `Text` elements have neutral height, so they each get the font cell height for their respective fonts.

**`Animation`** on the right creates a blinking dot: 8px wide, fills the body height, alternating between bright green and dark green every 800ms.
