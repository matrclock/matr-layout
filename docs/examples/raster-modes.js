import { Root } from '../../src/core/Root.js';
import { Row } from '../../src/core/Row.js';
import { Column } from '../../src/core/Column.js';
import { Text } from '../../src/core/Text.js';
import { Box } from '../../src/core/Box.js';
import { Raster } from '../../src/core/Raster.js';

const CANVAS_W = 64;
const CANVAS_H = 32;

// pixels mode: 8x8 checkerboard with diagonal transparent holes
const CHECKER = Array.from({ length: 8 }, (_, row) =>
  Array.from({ length: 8 }, (_, col) => {
    if ((row + col) % 4 === 3) return null;
    return (row + col) % 2 === 0 ? '#ff4444' : '#4444ff';
  })
);

export function buildScene() {
  return new Root({
    width: CANVAS_W,
    height: CANVAS_H,
    fill: '#111111',
    children: [
      new Column({
        children: [
          new Row({
            height: 9,
            children: [
              new Text({ font: 'Tiny5-Bold', content: 'Raster', color: '#ffffff' }),
              new Text({ align: 'end', content: 'test', color: '#666666' }),
            ],
          }),
          new Box({ height: 1, fill: '#333333' }),
          new Row({
            height: 8,
            children: [
              // pixels mode: checkerboard with transparent holes
              new Raster({ pixels: CHECKER }),
              new Box({ width: 4, fill: '#222222' }),
              // child mode: auto-sizes from child's explicit px specs
              new Raster({ child: new Box({ width: 8, height: 8, fill: '#ff00ff' }) }),
              new Box({ width: 4, fill: '#222222' }),
              // child mode with a Row child
              new Raster({
                child: new Row({
                  width: 16,
                  height: 8,
                  children: [
                    new Box({ width: 4, fill: '#ff0000' }),
                    new Box({ width: 4, fill: '#00ff00' }),
                    new Box({ width: 4, fill: '#0000ff' }),
                    new Box({ width: 4, fill: '#ffff00' }),
                  ],
                }),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
