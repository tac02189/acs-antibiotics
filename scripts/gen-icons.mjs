// Generates every app icon from assets/icon-source.png — Thiago's artwork
// (brushed-gold "ACS" lettering, a gold-and-black capsule in the C and a steel
// scalpel with a black-and-gold grip, on black; replaced the brushed-steel and
// cyan version on 2026-10-08, which had replaced a gold one and a
// white-on-royal-blue one on 2026-10-06).
// Run with `node scripts/gen-icons.mjs` (needs sharp). Outputs into public/.
import sharp from "sharp";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "assets", "icon-source.png");
const pub = join(root, "public");

// Sample the artwork's background near its corner, so the maskable padding and
// the share image use its shade, whatever that is. One pixel cannot match an
// edge that varies; feathered() below hides the difference.
const { data } = await sharp(src).extract({ left: 4, top: 4, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
const BG = { r: data[0], g: data[1], b: data[2], alpha: 1 };
console.log(`background sampled from artwork: rgb(${BG.r}, ${BG.g}, ${BG.b})`);

// The artwork resized to `size`, its edge faded to transparent, for the two
// images that pad it. A background that is not perfectly flat (the 2026-10-08
// artwork ranges from 1 to 10 along its edges, against a sample of 4) otherwise
// leaves a faint box where the artwork meets the padding. The mask is a
// rectangle inset 4% and blurred, so alpha is about 2% at the boundary, 50% at 4%
// and about 98% at 8%; the 2026-10-08 lettering and scalpel start at about 9%.
async function feathered(size) {
  const f = Math.round(size * 0.04);
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      `<filter id="b"><feGaussianBlur stdDeviation="${f / 2}"/></filter>` +
      `<rect x="${f}" y="${f}" width="${size - 2 * f}" height="${size - 2 * f}" fill="#fff" filter="url(#b)"/></svg>`,
  );
  return sharp(src)
    .resize(size, size, { fit: "contain", background: BG })
    .ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

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

// Maskable icon: shrink the artwork to 80% on its background, so launcher
// circle/squircle masks don't clip the lettering or the scalpel. The safe zone
// is a centred circle of radius 40%, not the 80% square: this relies on the
// artwork's own margin. For the 2026-10-08 artwork every pixel brighter than 20
// is within 182px of the centre, against a radius of 205px.
{
  const size = 512;
  const inner = Math.round(size * 0.8);
  const resized = await feathered(inner);
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
  const resized = await feathered(inner);
  await sharp({ create: { width: w, height: h, channels: 4, background: BG } })
    .composite([{ input: resized, gravity: "center" }])
    .png()
    .toFile(join(pub, "og-image.png"));
  console.log("wrote public/og-image.png (1200x630)");
}

console.log("done.");
