/** node tools/crop.js <src> <out> <x> <y> <w> <h> [scale] */
const path = require('path');
const sharp = require('sharp');

const [src, out, x, y, w, h, scale] = process.argv.slice(2);
const ROOT = path.resolve(__dirname, '..');
const s = Number(scale || 1);

sharp(path.resolve(ROOT, src))
  .extract({ left: Number(x), top: Number(y), width: Number(w), height: Number(h) })
  .resize({ width: Math.round(Number(w) * s), kernel: 'lanczos3' })
  .png()
  .toFile(path.resolve(ROOT, out))
  .then((info) => console.log(`${out} ${info.width}x${info.height}`))
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
