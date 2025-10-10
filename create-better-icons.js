const fs = require('fs');

// Create better looking PNG icons with improved color scheme
// Using a nice orange/coral color (#FF6B35) which stands out better

function createBetterPNG(size, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk (image header)
  const width = size;
  const height = size;
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdr = createChunk('IHDR', ihdrData);

  // Create image data with gradient effect
  const bytesPerPixel = 3; // RGB
  const bytesPerRow = width * bytesPerPixel + 1; // +1 for filter byte
  const imageDataSize = height * bytesPerRow;
  const rawData = Buffer.alloc(imageDataSize);

  const centerX = width / 2;
  const centerY = height / 2;
  const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let y = 0; y < height; y++) {
    rawData[y * bytesPerRow] = 0; // filter byte (none)
    for (let x = 0; x < width; x++) {
      const offset = y * bytesPerRow + 1 + x * bytesPerPixel;

      // Calculate distance from center for gradient
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const factor = 1 - (distance / maxDistance) * 0.3; // Subtle gradient

      rawData[offset] = Math.floor(r * factor);     // Red
      rawData[offset + 1] = Math.floor(g * factor); // Green
      rawData[offset + 2] = Math.floor(b * factor); // Blue
    }
  }

  // Compress with zlib
  const zlib = require('zlib');
  const compressedData = zlib.deflateSync(rawData);

  const idat = createChunk('IDAT', compressedData);

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(calculateCRC(crcData), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function calculateCRC(data) {
  let crc = 0xFFFFFFFF;

  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }

  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Create icons with nice orange/coral color (RGB: 255, 107, 53 = #FF6B35)
// This color is warm, friendly, and highly visible
console.log('Creating better icons with improved color...');

fs.writeFileSync('icon16.png', createBetterPNG(16, 255, 107, 53));
console.log('Created icon16.png (16x16, vibrant orange)');

fs.writeFileSync('icon48.png', createBetterPNG(48, 255, 107, 53));
console.log('Created icon48.png (48x48, vibrant orange)');

fs.writeFileSync('icon128.png', createBetterPNG(128, 255, 107, 53));
console.log('Created icon128.png (128x128, vibrant orange)');

console.log('\nDone! Icons now have a vibrant orange color that stands out better.');
console.log('Color: #FF6B35 (Vibrant Orange)');
