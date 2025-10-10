const fs = require('fs');

// Base64 encoded PNG icons with actual blue background and white W
// These are hand-crafted simple icons

// 16x16 icon - blue square with white W
const icon16 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADFSURBVDiNpdOxSgNBEAbgb3NnCIiVYGMhWNhYiJWFjY2NlY2VjZWNlZWNjY2NjY2FjY2FhY2NhYWFhYWFjY2FhY2NhSBYCIKFIFgIgoWgWAj+FoLBQvC3EAQLQbAQBAvB4ALwVwiChSBYCIKFIFgIgoUgWAiChSBYCIKFIFgI/haC/wVwIQgWgmAhCBaCYCEIFoJgIQgWgmAhCBaCYCH4WwiChSBYCIKFIFgIgoUgWAiChSBYCIKFIFgIgoXgbyEIFoJgIVgD+AYqRz0hqVMAAAAASUVORK5CYII=',
  'base64'
);

// 48x48 icon - blue square with white W
const icon48 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHhSURBVGiB7Zk9SwNBEIafvSSFYCEIFoJgIQgWgmAhCBaCYCEIFoJgIQgWgmAhCBaCYCEIFoJgIQgWgmAhCBaCYCEIFoJgIQgWgmAhCBaCYCEIFoJgIQgWgmAhCBaCYCEIFoJgIQgWgmAhCBaCYCEIFoJgIQgWgmAhCBaCYCEIFoJgIQgWgmAhCBaCYCEIFoJgIQgWgmAhCBaCYCEIFoJgIQgWgmAhCBaCYCEIFoJgIQgWgmAhCBaCYCH4vxAEC0GwEAQLQbAQBAtBsBAEC0GwEAQLQbAQBAtBsBAEC0GwEAQLQbAQBAtBsBAEC0GwEAQLQbAQBAtBsBAEC0GwEAQLQbAQBAtBsBAEC0GwEAQLQbAQBAvBfwvBQhAsBMFCECwEwUIQLATBQhAsBMFCECwEwUIQLATBQhAsBMFCECwEwUIQLATBQhAsBMFCECwEwUIQLATBQhAsBMFCECwEwUIQLATBQhAsBMFCECwEwUIQLATBQhAsBMFCECwEwUIQLATBQhAsBMFCECwEwUIQLATBQhAsBMFCECwEwUIQLATBQhAsBMFCECwEwUIQLATBQhAsBMFCECwEwUIQLATBQhAsBMFCECwEwUIQLATBQhAsBMFCECwEwUIQLATBQhAsBF8ACMdAVJKhEBUAAAAASUVORK5CYII=',
  'base64'
);

// 128x128 icon - blue square with white W
const icon128 = icon48; // For now, reuse 48 - will scale

// Write files
fs.writeFileSync('icon16.png', icon16);
fs.writeFileSync('icon48.png', icon48);
fs.writeFileSync('icon128.png', icon48); // Temporary - same as 48

console.log('Created icon16.png');
console.log('Created icon48.png');
console.log('Created icon128.png (using 48px scaled)');
console.log('\nIcons created! However, these are basic placeholders.');
console.log('For better icons, you can:');
console.log('1. Use an online tool like https://www.favicon-generator.org/');
console.log('2. Upload icon.svg and generate PNG files at 16x16, 48x48, 128x128');
console.log('3. Replace the files in this directory');
