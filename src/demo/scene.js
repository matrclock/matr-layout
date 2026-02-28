import { Root } from '../../src/core/Root.js';
import { Row } from '../../src/core/Row.js';
import { Column } from '../../src/core/Column.js';
import { Text } from '../../src/core/Text.js';
import { Box } from '../../src/core/Box.js';
import { Animation } from '../../src/core/Animation.js';
import { Padding } from '../../src/core/Padding.js';
import { Slide } from '../../src/core/Slide.js';
import { Deck } from '../../src/core/Deck.js';

const CANVAS_W = 64;
const CANVAS_H = 32;
const HEADER_H = 9;  // Tiny5-Regular cell height
const SEP_H = 1;
const BODY_H = CANVAS_H - HEADER_H - SEP_H; // 22

const BOX_SIZE = 10;
const FPS = 20;
const DURATION_S = 5;
const FRAME_COUNT = FPS * DURATION_S; // 100
const FRAME_MS = 1000 / FPS;          // 50ms per frame

const COLOR_MS = 500;
const colors = [
  '#FF3385', // Hot Pink
  '#FF7F32', // Vibrant Orange
  '#FFD700', // Golden Yellow
  '#00FFCC', // Bright Teal
  '#3399FF', // Electric Blue
];

function buildBouncingFrames() {
  let bx = 0;
  let by = 0;
  let vx = 1.7;
  let vy = 1.1;

  const maxX = CANVAS_W - BOX_SIZE;
  const maxY = BODY_H - BOX_SIZE;

  const frames = [];
  for (let i = 0; i < FRAME_COUNT; i++) {
    bx += vx;
    by += vy;

    if (bx <= 0)    { bx = 0;    vx =  Math.abs(vx); }
    if (bx >= maxX) { bx = maxX; vx = -Math.abs(vx); }
    if (by <= 0)    { by = 0;    vy =  Math.abs(vy); }
    if (by >= maxY) { by = maxY; vy = -Math.abs(vy); }

    frames.push(
      new Box({
        width: BOX_SIZE + 1,
        height: BOX_SIZE + 1,
        left: Math.round(bx),
        top: Math.round(by),
        children: [
          new Animation({
            duration: COLOR_MS,
            children: colors.map((c, i) =>
              new Padding({
                padding: 1,
                color: '#ffffff',
                child: new Text({
                  height: BOX_SIZE - 1,
                  width: BOX_SIZE - 1,
                  color: '#ffffff',
                  fill: c,
                  align: 'center',
                  content: i.toString(),
                })
              })
            ),
          }),
        ],
      }),
    );
  }
  return frames;
}

// Demo slide: accent-colored label header, colored separator, colorful body.
// The label names the transition that was used to ENTER this slide.
function demoSlide({ label, accent, body, duration = 1500, transition }) {
  return new Slide({
    duration,
    transition,
    child: new Column({
      children: [
        new Row({
          height: HEADER_H,
          fill: '#111111',
          children: [
            new Text({ font: 'Tiny5-Bold', content: label, color: accent }),
          ],
        }),
        new Box({ height: SEP_H, fill: accent }),
        body,
      ],
    }),
  });
}

