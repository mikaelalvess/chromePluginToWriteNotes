// Simple script to create PNG icons from SVG using Canvas API
// Run this in a browser console or use a tool to convert SVG to PNG

const sizes = [16, 48, 128];
const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="20" fill="#4a90e2"/>
  <text x="64" y="85" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">W</text>
</svg>
`;

console.log('SVG icon created. To generate PNG files:');
console.log('1. Use an online SVG to PNG converter like https://convertio.co/svg-png/');
console.log('2. Upload icon.svg and convert to PNG at sizes: 16x16, 48x48, and 128x128');
console.log('3. Save them as icon16.png, icon48.png, and icon128.png');
console.log('\nAlternatively, use a tool like Inkscape or GIMP to export the SVG to PNG at different sizes.');
