// Rasterizes assets/icon.svg into the PNG icons the PWA + browsers need.
// Run: node scripts/generate-icons.mjs   (requires devDependency "sharp")
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "assets", "icon.svg"));
const out = join(root, "public");
const app = join(root, "src", "app");
mkdirSync(out, { recursive: true });

// Maskable icon needs ~10% safe padding so Android's mask doesn't clip art.
const maskable = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
     <rect width="512" height="512" fill="#3d0a87"/>
     <g transform="translate(51.2,51.2) scale(0.8)">${readFileSync(join(root, "assets", "icon.svg"))
       .toString()
       .replace(/<\?xml.*?\?>/, "")
       .replace(/<svg[^>]*>/, "")
       .replace(/<\/svg>/, "")}</g>
   </svg>`
);

// PWA manifest icons live in /public.
const publicTargets = [
  { file: "icon-192.png", size: 192, src: svg },
  { file: "icon-512.png", size: 512, src: svg },
  { file: "icon-maskable-512.png", size: 512, src: maskable },
];
for (const { file, size, src } of publicTargets) {
  await sharp(src, { density: 384 }).resize(size, size).png().toFile(join(out, file));
  console.log(`wrote public/${file} (${size}x${size})`);
}

// Browser/Apple icons use the Next App Router file convention (src/app/*).
// Next auto-injects the <link> tags and serves them, avoiding the reserved
// /apple-touch-icon.png route that shadows static files.
const appTargets = [
  { file: "icon.png", size: 32, src: svg },
  { file: "apple-icon.png", size: 180, src: svg },
];
for (const { file, size, src } of appTargets) {
  await sharp(src, { density: 384 }).resize(size, size).png().toFile(join(app, file));
  console.log(`wrote src/app/${file} (${size}x${size})`);
}
