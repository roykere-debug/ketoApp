#!/usr/bin/env node
/**
 * Generate MyKeto app icons for iOS and Android
 * Uses SVG templates and Sharp for image processing
 *
 * Usage: npm run generate:icons
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Colors matching the app theme
const colors = {
  darkBg: '#0A0A0C',
  maroon: '#800020',
  accent: '#10b981',
  white: '#FFFFFF',
  gray50: '#F5F5F7',
};

const assetsDir = path.join(__dirname, '..', 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

/**
 * Create SVG with K logo and maroon background
 */
function createLogoSvg(size = 1024) {
  const padding = size * 0.1;
  const innerSize = size - padding * 2;
  const radius = Math.round(innerSize * 0.15);

  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- Dark background -->
      <rect width="${size}" height="${size}" fill="${colors.darkBg}"/>

      <!-- Rounded rectangle with maroon background -->
      <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}"
            rx="${radius}" ry="${radius}" fill="${colors.maroon}"/>

      <!-- K text -->
      <text x="${size / 2}" y="${size / 2}"
            font-family="Arial, sans-serif"
            font-size="${Math.round(size * 0.45)}"
            font-weight="bold"
            text-anchor="middle"
            dominant-baseline="central"
            fill="${colors.white}">K</text>

      <!-- Optional accent circle on corner -->
      <circle cx="${size - size * 0.13}" cy="${size - size * 0.13}"
              r="${Math.round(size * 0.08)}" fill="${colors.accent}"/>
    </svg>
  `;
}

/**
 * Create adaptive icon SVG (foreground only, transparent background)
 */
function createAdaptiveIconSvg(size = 1024) {
  const padding = size * 0.1;
  const innerSize = size - padding * 2;
  const radius = Math.round(innerSize * 0.15);

  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- Transparent background -->
      <rect width="${size}" height="${size}" fill="none"/>

      <!-- Rounded rectangle with maroon background -->
      <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}"
            rx="${radius}" ry="${radius}" fill="${colors.maroon}"/>

      <!-- K text -->
      <text x="${size / 2}" y="${size / 2}"
            font-family="Arial, sans-serif"
            font-size="${Math.round(size * 0.45)}"
            font-weight="bold"
            text-anchor="middle"
            dominant-baseline="central"
            fill="${colors.white}">K</text>
    </svg>
  `;
}

/**
 * Convert SVG to PNG
 */
async function svgToPng(svgContent, outputPath, width, height) {
  try {
    await sharp(Buffer.from(svgContent), { density: 150 })
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      .png()
      .toFile(outputPath);
    console.log(`✓ Created: ${path.basename(outputPath)}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to create ${path.basename(outputPath)}:`, error.message);
    return false;
  }
}

/**
 * Main function to generate all icons
 */
async function generateIcons() {
  console.log('\n🎨 MyKeto App Icon Generator\n');
  console.log(`📁 Output directory: ${assetsDir}\n`);

  const icons = [
    {
      name: 'icon.png',
      size: 1024,
      description: 'Main app icon (1024×1024)',
      svgGenerator: createLogoSvg,
    },
    {
      name: 'splash-icon.png',
      size: 1024,
      description: 'Splash screen icon (1024×1024)',
      svgGenerator: createLogoSvg,
    },
    {
      name: 'adaptive-icon.png',
      size: 1024,
      description: 'Android adaptive icon foreground (1024×1024)',
      svgGenerator: createAdaptiveIconSvg,
    },
    {
      name: 'favicon.png',
      size: 192,
      description: 'Web favicon (192×192)',
      svgGenerator: createLogoSvg,
    },
  ];

  let successCount = 0;

  for (const icon of icons) {
    process.stdout.write(`   ${icon.description}... `);
    const svg = icon.svgGenerator(icon.size);
    const outputPath = path.join(assetsDir, icon.name);
    const success = await svgToPng(svg, outputPath, icon.size, icon.size);
    if (success) successCount++;
  }

  console.log(`\n${successCount}/${icons.length} icons generated successfully!\n`);

  if (successCount === icons.length) {
    console.log('✅ All app icons are ready!\n');
    console.log('📦 Next steps for TestFlight:\n');
    console.log('   1. Make sure sharp is installed: npm install --save-dev sharp');
    console.log('   2. Run: npm run generate:icons');
    console.log('   3. Install EAS CLI: npm install -g eas-cli');
    console.log('   4. Build for iOS: eas build --platform ios');
    console.log('   5. Submit to TestFlight via App Store Connect\n');
    return true;
  } else {
    console.log('⚠️  Some icons failed to generate. Check the errors above.\n');
    return false;
  }
}

// Run the generator
generateIcons().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
