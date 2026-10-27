import sharp from 'sharp';
import fs from 'fs';

async function createDocsIcon() {
  const readerPath = 'C:\\Users\\mjd20\\OneDrive\\Desktop\\pdf\\docs\\assets\\reader.png';
  const destPath = 'C:\\Users\\mjd20\\OneDrive\\Desktop\\otium-docs\\app-icon.png';

  const laserOverlaySvg = Buffer.from(`
    <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="laserGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00e599" stop-opacity="0"/>
          <stop offset="20%" stop-color="#00e599" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#ffffff" stop-opacity="1"/>
          <stop offset="80%" stop-color="#00e599" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#00e599" stop-opacity="0"/>
        </linearGradient>
        <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
          <stop offset="35%" stop-color="#00e599" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="#00e599" stop-opacity="0"/>
        </radialGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
        </filter>
      </defs>

      <rect x="140" y="508" width="744" height="12" fill="url(#laserGrad)" filter="url(#glow)" />
      <rect x="180" y="512" width="664" height="4" fill="url(#laserGrad)" />

      <circle cx="512" cy="514" r="28" fill="url(#coreGlow)" filter="url(#glow)" />
      <circle cx="512" cy="514" r="6" fill="#ffffff" />
    </svg>
  `);

  await sharp(readerPath)
    .resize(1024, 1024)
    .composite([{ input: laserOverlaySvg, top: 0, left: 0 }])
    .png({ quality: 100 })
    .toFile(destPath);

  console.log('Successfully generated Otium Docs master icon:', destPath);
}

createDocsIcon().catch(err => {
  console.error(err);
  process.exit(1);
});
