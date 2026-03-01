import { Root } from '../../src/core/Root.js';
import { Row } from '../../src/core/Row.js';
import { Column } from '../../src/core/Column.js';
import { Box } from '../../src/core/Box.js';
import { Text } from '../../src/core/Text.js';
import { Slide } from '../../src/core/Slide.js';

export function buildScene() {
  return new Root({
    width: 64,
    height: 32,
    fill: '#000000',
    children: [
      new Slide({
        duration: 3000,
        transition: { type: 'slideLeft', duration: 600 },
        child: new Column({
          children: [
            new Row({
              height: 9,
              fill: '#111111',
              children: [
                new Text({ font: 'Tiny5-Bold', content: 'no deck', color: '#00ffcc' }),
              ],
            }),
            new Box({ height: 1, fill: '#00ffcc' }),
            new Row({
              children: [
                new Box({ fill: '#003322' }),
                new Box({ fill: '#00ffcc' }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
}
