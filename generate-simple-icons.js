const fs = require('fs');

// Create a simple colored PNG using raw PNG data
// This creates a visible blue square

function createColoredPNG(size, r, g, b) {
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

  // Create image data - simple solid color
  const bytesPerPixel = 3; // RGB
  const bytesPerRow = width * bytesPerPixel + 1; // +1 for filter byte
  const imageDataSize = height * bytesPerRow;
  const rawData = Buffer.alloc(imageDataSize);

  for (let y = 0; y < height; y++) {
    rawData[y * bytesPerRow] = 0; // filter byte (none)
    for (let x = 0; x < width; x++) {
      const offset = y * bytesPerRow + 1 + x * bytesPerPixel;
      rawData[offset] = r;     // Red
      rawData[offset + 1] = g; // Green
      rawData[offset + 2] = b; // Blue
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

// Create blue icons (RGB: 74, 144, 226 = #4a90e2)
console.log('Creating icons...');

fs.writeFileSync('icon16.png', createColoredPNG(16, 74, 144, 226));
console.log('Created icon16.png (16x16, blue)');

fs.writeFileSync('icon48.png', createColoredPNG(48, 74, 144, 226));
console.log('Created icon48.png (48x48, blue)');

fs.writeFileSync('icon128.png', createColoredPNG(128, 74, 144, 226));
console.log('Created icon128.png (128x128, blue)');

console.log('\nDone! Icons are now visible blue squares.');
console.log('To verify: file icon16.png (should show 16 x 16)');
