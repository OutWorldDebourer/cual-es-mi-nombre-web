// Render the brand icon to a 120x120 PNG used as the logo on the Google
// OAuth consent screen. Google requires exactly 120x120 PNG with the app
// branding. We keep a single source of truth (src/app/icon.svg) and
// rasterize on demand rather than hand-authoring a parallel PNG.
//
// Usage:  node scripts/build-oauth-logo.mjs
// Output: public/oauth-logo-120.png

import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(ROOT, "..");
const SRC = path.join(REPO, "src", "app", "icon.svg");
const OUT = path.join(REPO, "public", "oauth-logo-120.png");

await sharp(SRC, { density: 600 })
  .resize(120, 120, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

const meta = await sharp(OUT).metadata();
console.log(
  `oauth-logo-120.png -> ${meta.width}x${meta.height}, ${meta.format}, ${meta.size}B`,
);
