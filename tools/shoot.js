/**
 * Render the landing page in headless Chromium and save full-page screenshots
 * for desktop and phone widths, so the layout can be checked visually.
 */

const path = require('path');
const fs = require('fs');
const http = require('http');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'docs');
const CHROME =
  'C:/Users/user/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';

const VIEWS = [
  { name: 'desktop', width: 1440, height: 960, dsf: 1 },
  { name: 'phone', width: 430, height: 932, dsf: 2 },
  { name: 'tablet', width: 834, height: 1112, dsf: 1 },
];

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
};

/** The page is served over http so font + image loading matches production. */
function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
      const file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404).end('not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME });
  const server = await serve();
  const url = `http://127.0.0.1:${server.address().port}/index.html`;

  for (const v of VIEWS) {
    const context = await browser.newContext({
      viewport: { width: v.width, height: v.height },
      deviceScaleFactor: v.dsf,
    });
    const page = await context.newPage();

    const problems = [];
    page.on('console', (m) => {
      if (m.type() === 'error') problems.push(`console: ${m.text()}`);
    });
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
    page.on('requestfailed', (r) => problems.push(`failed: ${r.url()}`));

    await page.goto(url, { waitUntil: 'networkidle' });
    const fonts = await page.evaluate(() => ({
      poppins: document.fonts.check('800 40px Poppins'),
      inter: document.fonts.check('400 16px Inter'),
    }));
    await page.evaluate(async () => {
      await new Promise((res) => {
        let y = 0;
        const step = () => {
          y += window.innerHeight;
          window.scrollTo(0, y);
          if (y < document.body.scrollHeight) requestAnimationFrame(step);
          else setTimeout(res, 700);
        };
        step();
      });
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(900);

    await page.screenshot({
      path: path.join(OUT, `page-${v.name}.png`),
      fullPage: true,
    });

    const metrics = await page.evaluate(() => ({
      docWidth: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
      height: document.body.scrollHeight,
    }));

    console.log(`${v.name}: ${JSON.stringify(metrics)} fonts ${JSON.stringify(fonts)}`);
    if (metrics.docWidth > metrics.viewport + 1) {
      console.log(`  !! horizontal overflow: ${metrics.docWidth} > ${metrics.viewport}`);
    }
    problems.forEach((p) => console.log(`  !! ${p}`));

    await context.close();
  }

  await browser.close();
  server.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
