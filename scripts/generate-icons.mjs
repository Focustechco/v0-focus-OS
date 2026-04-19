import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourceImage = 'C:\\Users\\adria\\.gemini\\antigravity\\brain\\3282fc4c-3c80-472a-91df-407e0cd169bd\\media__1776007497552.png';
const outDir = path.join(process.cwd(), 'public', 'icons');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const sizes = [72, 96, 120, 128, 144, 152, 167, 180, 192, 384, 512];

async function generate() {
  for (const size of sizes) {
    await sharp(sourceImage)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(path.join(outDir, `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);
  }
}

generate().catch(console.error);
