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

          // Slide 2 — enters via slideLeft; exits via wipeRight
          // Body: blue gradient columns (left=dark → right=bright)
          demoSlide({
            label: 'slideLeft',
            accent: '#3399FF',
            transition: { type: 'slideLeft', duration: TRANS_MS },
            body: new Row({
              children: [
                new Box({ fill: '#061a40' }),
                new Box({ fill: '#0d3d80' }),
                new Box({ fill: '#1a6acc' }),
                new Box({ fill: '#3399FF' }),
              ],
            }),
          }),

          // Slide 3 — enters via wipeRight; exits via wipeUp
          // Body: hot pink left half, dark right half
          demoSlide({
            label: 'wipeRight',
            accent: '#FF3385',
            transition: { type: 'wipeRight', duration: TRANS_MS },
            body: new Row({
              children: [
                new Box({ width: 32, fill: '#FF3385' }),
                new Box({ fill: '#1a0010' }),
              ],
            }),
          }),

          // Slide 4 — enters via wipeUp; exits via starWipe
          // Body: teal gradient bands (top=dark → bottom=bright)
          demoSlide({
            label: 'wipeUp',
            accent: '#00FFCC',
            transition: { type: 'wipeUp', duration: TRANS_MS },
            body: new Column({
              children: [
                new Box({ height: 4, fill: '#001a14' }),
                new Box({ height: 4, fill: '#003d2e' }),
                new Box({ height: 4, fill: '#006650' }),
                new Box({ height: 4, fill: '#009973' }),
                new Box({ height: 4, fill: '#00cc99' }),
                new Box({ fill: '#00FFCC' }),
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

          // Slide 7 — enters via checkerboard; exits via blinds
          // Body: manual purple/dark checkerboard
          demoSlide({
            label: 'checkerboard',
            accent: '#a855f7',
            transition: { type: 'checkerboard', duration: TRANS_MS },
            body: (() => {
              const rows = [];
              for (let r = 0; r < 5; r++) {
                const cells = [];
                for (let c = 0; c < 8; c++) {
                  cells.push(new Box({ fill: (r + c) % 2 === 0 ? '#a855f7' : '#1a0033' }));
                }
                rows.push(new Row({ height: r < 4 ? 4 : BODY_H - 16, children: cells }));
              }
              return new Column({ children: rows });
            })(),
          }),

          // Slide 8 — enters via blinds; exits via flipLeft
          // Body: green slats on black (echoes the blinds effect)
          demoSlide({
            label: 'blinds',
            accent: '#84cc16',
            transition: { type: 'blinds', duration: TRANS_MS },
            body: new Column({
              children: [
                new Box({ height: 4, fill: '#84cc16' }),
                new Box({ height: 1, fill: '#000000' }),
                new Box({ height: 4, fill: '#84cc16' }),
                new Box({ height: 1, fill: '#000000' }),
                new Box({ height: 4, fill: '#84cc16' }),
                new Box({ height: 1, fill: '#000000' }),
                new Box({ height: 4, fill: '#84cc16' }),
                new Box({ height: 1, fill: '#000000' }),
                new Box({ fill: '#84cc16' }),
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

          // Slide 10 — enters via flipUp; exits via slideRight
          // Body: amber gradient top→bottom (bright→dark)
          demoSlide({
            label: 'flipUp',
            accent: '#f59e0b',
            transition: { type: 'flipUp', duration: TRANS_MS },
            body: new Column({
              children: [
                new Box({ height: 5, fill: '#f59e0b' }),
                new Box({ height: 5, fill: '#b45309' }),
                new Box({ height: 5, fill: '#78350f' }),
                new Box({ fill: '#1a0d00' }),
              ],
            }),
          }),

          // Slide 11 — enters via slideRight; exits via slideDown
          // Body: rainbow vertical columns
          demoSlide({
            label: 'slideRight',
            accent: '#8b5cf6',
            transition: { type: 'slideRight', duration: TRANS_MS },
            body: new Row({
              children: colors.map(c => new Box({ fill: c })),
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
