/**
 * PushDay landing — image pipeline.
 *
 * The raw captures in /images are different sizes (564x1568, 566x1568,
 * 559x1591, 571x1428), so they cannot sit inside a single device frame as-is.
 * This script:
 *
 *   1. normalises every capture to one 1x canvas (564 x 1605 — the device ratio
 *      measured off the reference design),
 *   2. pins the app's bottom nav bar to the bottom of that canvas, so the frame
 *      looks like a real phone screen no matter how the capture was cropped,
 *   3. upscales 2x with Lanczos3 plus a light unsharp pass so the screens stay
 *      sharp on retina displays,
 *   4. writes lossless PNG masters and the WebP files the page loads.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'images');
const OUT_PNG = path.join(ROOT, 'assets', 'screens', 'png');
const OUT_WEB = path.join(ROOT, 'assets', 'screens', 'web');
const OUT_QA = path.join(ROOT, '_qa');

const BASE_W = 564;
const BASE_H = 1605;
// Height of the pinned bottom nav bar. Measured off the captures: the pill top
// sits 110-116 px above the image edge in every shot, plus its margin.
const NAV_STRIP = 130;
const SCALE = 2;

const MAP = [
  { src: 'image_2026-09-20_21-16-10.png', name: '01-vazifa' },
  { src: 'image_2026-09-20_21-15-58.png', name: '02-pomodoro' },
  { src: 'image_2026-09-20_21-16-24.png', name: '03-statistika' },
  { src: 'image_2026-09-20_21-16-30.png', name: '04-chellenj' },
];

async function buildScreen(item) {
  const from = path.join(SRC, item.src);

  const base = await sharp(from).resize({ width: BASE_W, kernel: 'lanczos3' }).png().toBuffer();
  const { data, info } = await sharp(base).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;

  const bgIndex = ((h - 6) * w + 6) * c;
  const bg = { r: data[bgIndex], g: data[bgIndex + 1], b: data[bgIndex + 2], alpha: 1 };

  const hasNav = h > NAV_STRIP * 2;
  const navTop = hasNav ? h - NAV_STRIP : h;
  const navH = h - navTop;
  const contentBoxH = hasNav ? BASE_H - navH : BASE_H;
  const contentSrcH = navTop;

  const content = await sharp(base)
    .extract({ left: 0, top: 0, width: w, height: contentSrcH })
    .resize({ width: BASE_W, height: contentBoxH, fit: 'contain', position: 'top', background: bg })
    .png()
    .toBuffer();

  const layers = [{ input: content, left: 0, top: 0 }];
  if (hasNav) {
    const nav = await sharp(base)
      .extract({ left: 0, top: navTop, width: w, height: navH })
      .resize({ width: BASE_W, kernel: 'lanczos3' })
      .png()
      .toBuffer();
    layers.push({ input: nav, left: 0, top: BASE_H - navH });
  }

  const flat = await sharp({
    create: { width: BASE_W, height: BASE_H, channels: 4, background: bg },
  })
    .composite(layers)
    .png()
    .toBuffer();

  const upscaled = sharp(flat)
    .resize({ width: BASE_W * SCALE, height: BASE_H * SCALE, fit: 'fill', kernel: 'lanczos3' })
    .sharpen({ sigma: 0.7, m1: 0.5, m2: 2.0, x1: 2, y2: 9, y3: 18 });

  const pngInfo = await upscaled
    .clone()
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(path.join(OUT_PNG, `${item.name}@2x.png`));

  await upscaled
    .clone()
    .webp({ quality: 92, effort: 6, smartSubsample: true })
    .toFile(path.join(OUT_WEB, `${item.name}@2x.webp`));

  await sharp(flat)
    .webp({ quality: 90, effort: 6, smartSubsample: true })
    .toFile(path.join(OUT_WEB, `${item.name}.webp`));

  return {
    name: item.name,
    source: `${info.width}x${info.height}`,
    navTop,
    navH,
    gap: contentBoxH - contentSrcH,
    out: `${pngInfo.width}x${pngInfo.height}`,
    pngKB: Math.round(pngInfo.size / 1024),
    bg: `#${[bg.r, bg.g, bg.b].map((v) => v.toString(16).padStart(2, '0')).join('')}`,
    flat,
  };
}

async function main() {
  for (const dir of [OUT_PNG, OUT_WEB, OUT_QA]) fs.mkdirSync(dir, { recursive: true });

  const report = [];
  const tiles = [];

  for (const item of MAP) {
    const res = await buildScreen(item);
    tiles.push(await sharp(res.flat).resize({ width: 300 }).png().toBuffer());
    delete res.flat;
    report.push(res);
  }

  const tileW = 300;
  const tileH = Math.round((BASE_H / BASE_W) * tileW);
  await sharp({
    create: {
      width: tileW * tiles.length + 12 * (tiles.length + 1),
      height: tileH + 24,
      channels: 3,
      background: { r: 236, g: 233, b: 230 },
    },
  })
    .composite(tiles.map((input, i) => ({ input, left: 12 + i * (tileW + 12), top: 12 })))
    .png()
    .toFile(path.join(OUT_QA, 'screens-sheet.png'));

  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
