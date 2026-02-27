import { Root } from '../core/Root.js';
import { Row } from '../core/Row.js';
import { Column } from '../core/Column.js';
import { Text } from '../core/Text.js';
import { Box } from '../core/Box.js';
import { Animation } from '../core/Animation.js';
import { Padding } from '../core/Padding.js';

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
                  height: BOX_SIZE - 1 ,
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

export function buildScene() {
  return new Root({
    width: CANVAS_W,
    height: CANVAS_H,
    fill: '#000000',
    children: [
      new Column({
        children: [
          new Row({
            height: HEADER_H,
            children: [
              new Text({font: 'Tiny5-Bold', content: 'matr', color: '#ffffff'}),
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
    ],
  });
}
