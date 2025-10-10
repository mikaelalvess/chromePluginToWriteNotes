const fs = require('fs');
const { createCanvas } = require('canvas');

// Function to create an icon with text
function createIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background with rounded corners (draw as circle for simplicity)
  ctx.fillStyle = '#4a90e2';
  ctx.fillRect(0, 0, size, size);

  // Draw rounded rectangle
  const radius = size * 0.15;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fillStyle = '#4a90e2';
  ctx.fill();

  // Draw "W" text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('W', size / 2, size / 2 + size * 0.05);

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Created ${filename} (${size}x${size})`);
}

// Try to create icons, fall back if canvas package is not available
try {
  createIcon(16, 'icon16.png');
  createIcon(48, 'icon48.png');
  createIcon(128, 'icon128.png');
  console.log('\nIcons created successfully!');
} catch (error) {
  console.log('Canvas package not available. Please install it with: npm install canvas');
  console.log('Or use the alternative method below...\n');
}
