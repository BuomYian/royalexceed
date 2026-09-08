/**
 * Derives the shipped 211Motors brand assets from the master artwork in
 * `assets/brand/`. The master is a flat PNG of the logo printed on a solid
 * white sheet, which is unusable as-is: on a dark surface it shows as a white
 * card, and its black wordmark disappears. This lifts the ink off the sheet
 * into real alpha and emits a light-surface lockup, a dark-surface lockup, and
 * the square red mark the favicons are cut from.
 *
 * Run with `npm run brand:build` after replacing the master; the outputs are
 * committed, so this is not part of the app build.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = "assets/brand/211motors-source.png";
const OUT = "public/brand";

// The source art sits as opaque ink on a solid white sheet. `alpha` is how far
// a pixel is from that sheet; NORM is the distance of the most saturated ink in
// the file (brand red, min channel ~28) so solid red lands on a fully opaque
// pixel instead of the 89% it would get from a plain 255-min(r,g,b).
const NORM = 228;

function toRgba(data, info, { whiten = false, redOnly = false } = {}) {
  const { width: w, height: h, channels: ch } = info;
  const out = Buffer.alloc(w * h * 4);
  for (let p = 0; p < w * h; p++) {
    const i = p * ch;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const min = Math.min(r, g, b);
    const sat = Math.max(r, g, b) - min;
    let a = Math.round(((255 - min) * 255) / NORM);
    a = a < 0 ? 0 : a > 255 ? 255 : a;

    // Drop the neutral ink entirely (used by the square mark, which is the red
    // "211" lifted out of a lockup whose black "M" overlaps its crop box).
    if (redOnly && sat < 70) a = 0;

    const o = p * 4;
    if (a === 0) {
      out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0;
      continue;
    }
    // Un-composite the pixel off white so anti-aliased edges keep their colour
    // instead of staying milky once the sheet behind them is gone.
    const f = a / 255;
    const un = (c) => {
      const v = Math.round((c - 255 * (1 - f)) / f);
      return v < 0 ? 0 : v > 255 ? 255 : v;
    };
    let R = un(r), G = un(g), B = un(b);
    // Dark-surface variant: the near-neutral ink (car outline, "Motors") flips
    // to white; the red is left alone so the brand colour survives both themes.
    if (whiten && sat < 70) { R = G = B = 255; }
    out[o] = R; out[o + 1] = G; out[o + 2] = B; out[o + 3] = a;
  }
  return { out, w, h };
}

async function build(extract, opts, width, file) {
  const { data, info } = await sharp(SRC).extract(extract).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  const { out, w, h } = toRgba(data, info, opts);
  return sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .resize({ width, kernel: "lanczos3" })
    .png({ compressionLevel: 9, palette: true, quality: 100 })
    .toFile(file);
}

// Ink bounds measured off the source sheet (1254x1254).
const LOCKUP = { left: 38, top: 393, width: 1182, height: 378 };
const MARK = { left: 36, top: 503, width: 441, height: 274 };

fs.mkdirSync(OUT, { recursive: true });

await build(LOCKUP, {}, 900, path.join(OUT, "logo-211motors.png"));
await build(LOCKUP, { whiten: true }, 900, path.join(OUT, "logo-211motors-dark.png"));
await build(MARK, { redOnly: true }, 512, path.join(OUT, "mark-211motors.png"));

// Square icons. The mark is 441x274, so it is padded onto a square canvas
// rather than resized into one.
const markBuf = await sharp(path.join(OUT, "mark-211motors.png"))
  .resize({ width: 486 }).toBuffer();
const square = (bg) =>
  sharp({ create: { width: 512, height: 512, channels: 4, background: bg } })
    .composite([{ input: markBuf, gravity: "centre" }])
    .png({ compressionLevel: 9, palette: true, quality: 100 });

await square({ r: 0, g: 0, b: 0, alpha: 0 }).toFile(path.join(OUT, "icon-211motors.png"));
// Apple home-screen icons are composited on an opaque tile: ship one.
const appleTile = await square({ r: 255, g: 255, b: 255, alpha: 1 }).toBuffer();
await sharp(appleTile).resize(180, 180).png({ compressionLevel: 9, palette: true, quality: 100 })
  .toFile(path.join(OUT, "apple-icon-211motors.png"));

// Next picks these up by file convention (app/icon.png, app/apple-icon.png),
// so write them straight into app/ instead of leaving a manual copy step.
fs.copyFileSync(path.join(OUT, "icon-211motors.png"), "app/icon.png");
fs.copyFileSync(path.join(OUT, "apple-icon-211motors.png"), "app/apple-icon.png");

for (const f of fs.readdirSync(OUT)) {
  const s = fs.statSync(path.join(OUT, f));
  const m = await sharp(path.join(OUT, f)).metadata();
  console.log(f, `${m.width}x${m.height}`, `${(s.size / 1024).toFixed(1)}KB`);
}
