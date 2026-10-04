import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function createPng(width, height, drawPixel) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8 bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // deflate
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // no interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with filter byte 0 per row
  const rawRowLen = 1 + width * 4;
  const rawData = Buffer.alloc(rawRowLen * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rawRowLen;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Icon Drawing Function for SarkariPixel
function drawSarkariPixelIcon(x, y, w, h) {
  const nx = (x / w) * 2 - 1; // -1 to 1
  const ny = (y / h) * 2 - 1;
  const distSq = nx * nx + ny * ny;

  // Rounded squircle background
  const rCorner = 0.85;
  const inBox = Math.pow(Math.abs(nx), 4) + Math.pow(Math.abs(ny), 4) < rCorner;
  if (!inBox) {
    return [0, 0, 0, 0]; // transparent
  }

  // Deep Royal Blue Gradient (#2563EB to #1E3A8A)
  const grad = (ny + 1) / 2;
  const rBase = Math.round(37 * (1 - grad) + 30 * grad);
  const gBase = Math.round(99 * (1 - grad) + 58 * grad);
  const bBase = Math.round(235 * (1 - grad) + 138 * grad);

  // Central Shield Outline & Fill
  const shieldTop = -0.65;
  const shieldBottom = 0.65;
  const shieldWidth = 0.62;

  let inShield = false;
  let onShieldBorder = false;

  if (ny >= shieldTop && ny <= shieldBottom) {
    let curWidth = shieldWidth;
    if (ny > 0) {
      // Curve down to a point
      const t = ny / shieldBottom;
      curWidth = shieldWidth * (1 - Math.pow(t, 2));
    }
    if (Math.abs(nx) <= curWidth) {
      inShield = true;
      if (Math.abs(nx) >= curWidth - 0.08 || ny <= shieldTop + 0.08 || (ny > 0 && Math.abs(nx) >= curWidth - 0.12)) {
        onShieldBorder = true;
      }
    }
  }

  // Checkmark inside shield
  // Path: (-0.3, 0.05) -> (-0.08, 0.28) -> (0.32, -0.25)
  let onCheckmark = false;
  // Seg 1
  const seg1Dist = distToSegment(nx, ny, -0.28, 0.05, -0.06, 0.26);
  // Seg 2
  const seg2Dist = distToSegment(nx, ny, -0.06, 0.26, 0.28, -0.2);

  if (seg1Dist < 0.09 || seg2Dist < 0.09) {
    onCheckmark = true;
  }

  // Pixel Accent Dot (top right corner of shield)
  const dotDist = Math.hypot(nx - 0.38, ny - (-0.48));
  const inDot = dotDist < 0.12;

  if (inDot) {
    return [56, 189, 248, 255]; // Sky 400
  }

  if (onCheckmark) {
    return [255, 255, 255, 255]; // Pure White Checkmark
  }

  if (onShieldBorder) {
    return [56, 189, 248, 255]; // Sky Blue Shield Border
  }

  if (inShield) {
    // Semi-translucent shield interior
    return [
      Math.round(rBase * 0.4 + 16 * 0.6),
      Math.round(gBase * 0.4 + 185 * 0.6),
      Math.round(bBase * 0.4 + 129 * 0.6),
      255
    ];
  }

  return [rBase, gBase, bBase, 255];
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

function createIco(pngBuffers) {
  // ICO header
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = ICO type
  header.writeUInt16LE(pngBuffers.length, 4); // number of images

  let offset = 6 + pngBuffers.length * 16;
  const dirEntries = [];
  const imageDatas = [];

  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(item.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset

    dirEntries.push(entry);
    imageDatas.push(item.buffer);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...imageDatas]);
}

// Generate all target sizes
const publicDir = path.resolve('public');
const iconsDir = path.resolve('public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating Google & PWA compliant favicons and icons...');

const png48 = createPng(48, 48, drawSarkariPixelIcon);
fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), png48);

const png96 = createPng(96, 96, drawSarkariPixelIcon);
fs.writeFileSync(path.join(publicDir, 'favicon-96x96.png'), png96);

const png180 = createPng(180, 180, drawSarkariPixelIcon);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);

const png192 = createPng(192, 192, drawSarkariPixelIcon);
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), png192);

const png512 = createPng(512, 512, drawSarkariPixelIcon);
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), png512);

// Create multi-size favicon.ico (48x48 and 96x96)
const ico = createIco([
  { width: 48, height: 48, buffer: png48 },
  { width: 96, height: 96, buffer: png96 },
]);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);

console.log('Successfully created:');
console.log(' - /public/favicon-48x48.png');
console.log(' - /public/favicon-96x96.png');
console.log(' - /public/apple-touch-icon.png');
console.log(' - /public/favicon.ico');
console.log(' - /public/icons/icon-192x192.png');
console.log(' - /public/icons/icon-512x512.png');