export function buildScene() {
  const TRANS_MS = 600;

  return new Root({
    width: CANVAS_W,
    height: CANVAS_H,
    fill: '#000000',
    children: [
      new Deck({
        children: [

          // Slide 1 — bouncing box, enters by fading in from a reddish background
          new Slide({
            duration: FRAME_COUNT * FRAME_MS,
            transition: { from: new Box({ fill: '#cc1100' }), type: 'fade', duration: 800 },
            child: new Column({
              children: [
                new Row({
                  height: HEADER_H,
                  children: [
                    new Text({ font: 'Tiny5-Bold', content: 'matr', color: '#ffffff' }),
                    new Text({ align: 'end', content: 'v0.0.1', color: '#ffffff' }),
                  ],
                }),
                new Box({
                  height: SEP_H,
                  fill: '#ff0000',
                }),
                new Animation({
                  duration: FRAME_MS,
                  children: buildBouncingFrames(),
                }),
              ],
            }),
          }),

          // Slide 2 — enters via slideLeft; body is a bare embedded Slide (not in a Deck)
          // The inner Slide carries a transition from a blue box, but has no Deck to drive it.
          new Slide({
            duration: 3000,
            transition: { type: 'slideLeft', duration: TRANS_MS },
            child:  new Column({
              children: [
                new Row({
                  height: HEADER_H,
                  fill: '#111111',
                  children: [
                    new Text({ font: 'Tiny5-Bold', content: 'embed slide', color: '#4488ff' }),
                  ],
                }),

                new Row({
                  children: [
                    new Slide({
                      transition: { from: new Box({ fill: '#1a44cc' }), type: 'slideRight', duration: TRANS_MS },
                      child: new Box({ fill: '#cc6666' }),
                    }),
                    new Slide({
                      transition: { from: new Box({ fill: '#1a44cc' }), type: 'slideDown', duration: 500 },
                      child: new Box({ fill: '#FFDE21' }),
                    }),
                    new Box({ fill: '#00ccff' }),
                  ],
                }),
                ],
            }),
          }),
          

          // Slide 3 — enters via slideLeft; body is a nested Deck of 2 slides
          // Inner slide A: cyan | purple halves
          // Inner slide B: gold | dark halves, enters via slideLeft
          demoSlide({
            label: 'nested',
            accent: '#8b5cf6',
            duration: 4200,
            transition: { type: 'slideLeft', duration: TRANS_MS },
            body: new Deck({
              children: [
                new Slide({
                  duration: 1800,
                  child: new Row({
                    children: [
                      new Box({ fill: '#06b6d4', children: [
                        new Box({ top: 3, children: [new Text({ font: '9x15B', content: '1', color: '#003344', align: 'center' })] }),
                      ]}),
                      new Box({ fill: '#a855f7', children: [
                        new Box({ top: 3, children: [new Text({ font: '9x15B', content: '2', color: '#ffffff', align: 'center' })] }),
                      ]}),
                    ],
                  }),
                }),
                new Slide({
                  duration: 1800,
                  transition: { type: 'slideLeft', duration: TRANS_MS },
                  child: new Row({
                    children: [
                      new Box({ fill: '#FFD700', children: [
                        new Box({ top: 3, children: [new Text({ font: '9x15B', content: '3', color: '#1a0d00', align: 'center' })] }),
                      ]}),
                      new Box({ fill: '#cc6666', children: [
                        new Box({ top: 3, children: [new Text({ font: '9x15B', content: '4', color: '#ffffff', align: 'center' })] }),
                      ]}),
                    ],
                  }),
                }),
              ],
            }),
          }),

          // Slide 5 — enters via starWipe; exits via dissolve
          // Body: gold bordered box with "* * *" in the center
          demoSlide({
            label: 'starWipe',
            accent: '#FFD700',
            transition: { type: 'starWipe', duration: 800 },
            body: new Box({
              fill: '#0d0b00',
              children: [
                new Box({
                  left: 3, top: 2,
                  width: CANVAS_W - 6,
                  height: BODY_H - 4,
                  fill: '#FFD700',
                  children: [
                    new Box({
                      left: 3, top: 3,
                      width: CANVAS_W - 12,
                      height: BODY_H - 10,
                      fill: '#0d0b00',
                      children: [
                        new Text({
                          width: CANVAS_W - 12,
                          height: BODY_H - 10,
                          align: 'center',
                          color: '#FFD700',
                          content: '* * *',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          }),

          // Slide 6 — enters via dissolve; exits via checkerboard
          // Body: 3×3 rainbow color grid
          demoSlide({
            label: 'dissolve',
            accent: '#FF7F32',
            transition: { type: 'dissolve', duration: TRANS_MS },
            body: new Column({
              children: [
                new Row({
                  height: 7,
                  children: [
                    new Box({ fill: '#FF3385' }),
                    new Box({ fill: '#FF7F32' }),
                    new Box({ fill: '#FFD700' }),
                  ],
                }),
                new Row({
                  height: 7,
                  children: [
                    new Box({ fill: '#00FFCC' }),
                    new Box({ fill: '#3399FF' }),
                    new Box({ fill: '#a855f7' }),
                  ],
                }),
                new Row({
                  children: [
                    new Box({ fill: '#ef4444' }),
                    new Box({ fill: '#84cc16' }),
                    new Box({ fill: '#f59e0b' }),
                  ],
                }),
              ],
            }),
          }),

          // Slide 9 — enters via flipLeft; exits via flipUp
          // Body: red gradient left→right (bright→dark, like a page folding away)
          demoSlide({
            label: 'flipLeft',
            accent: '#ef4444',
            transition: { type: 'flipLeft', duration: TRANS_MS },
            body: new Row({
              children: [
                new Box({ fill: '#ef4444' }),
                new Box({ fill: '#c0392b' }),
                new Box({ fill: '#922b21' }),
                new Box({ fill: '#1a0000' }),
              ],
            }),
          }),

          // Slide 12 — enters via slideDown; no exit transition (loops cut to slide 1's fade-in)
          // Body: rainbow horizontal bands
          demoSlide({
            label: 'slideDown',
            accent: '#06b6d4',
            transition: { type: 'slideDown', duration: TRANS_MS },
            body: new Column({
              children: colors.map(c => new Box({ fill: c })),
            }),
          }),
          

        ],
      }),
    ],
  });
}
