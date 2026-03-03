import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Root } from '../../src/core/Root.js';
import { Row } from '../../src/core/Row.js';
import { Column } from '../../src/core/Column.js';
import { Box } from '../../src/core/Box.js';
import { Text } from '../../src/core/Text.js';
import { Slide } from '../../src/core/Slide.js';
import { Deck } from '../../src/core/Deck.js';
import { Image } from '../../src/core/Image.js';
import { Animation } from '../../src/core/Animation.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const gifwrapFixtures = require.resolve('gifwrap/package.json').replace('package.json', 'test/fixtures/');
const localFixtures = join(dirname(fileURLToPath(import.meta.url)), 'fixtures') + '/';

const CANVAS_W = 64;
const CANVAS_H = 32;
const HEADER_H = 9;
const SEP_H = 1;
const BODY_H = CANVAS_H - HEADER_H - SEP_H; // 22
const TRANS_MS = 600;

function labeledSlide({ label, accent, image, transition, duration = 2000 }) {
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
        image,
      ],
    }),
  });
}

function makeSwimImage(fishes) {
  const FISH_W = 13;
  const FISH_H = 12;
  const Y_MAX = BODY_H - FISH_H;    // 10
  const STEPS = fishes.length;

  const children = fishes.map((fish, i) => {
    const left = Math.round(-FISH_W + i / (STEPS - 1) * (CANVAS_W + FISH_W));
    const top = Math.round(Y_MAX / 2 * (1 + Math.sin(2 * Math.PI * 2 * i / STEPS)));
    return new Box({ left, top, children: [fish] });
  });

  return new Box({
    width: CANVAS_W, height: BODY_H, fill: '#000000',
    children: [new Animation({ duration: 100, children })],
  });
}

export async function buildScene() {
  const STEPS = 32;
  const [png, jpg, ...fishes] = await Promise.all([
    Image.load(gifwrapFixtures + 'lenna.png',      { width: CANVAS_W, height: BODY_H }),
    Image.load(gifwrapFixtures + 'hairstreak.jpg', { width: CANVAS_W, height: BODY_H }),
    ...Array.from({ length: STEPS }, () => Image.load(localFixtures + 'cheep-cheep.gif')),
  ]);

  const swimImage = makeSwimImage(fishes);

  return new Root({
    width: CANVAS_W,
    height: CANVAS_H,
    fill: '#000000',
    children: [
      new Deck({
        children: [
          labeledSlide({
            label: 'PNG',
            accent: '#3399ff',
            image: png,
            transition: { type: 'slideLeft', duration: TRANS_MS },
          }),
          labeledSlide({
            label: 'JPEG',
            accent: '#ff7f32',
            image: jpg,
            transition: { type: 'slideDown', duration: TRANS_MS },
          }),
          labeledSlide({
            label: 'CHEEP',
            accent: '#e52521',
            image: swimImage,
            duration: STEPS * 100,
            transition: { type: 'slideLeft', duration: TRANS_MS },
          }),
        ],
      }),
    ],
  });
}
