// Generator assetów SEO/favicon/OG — uruchamiany ręcznie: `node scripts/generate-seo-assets.mjs`
// Kolory liczone z tokenów docs/DESIGN.md (OKLCH → sRGB), więc grafiki nie dryfują od CSS.
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

// Środowisko bez systemowych libnss/libatk itd. — deps wyciągnięte z debs do ~/.local/chrome-libs
const extraLibs = join(homedir(), '.local', 'chrome-libs');
if (existsSync(extraLibs)) {
  process.env.LD_LIBRARY_PATH = process.env.LD_LIBRARY_PATH
    ? `${extraLibs}:${process.env.LD_LIBRARY_PATH}` : extraLibs;
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const tmp = join(root, '.seo-tmp');
mkdirSync(pub, { recursive: true });
mkdirSync(tmp, { recursive: true });

// --- OKLCH → sRGB (Oklab, Björn Ottosson) ---
function oklchToHex(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const lin = [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
  const g = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
  const clamp = (c) => Math.round(Math.min(1, Math.max(0, g(c))) * 255);
  return '#' + lin.map((c) => clamp(c).toString(16).padStart(2, '0')).join('');
}

// Tokeny z src/index.css / docs/DESIGN.md
const T = {
  canvasLight: oklchToHex(0.964, 0.008, 235), // --background (jasny)
  canvasDark: oklchToHex(0.145, 0.015, 240),  // --background (ciemny)
  ink: oklchToHex(0.24, 0.015, 240),          // --foreground (jasny)
  muted: oklchToHex(0.5, 0.018, 240),         // --muted-foreground (jasny)
  border: oklchToHex(0.918, 0.008, 235),      // --border (jasny)
  brand700: oklchToHex(0.5, 0.134, 242),      // --brand-700 (akcent na jasnym)
  brand400: oklchToHex(0.746, 0.16, 233),     // --brand-400 (akcent na ciemnym)
};
// (Konwersja zweryfikowana 1:1 z culori; oklch tokeny = źródło prawdy, adnotacje hex w DESIGN.md są przybliżone)
console.log('Tokeny:', T);

// --- Znak „otwarta pętla": okrąg z przerwą 60° w górnej prawej przekątnej ---
function ringPath(cx, cy, r, gapDeg = 60, gapCenterDeg = 315) {
  const pt = (deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
  const [x1, y1] = pt(gapCenterDeg + gapDeg / 2);
  const [x2, y2] = pt(gapCenterDeg - gapDeg / 2);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 1 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}
// znak w viewBox 0 0 32 32
function markSvg({ size, rounded, ringScale = 1, bg = T.canvasDark, stroke = T.brand400, strokeWidth = 3.4 }) {
  const rx = rounded ? 7 : 0;
  const c = 16;
  const r = 8.5 * ringScale;
  const sw = strokeWidth * ringScale;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}">
  <rect width="32" height="32" rx="${rx}" fill="${bg}" />
  <path d="${ringPath(c, c, r)}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" />
</svg>`;
}

// --- Źródła SVG zapisywane do repo (edytowalne, nie tylko binały) ---
writeFileSync(join(pub, 'favicon.svg'), markSvg({ size: 32, rounded: true }));
console.log('✓ public/favicon.svg');

// --- Rasteryzacja: HTML per rozmiar → screenshot przez Playwright/Chromium ---
async function rasterize(browser, svg, size, out, opts = {}) {
  const html = `<!doctype html><meta charset="utf-8"><style>*{margin:0;padding:0}html,body{width:${size}px;height:${size}px;overflow:hidden}svg{display:block}${
    opts.scaleUp ? `svg{width:100%;height:100%}` : ''
  }</style>${svg}`;
  const file = join(tmp, `r-${size}-${Math.random().toString(36).slice(2)}.html`);
  writeFileSync(file, html);
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await page.goto('file://' + file);
  await page.screenshot({ path: out, omitBackground: opts.transparent ?? false, clip: { x: 0, y: 0, width: size, height: size } });
  await page.close();
  console.log(`✓ ${out.replace(root + '/', '')} (${size}×${size})`);
}

const browser = await chromium.launch();

// Ikony PNG: pełny kwadrat (manifest „any"), maskable (pętla w safe zone: promień ≤40% → ringScale 0.6), apple-touch (180, pełny kwadrat, bez przezroczystości)
await rasterize(browser, markSvg({ size: 192, rounded: false }), 192, join(pub, 'icon-192.png'), { transparent: false, scaleUp: true });
await rasterize(browser, markSvg({ size: 512, rounded: false }), 512, join(pub, 'icon-512.png'), { transparent: false, scaleUp: true });
await rasterize(browser, markSvg({ size: 192, rounded: false, ringScale: 0.6 }), 192, join(pub, 'icon-maskable-192.png'), { transparent: false, scaleUp: true });
await rasterize(browser, markSvg({ size: 512, rounded: false, ringScale: 0.6 }), 512, join(pub, 'icon-maskable-512.png'), { transparent: false, scaleUp: true });
await rasterize(browser, markSvg({ size: 180, rounded: false }), 180, join(pub, 'apple-touch-icon.png'), { transparent: false, scaleUp: true });

// --- favicon.ico: kontener ICO z PNG-ami 16/32/48 (PNG-in-ICO, Vista+) ---
function packIco(pngs) {
  const count = pngs.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  const entries = [];
  let offset = 6 + 16 * count;
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // kolory: palette-less
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // planes
    e.writeUInt16LE(32, 6); // bpp
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}
const icoSizes = [16, 32, 48];
const icoPngs = [];
for (const size of icoSizes) {
  const out = join(tmp, `ico-${size}.png`);
  await rasterize(browser, markSvg({ size, rounded: true }), size, out, { transparent: true });
  icoPngs.push({ size, data: readFileSync(out) });
}
writeFileSync(join(pub, 'favicon.ico'), packIco(icoPngs));
console.log(`✓ public/favicon.ico (${icoSizes.join('/')})`);

// --- OG image 1200×630 ---
const geistDir = join(root, 'node_modules', '@fontsource-variable', 'geist', 'files');
const geistWoff2 = readdirSync(geistDir).find((f) => f === 'geist-latin-wght-normal.woff2')
  ?? readdirSync(geistDir).find((f) => f.startsWith('geist-latin') && f.endsWith('-normal.woff2'));
if (!geistWoff2) throw new Error('Nie znaleziono Geist Variable w node_modules');

const ogTitle = 'openloops';
const ogTagline = 'Otwarte wątki. Rozpisane kroki. Widoczny postęp.';
const ogMeta = 'local-first · bez konta · dane zostają u Ciebie';
// Fonty inline jako base64 — file:// bywa blokowany, a font-display:block + nieudany load = niewidzialny tekst
// Dwa subsety (latin-ext dla ą/ę/ż + latin). UWAGA: jedna rodzina + unicode-range w tym buildzie
// Chromium daje tofu (zweryfikowane) — działające rozwiązanie: dwie rodziny, fallback per-glyph.
const geistExtFile = readdirSync(geistDir).find((f) => f === 'geist-latin-ext-wght-normal.woff2');
if (!geistExtFile) throw new Error('Nie znaleziono geist-latin-ext w node_modules');
const geistLatin = readFileSync(join(geistDir, geistWoff2)).toString('base64');
const geistLatinExt = readFileSync(join(geistDir, geistExtFile)).toString('base64');
const ogHtml = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face {
    font-family: 'Geist Ext';
    src: url(data:font/woff2;base64,${geistLatinExt}) format('woff2-variations');
    font-weight: 100 900; font-style: normal; font-display: swap;
  }
  @font-face {
    font-family: 'Geist Variable';
    src: url(data:font/woff2;base64,${geistLatin}) format('woff2-variations');
    font-weight: 100 900; font-style: normal; font-display: swap;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    font-family: 'Geist Ext', 'Geist Variable', sans-serif;
    background: ${T.canvasLight};
    color: ${T.ink};
    display: flex; align-items: center;
    padding: 0 96px;
  }
  .row { display: flex; align-items: center; gap: 32px; }
  .mark { flex: none; }
  h1 { font-size: 96px; font-weight: 700; letter-spacing: -0.04em; line-height: 1; }
  .tagline { margin-top: 32px; font-size: 38px; font-weight: 500; letter-spacing: -0.01em; color: ${T.muted}; }
  .meta {
    position: fixed; left: 96px; bottom: 64px;
    font-size: 21px; font-weight: 500; color: ${T.muted};
  }
  /* Chromium ładuje @font-face leniwie — bez wymuszenia load obu subsetów fallback per-glyph zawodzi (tofu) */
  .probe { position: absolute; opacity: 0; pointer-events: none; }
</style></head><body>
  <div class="probe" style="font-family: 'Geist Ext'">ąęóżźćńłś Wątki postęp</div>
  <div class="probe" style="font-family: 'Geist Variable'">óźćńś Wątki postęp zostają</div>
  <div>
    <div class="row">
      <svg class="mark" width="96" height="96" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="7" fill="${T.canvasDark}"/>
        <path d="${ringPath(16, 16, 8.5)}" fill="none" stroke="${T.brand400}" stroke-width="3.4" stroke-linecap="round"/>
      </svg>
      <h1>${ogTitle}</h1>
    </div>
    <p class="tagline">${ogTagline}</p>
  </div>
  <div class="meta">${ogMeta}</div>
</body></html>`;
const ogFile = join(tmp, 'og.html');
writeFileSync(ogFile, ogHtml);
const ogPage = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await ogPage.goto('file://' + ogFile);
await ogPage.evaluate(() => document.fonts.ready);
// Twardy fail zamiast cichego wyniku bez tekstu
const textWidth = await ogPage.evaluate(() => document.querySelector('h1').getBoundingClientRect().width);
if (textWidth < 100) throw new Error(`h1 nie wyrenderował się (width=${textWidth}) — font niezaładowany?`);
await ogPage.screenshot({ path: join(pub, 'og-image.png') });
await ogPage.close();
console.log('✓ public/og-image.png (1200×630)');

await browser.close();
