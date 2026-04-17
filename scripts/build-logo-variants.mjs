// Rasterize each SVG in src/app/icon-variants/ to a 120x120 PNG in
// public/oauth-logo-variants/. Use `node scripts/build-logo-variants.mjs`
// to produce comparison assets before picking the final logo.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(ROOT, "..");
const SRC_DIR = path.join(REPO, "src", "app", "icon-variants");
const OUT_DIR = path.join(REPO, "public", "oauth-logo-variants");

await fs.mkdir(OUT_DIR, { recursive: true });

const entries = await fs.readdir(SRC_DIR);
const svgs = entries.filter((f) => f.endsWith(".svg"));

for (const svg of svgs) {
  const src = path.join(SRC_DIR, svg);
  const out = path.join(OUT_DIR, svg.replace(/\.svg$/, ".png"));
  await sharp(src, { density: 600 })
    .resize(120, 120, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(out);
  const meta = await sharp(out).metadata();
  console.log(
    `${svg} -> ${path.basename(out)}  ${meta.width}x${meta.height}`,
  );
}
