import fs from 'fs';
import { createRequire } from 'module';
import { Box } from './Box.js';
import { Animation } from './Animation.js';
import { Raster } from './Raster.js';

const require = createRequire(import.meta.url);

function decodePng(buffer) {
  const { PNG } = require('pngjs');
  const png = PNG.sync.read(buffer);
  return {
    data: new Uint8Array(png.data.buffer, png.data.byteOffset, png.data.byteLength),
    width: png.width,
    height: png.height,
  };
}

function decodeJpeg(buffer) {
  const jpeg = require('jpeg-js');
  const decoded = jpeg.decode(buffer, { useTArray: true });
  return { data: decoded.data, width: decoded.width, height: decoded.height };
}

function scaleNearest(src, srcW, srcH, dstW, dstH) {
  const out = new Uint8Array(dstW * dstH * 4);
  for (let y = 0; y < dstH; y++) {
    const srcY = Math.floor(y * srcH / dstH);
    for (let x = 0; x < dstW; x++) {
      const srcX = Math.floor(x * srcW / dstW);
      const si = (srcY * srcW + srcX) * 4;
      const di = (y * dstW + x) * 4;
      out[di]     = src[si];
      out[di + 1] = src[si + 1];
      out[di + 2] = src[si + 2];
      out[di + 3] = src[si + 3];
    }
  }
  return out;
}

function resolveDimensions(natW, natH, props) {
  let dstW = props.width ?? null;
  let dstH = props.height ?? null;
  if (dstW === null && dstH === null) { dstW = natW; dstH = natH; }
  else if (dstW === null) { dstW = Math.round(dstH * natW / natH); }
  else if (dstH === null) { dstH = Math.round(dstW * natH / natW); }
  return { dstW, dstH };
}

function detectType(buffer) {
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return 'png';
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'jpeg';
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return 'gif';
  return null;
}

async function decodeBuffer(buffer, type, props) {
  if (type === 'gif') {
    const { GifCodec } = require('gifwrap');
    const gif = await new GifCodec().decodeGif(buffer);
    const { dstW, dstH } = resolveDimensions(gif.width, gif.height, props);

    const children = gif.frames.map(frame => {
      const src = new Uint8Array(frame.bitmap.data.buffer, frame.bitmap.data.byteOffset, frame.bitmap.data.byteLength);
      const scaled = (dstW === gif.width && dstH === gif.height)
        ? src
        : scaleNearest(src, gif.width, gif.height, dstW, dstH);
      return new Raster({ width: dstW, height: dstH, rawData: scaled });
    });

    const anim = new Animation({ width: dstW, height: dstH, children });
    anim.durations = gif.frames.map(f => Math.max(f.delayCentisecs, 2) * 10);
    return anim;
  }

  const decoded = type === 'png' ? decodePng(buffer) : decodeJpeg(buffer);
  const { data, width: natW, height: natH } = decoded;
  const { dstW, dstH } = resolveDimensions(natW, natH, props);
  const scaled = (dstW === natW && dstH === natH)
    ? data
    : scaleNearest(data, natW, natH, dstW, dstH);

  const img = new Image({ width: dstW, height: dstH });
  img.rawData = scaled;
  return img;
}

export class Image extends Box {
  static ownProps = new Set(['src', 'width', 'height']);

  constructor(props = {}) {
    super(props);
    this.rawData = null; // Uint8Array RGBA at resolved dimensions
  }

  /**
   * Load and decode an image from a file path or a raw encoded buffer.
   *
   * File path: format is detected from magic bytes, no extension required.
   * Buffer: format must be supplied via props.type ('png', 'jpeg', or 'gif').
   *
   * If width and height are omitted, natural image dimensions are used.
   * If only one is given, the other is derived to preserve aspect ratio.
   * GIF files with multiple frames return an Animation of Raster widgets.
   *
   * @param {string|Buffer|Uint8Array} src - File path or encoded image bytes
   * @param {{ type?: string, width?: number, height?: number }} props
   * @returns {Promise<Image|Animation>}
   */
  static async load(src, props = {}) {
    let buffer, type;

    if (typeof src === 'string') {
      buffer = fs.readFileSync(src);
      type = detectType(buffer);
      if (!type) throw new Error(`Image.load: unrecognised file format for "${src}"`);
    } else {
      buffer = src;
      type = props.type;
      if (!type) throw new Error('Image.load: props.type is required when passing a buffer (png, jpeg, or gif)');
    }

    return decodeBuffer(buffer, type, props);
  }
}
