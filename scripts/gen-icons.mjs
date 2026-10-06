// Generates every app icon from assets/icon-source.png — Thiago's artwork
// (brushed-steel "ACS" lettering edged in cyan, a teal-and-white capsule and a
// scalpel on deep navy; replaced the gold version on 2026-10-06, which had
// replaced the white-on-royal-blue one the same day).
// Run with `node scripts/gen-icons.mjs` (needs sharp). Outputs into public/.
import sharp from "sharp";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "assets", "icon-source.png");
const pub = join(root, "public");

// Sample the artwork's own background so the maskable padding and the share
// image match it exactly, whatever shade the source uses.
const { data } = await sharp(src).extract({ left: 4, top: 4, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
const BG = { r: data[0], g: data[1], b: data[2], alpha: 1 };
console.log(`background sampled from artwork: rgb(${BG.r}, ${BG.g}, ${BG.b})`);

// Full-bleed square icons — the artwork already carries its own margin.
const square = [
  { size: 192, file: "pwa-192.png" },
  { size: 512, file: "pwa-512.png" },
  { size: 180, file: "apple-touch-icon.png" },
  { size: 32, file: "favicon-32.png" },
  { size: 16, file: "favicon-16.png" },
];
for (const { size, file } of square) {
  await sharp(src).resize(size, size, { fit: "cover" }).png().toFile(join(pub, file));
  console.log(`wrote public/${file} (${size}x${size})`);
}

// Maskable icon: shrink to the ~80% safe zone on the artwork's background so
// launcher circle/squircle masks don't clip the lettering or the scalpel.
{
  const size = 512;
  const inner = Math.round(size * 0.8);
  const resized = await sharp(src).resize(inner, inner, { fit: "contain", background: BG }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: resized, gravity: "center" }])
    .png()
    .toFile(join(pub, "pwa-maskable-512.png"));
  console.log("wrote public/pwa-maskable-512.png (512x512, maskable safe-zone)");
}

// Social share image for link previews: 1200x630, artwork centred on its background.
{
  const w = 1200;
  const h = 630;
  const inner = Math.round(h * 0.92);
  const resized = await sharp(src).resize(inner, inner, { fit: "contain", background: BG }).toBuffer();
  await sharp({ create: { width: w, height: h, channels: 4, background: BG } })
    .composite([{ input: resized, gravity: "center" }])
    .png()
    .toFile(join(pub, "og-image.png"));
  console.log("wrote public/og-image.png (1200x630)");
}

console.log("done.");
