import { Root } from '../core/Root.js';
import { Row } from '../core/Row.js';
import { Column } from '../core/Column.js';
import { Text } from '../core/Text.js';
import { Box } from '../core/Box.js';
import { Padding } from '../core/Padding.js';
import { Animation } from '../core/Animation.js';
/**
 * Builds the demo scene for a 64×32 canvas (8×8 font → 8 chars wide, 4 rows tall).
 * @returns {Root}
 */
export function buildScene() {
  return new Root({
    width: 64,
    height: 32,
    fill: '#000000',
    children: [
      new Animation({
        duration: 1000,
        children: [
          new Box({ fill: '#ff0000' }),
          new Box({ fill: '#00ff00' }),
          new Box({ fill: '#0000ff' }),
        ],
      }),
      /*
      new Row({
        fill: '#16213e',
        children: [
          new Text({ content: 'matr', color: '#e94560', font: 'Tiny5-Bold' }),
          new Text({ content: '0.1', color: '#888888', align: 'end' }),
        ],
      }),
      */
      /*
      new Column({
        children: [
          // Header: 8px tall, two greedy text labels
          new Row({
            height: 8,
            fill: '#16213e',
            children: [
              new Text({ content: 'matr', color: '#e94560', font: 'Tiny5-Bold' }),
              new Text({ content: '0.1', color: '#888888', align: 'end' }),
            ],
          }),

          // Body: greedy (16px) — red accent stripe + content
          new Padding({
            padding: {
              top: 1
            },
            color: '#66cc66',
            child: new Row({
              height: 21,
              children: [
                new Column({
                  children: [
                    new Padding({
                      padding: {
                        top: 1,
                      },
                      color: '#cc6666',
                      child: new Column({
                        align: 'center',
                        children: [
                          new Text({ align: 'center', height: 14, content: 'Hello', color: '#ffffff', font: 'profont17' }),
                        ]
                      })
                    })
                  ],
                }),
              ],
            }),
          })
          
          // Footer
        ],
      }),
      */
    ],
  });
}
