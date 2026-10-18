const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Render at N and downsample; drawing in normalized coords scaled by S.
function render(S) {
  const img = Buffer.alloc(S * S * 4);
  const set = (x, y, r, g, b, a) => {
    const i = (y * S + x) * 4;
    // straight-alpha over (transparent background)
    const da = img[i + 3] / 255;
    const oa = a + da * (1 - a);
    if (oa <= 0) return;
    img[i] = Math.round((r * a + img[i] * da * (1 - a)) / oa);
    img[i + 1] = Math.round((g * a + img[i + 1] * da * (1 - a)) / oa);
    img[i + 2] = Math.round((b * a + img[i + 2] * da * (1 - a)) / oa);
    img[i + 3] = Math.round(oa * 255);
  };
  const smooth = (d, aa) => Math.max(0, Math.min(1, 0.5 - d / aa));

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      const n = px / S + py / S; // 0..2 diagonal
      // indigo gradient: #4f46e5 -> #4338ca-ish blend toward #6366f1 highlight
      const t = Math.min(1, Math.max(0, n / 2));
      const r = Math.round(79 + t * 13);
      const g = Math.round(70 + t * 32);
      const b = Math.round(229 + t * 7);
      // rounded-square mask (radius 22%)
      const rad = 0.22 * S;
      const cx = Math.min(Math.max(px, rad), S - rad);
      const cy = Math.min(Math.max(py, rad), S - rad);
      const dSq = (px - cx) ** 2 + (py - cy) ** 2;
      const mask = smooth(Math.sqrt(dSq) - rad, 1.5);
      if (mask <= 0) continue;

      // person glyph: head circle + shoulders, white, within safe zone (~centered, 56%)
      let alpha = 0;
      const hx = S / 2;
      const hy = S * 0.40;
      const hr = S * 0.115;
      const dHead = Math.hypot(px - hx, py - hy) - hr;
      alpha = Math.max(alpha, smooth(dHead, 1.5));
      // shoulders: rounded rectangle centered lower
      const sy0 = S * 0.545;
      const sy1 = S * 0.80;
      const sxHalf = S * 0.205;
      const srad = S * 0.10;
      if (py > sy0 && py < sy1) {
        const qx = Math.abs(px - hx);
        const qy = Math.max(sy0 + srad - py, py - (sy1 - srad));
        const dShoulder = Math.hypot(Math.max(qx - (sxHalf - srad), 0), Math.max(qy, 0)) - srad;
        if (qx <= sxHalf && py < sy0 + srad) alpha = Math.max(alpha, smooth(dShoulder, 1.5));
        else if (qx <= sxHalf) alpha = Math.max(alpha, 1);
      }
      // blend white glyph over gradient
      const R = Math.round(r * (1 - alpha) + 255 * alpha);
      const G = Math.round(g * (1 - alpha) + 255 * alpha);
      const B = Math.round(b * (1 - alpha) + 255 * alpha);
      set(x, y, R, G, B, mask);
    }
  }
  return img;
}

function downscale(img, S, T) {
  const out = Buffer.alloc(T * T * 4);
  const f = S / T;
  for (let y = 0; y < T; y++) {
    for (let x = 0; x < T; x++) {
      const x0 = Math.floor(x * f);
      const x1 = Math.min(S, Math.floor((x + 1) * f));
      const y0 = Math.floor(y * f);
      const y1 = Math.min(S, Math.floor((y + 1) * f));
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const i = (yy * S + xx) * 4;
          r += img[i] * img[i + 3];
          g += img[i + 1] * img[i + 3];
          b += img[i + 2] * img[i + 3];
          a += img[i + 3];
          n++;
        }
      }
      const o = (y * T + x) * 4;
      if (a > 0) {
        out[o] = Math.round(r / a);
        out[o + 1] = Math.round(g / a);
        out[o + 2] = Math.round(b / a);
        out[o + 3] = Math.round(a / n);
      }
    }
  }
  return out;
}

const outDir = path.join('public', 'icons');
fs.mkdirSync(outDir, { recursive: true });

const S = 1024;
const base = render(S);
fs.writeFileSync(path.join(outDir, 'icon-512.png'), encodePNG(512, 512, downscale(base, S, 512)));
fs.writeFileSync(path.join(outDir, 'icon-192.png'), encodePNG(192, 192, downscale(base, S, 192)));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), encodePNG(180, 180, downscale(base, S, 180)));
console.log('icons written');
