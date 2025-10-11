const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '..', 'public');
const outputDir = path.join(__dirname, '..', 'public', 'optimized');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const images = ['our-way-01.jpg', 'our-way-02.jpg', 'our-way-03.jpg'];
const widths = [252, 504, 756];
const quality = 85;

async function optimizeImages() {
  console.log('Starting image optimization...\n');

  for (const image of images) {
    const inputPath = path.join(inputDir, image);
    const baseName = path.basename(image, '.jpg');

    console.log(`Processing ${image}...`);

    for (const width of widths) {
      const outputPath = path.join(
        outputDir,
        `${baseName}-${width}w.webp`
      );

      try {
        await sharp(inputPath)
          .resize(width, null, {
            withoutEnlargement: true,
            fit: 'inside',
          })
          .webp({ quality })
          .toFile(outputPath);

        const stats = fs.statSync(outputPath);
        console.log(
          `  ✓ Generated ${baseName}-${width}w.webp (${(stats.size / 1024).toFixed(2)} KB)`
        );
      } catch (error) {
        console.error(`  ✗ Failed to generate ${width}w variant:`, error.message);
      }
    }

    console.log('');
  }

  console.log('Image optimization complete!');
}

optimizeImages().catch(console.error);
