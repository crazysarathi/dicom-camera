// Builds optimised public image derivatives from the private originals in assets-source/.
// Originals are never modified. Each derivative is a faithful crop that removes the
// legacy promotional headline above the device frame; the app screen and existing
// device frame are unchanged. The crop record is written to src/images/manifest.ts
// and to public/images/derivatives.json for the asset provenance report.
import sharp from 'sharp';
import { mkdir, writeFile, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
// Original store artwork lives inside the site folder (assets-source/), never modified; not deployed.
const ASSETS = path.resolve(ROOT, 'assets-source');
const OUT = path.join(ROOT, 'public', 'images');
const MANIFEST_TS = path.join(ROOT, 'src', 'images', 'manifest.ts');

// Frame bounds were measured from the originals (first row containing a wide dark run = top edge
// of the device frame; first/last dark columns = sides), inset by 1px so the crop starts on the
// frame itself and no white canvas remains around it. Bottom = original height (compositions bleed
// off the canvas bottom) except where the device is complete inside the canvas.
const SCREENSHOTS = [
  { id: 'iphone-06', src: 'apple/iphone-06-body-part.png', out: 'iphone-body-part', crop: { left: 61, top: 670, right: 1136, bottom: 2600 },
    alt: 'DICOM Camera on iPhone showing body-part selection.', platform: 'iphone', complete: false,
    caption: 'Body-part selection on iPhone.' },
  { id: 'iphone-01', src: 'apple/iphone-01-home.png', out: 'iphone-capture-options', crop: { left: 61, top: 507, right: 1136, bottom: 2600 },
    alt: 'DICOM Camera capture options on iPhone.', platform: 'iphone', complete: false,
    caption: 'Capture options on iPhone. This earlier screen labels the capture-first option “Quick Photos”.' },
  { id: 'ipad-03', src: 'apple/ipad-03.png', out: 'ipad-capture-options', crop: { left: 85, top: 450, right: 1515, bottom: 2134 },
    alt: 'DICOM Camera on iPad with worklist, patient, Quick Take, and Photo Album entry options.', platform: 'ipad', complete: false,
    caption: 'Capture entry options on iPad, including Quick Take.' },
  { id: 'ipad-04', src: 'apple/ipad-04.png', out: 'ipad-body-part', crop: { left: 85, top: 689, right: 1516, bottom: 2134 },
    alt: 'Body-part selection in DICOM Camera on iPad.', platform: 'ipad', complete: false,
    caption: 'Body-part selection on iPad.' },
  // The Google Play compositions show the app on a tablet-proportioned device mockup. The site presents
  // the app screen itself (a faithful crop inside the frame) so Android reads as an app screen, not a tablet.
  { id: 'android-08', src: 'google-play/android-08.png', out: 'android-body-part', crop: { left: 142, top: 651, right: 1459, bottom: 2759 }, screenOnly: true,
    alt: 'Body-part selection in DICOM Camera on Android.', platform: 'android', complete: true,
    caption: 'Body-part selection on Android.' },
  { id: 'android-10', src: 'google-play/android-10.png', out: 'android-capture-options', crop: { left: 142, top: 808, right: 1460, bottom: 2880 }, screenOnly: true,
    alt: 'DICOM Camera capture options on Android.', platform: 'android', complete: false,
    caption: 'Capture options on Android. This earlier screen labels the capture-first option “Quick Photos”.' },
];

const WIDTHS = [320, 480, 640, 800, 1000];

async function exists(p) { try { await stat(p); return true; } catch { return false; } }

/**
 * Flood-fills near-white pixels connected to the image border and sets their alpha to 0.
 * Only the surrounding canvas is affected: the dark device frame encloses the screen, so white UI
 * pixels inside the screen are never reached. Anti-aliased frame edge pixels get partial alpha.
 */
function makeCanvasTransparent(rgba, width, height) {
  const out = Buffer.from(rgba);
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0, tail = 0;
  const isCanvas = (i) => out[i * 4] > 225 && out[i * 4 + 1] > 225 && out[i * 4 + 2] > 225;
  const push = (i) => { if (!visited[i] && isCanvas(i)) { visited[i] = 1; queue[tail++] = i; } };
  for (let x = 0; x < width; x++) { push(x); push((height - 1) * width + x); }
  for (let y = 0; y < height; y++) { push(y * width); push(y * width + width - 1); }
  while (head < tail) {
    const i = queue[head++];
    const x = i % width, y = (i - x) / width;
    out[i * 4 + 3] = 0;
    if (x > 0) push(i - 1);
    if (x < width - 1) push(i + 1);
    if (y > 0) push(i - width);
    if (y < height - 1) push(i + width);
  }
  // Soften the 1px anti-aliased rim: light pixels touching the transparent region get proportional alpha.
  for (let i = 0; i < width * height; i++) {
    if (visited[i]) continue;
    const x = i % width, y = (i - x) / width;
    const nearClear = (x > 0 && visited[i - 1]) || (x < width - 1 && visited[i + 1]) || (y > 0 && visited[i - width]) || (y < height - 1 && visited[i + width]);
    if (!nearClear) continue;
    const l = (out[i * 4] + out[i * 4 + 1] + out[i * 4 + 2]) / 3;
    if (l > 120) out[i * 4 + 3] = Math.round(255 * Math.max(0, Math.min(1, (255 - l) / 135)));
  }
  return out;
}

async function buildScreenshot(entry) {
  const srcPath = path.join(ASSETS, entry.src);
  const image = sharp(srcPath);
  const meta = await image.metadata();
  const c = entry.crop;
  const width = c.right - c.left;
  const height = c.bottom - c.top;
  if (c.right > meta.width || c.bottom > meta.height) throw new Error(`Crop out of bounds for ${entry.id}`);
  // Extract the frame crop, then make the store composition's white canvas OUTSIDE the device frame
  // transparent (flood fill from the outer edges). The frame and the app screen are untouched.
  const { data, info } = await image.clone().extract({ left: c.left, top: c.top, width, height }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const cutout = entry.screenOnly ? data : makeCanvasTransparent(data, info.width, info.height);
  const base = sharp(cutout, { raw: { width: info.width, height: info.height, channels: 4 } });
  const outputs = { avif: [], webp: [], png: [] };
  await mkdir(OUT, { recursive: true });
  for (const w of WIDTHS.filter((w) => w <= width)) {
    const h = Math.round((height * w) / width);
    const resized = base.clone().resize({ width: w, height: h, fit: 'fill', kernel: 'lanczos3' });
    const stem = `${entry.out}-${w}`;
    await resized.clone().avif({ quality: 62, effort: 6 }).toFile(path.join(OUT, `${stem}.avif`));
    await resized.clone().webp({ quality: 84, effort: 5 }).toFile(path.join(OUT, `${stem}.webp`));
    await resized.clone().png({ compressionLevel: 9, palette: false }).toFile(path.join(OUT, `${stem}.png`));
    outputs.avif.push({ w, h, file: `/images/${stem}.avif` });
    outputs.webp.push({ w, h, file: `/images/${stem}.webp` });
    outputs.png.push({ w, h, file: `/images/${stem}.png` });
  }
  return {
    id: entry.id, source: `assets-source/${entry.src}`, sourceWidth: meta.width, sourceHeight: meta.height,
    crop: { ...c, width, height }, transformation: entry.screenOnly
      ? 'Faithful crop to the app screen inside the device frame (removes the legacy promotional headline and the tablet-proportioned device mockup); screen content unchanged. Resized (downscale only) to responsive widths in AVIF, WebP and PNG.'
      : 'Faithful crop to the existing device frame (removes the legacy promotional headline); the white canvas outside the frame is made transparent; app screen and frame unchanged. Resized (downscale only) to responsive widths in AVIF, WebP and PNG (all with alpha).',
    platform: entry.platform, complete: entry.complete, screenOnly: !!entry.screenOnly, alt: entry.alt, caption: entry.caption,
    aspect: `${width} / ${height}`, width, height, outputs,
  };
}

async function buildIcons() {
  const apple = path.join(ASSETS, 'apple', 'dicom-camera-app-icon.jpg');
  const android = path.join(ASSETS, 'google-play', 'dicom-camera-app-icon.png');
  const records = [];
  // Product mark (Apple icon, preserved artwork) at a few sizes with squircle-safe square output.
  for (const s of [48, 64, 96, 128, 192, 256, 512]) {
    await sharp(apple).resize(s, s).png({ compressionLevel: 9 }).toFile(path.join(OUT, `app-icon-${s}.png`));
    await sharp(apple).resize(s, s).webp({ quality: 90 }).toFile(path.join(OUT, `app-icon-${s}.webp`));
  }
  records.push({ id: 'apple-icon', source: 'assets-source/apple/dicom-camera-app-icon.jpg', transformation: 'Resized square PNG/WebP derivatives (48–512px). Artwork unchanged.', usage: 'Header, footer, favicons, social card, download page.' });
  // Android icon (used only in Android download context).
  for (const s of [64, 128, 256]) {
    await sharp(android).resize(s, s).png({ compressionLevel: 9 }).toFile(path.join(OUT, `android-app-icon-${s}.png`));
  }
  records.push({ id: 'android-icon', source: 'assets-source/google-play/dicom-camera-app-icon.png', transformation: 'Resized square PNG derivatives (64–256px). Artwork unchanged.', usage: 'Android section of the download page only.' });
  // Favicons + touch icons.
  await sharp(apple).resize(32, 32).png().toFile(path.join(ROOT, 'public', 'favicon-32.png'));
  await sharp(apple).resize(16, 16).png().toFile(path.join(ROOT, 'public', 'favicon-16.png'));
  await sharp(apple).resize(180, 180).png().toFile(path.join(ROOT, 'public', 'apple-touch-icon.png'));
  await sharp(apple).resize(192, 192).png().toFile(path.join(ROOT, 'public', 'icon-192.png'));
  await sharp(apple).resize(512, 512).png().toFile(path.join(ROOT, 'public', 'icon-512.png'));
  // ICO container built from 16/32/48 PNGs (simple ICO writer, PNG-compressed entries).
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(sizes.map((s) => sharp(apple).resize(s, s).png().toBuffer()));
  const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
  const dirs = []; let offset = 6 + 16 * sizes.length;
  pngs.forEach((buf, i) => { const d = Buffer.alloc(16); const s = sizes[i]; d.writeUInt8(s === 256 ? 0 : s, 0); d.writeUInt8(s === 256 ? 0 : s, 1); d.writeUInt8(0, 2); d.writeUInt8(0, 3); d.writeUInt16LE(1, 4); d.writeUInt16LE(32, 6); d.writeUInt32LE(buf.length, 8); d.writeUInt32LE(offset, 12); offset += buf.length; dirs.push(d); });
  await writeFile(path.join(ROOT, 'public', 'favicon.ico'), Buffer.concat([header, ...dirs, ...pngs]));
  return records;
}

async function buildSocialCard(heroRecord) {
  // 1200x630 card: near-white background, product mark + wordmark, hero screenshot at right.
  const W = 1200, H = 630;
  const icon = await sharp(path.join(ASSETS, 'apple', 'dicom-camera-app-icon.jpg')).resize(112, 112).png().toBuffer();
  const heroW = 380;
  const heroH = Math.round((heroRecord.height * heroW) / heroRecord.width);
  const heroTop = 90;
  const heroVisibleH = Math.min(heroH, H - heroTop);
  const hero = await sharp(path.join(ASSETS, 'apple', 'iphone-06-body-part.png')).extract({ left: heroRecord.crop.left, top: heroRecord.crop.top, width: heroRecord.crop.width, height: heroRecord.crop.height }).resize(heroW, heroH).extract({ left: 0, top: 0, width: heroW, height: heroVisibleH }).png().toBuffer();
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="#F7F9FC"/>
    <rect x="0" y="${H - 6}" width="${W}" height="6" fill="#175CD3"/>
    <text x="96" y="286" font-family="Inter, 'DejaVu Sans', Arial, sans-serif" font-size="56" font-weight="700" fill="#142235">DICOM Camera</text>
    <text x="96" y="352" font-family="Inter, 'DejaVu Sans', Arial, sans-serif" font-size="30" fill="#526173">Your mobile device. A DICOM modality.</text>
    <text x="96" y="404" font-family="Inter, 'DejaVu Sans', Arial, sans-serif" font-size="24" fill="#526173">Clinical photos and video for PACS · iOS and Android</text>
  </svg>`;
  await sharp(Buffer.from(svg))
    .composite([
      { input: icon, left: 96, top: 120 },
      { input: hero, left: W - heroW - 96, top: heroTop },
    ])
    .jpeg({ quality: 88 })
    .toFile(path.join(ROOT, 'public', 'social-card.jpg'));
  return { id: 'social-card', sources: ['apple-icon', 'iphone-06'], transformation: 'Composite 1200×630 JPEG: app icon, typeset wordmark, cropped iPhone body-part screenshot on near-white background.', usage: 'Open Graph / Twitter card image.' };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  await mkdir(path.dirname(MANIFEST_TS), { recursive: true });
  const shots = [];
  for (const e of SCREENSHOTS) { shots.push(await buildScreenshot(e)); console.log('built', e.id); }
  const iconRecords = await buildIcons();
  const social = await buildSocialCard(shots[0]);
  // Badges are copied unchanged (official artwork).
  await mkdir(path.join(ROOT, 'public', 'badges'), { recursive: true });
  await writeFile(path.join(ROOT, 'public', 'badges', 'download-on-the-app-store.svg'), await readFile(path.join(ASSETS, 'badges', 'download-on-the-app-store.svg')));
  await writeFile(path.join(ROOT, 'public', 'badges', 'get-it-on-google-play.png'), await readFile(path.join(ASSETS, 'badges', 'get-it-on-google-play.png')));
  const playMeta = await sharp(path.join(ASSETS, 'badges', 'get-it-on-google-play.png')).metadata();

  const derivatives = { generated: new Date().toISOString().slice(0, 10), screenshots: shots, icons: iconRecords, social, badges: [
    { id: 'app-store-badge', source: 'assets-source/badges/download-on-the-app-store.svg', transformation: 'Copied unchanged.', usage: 'All store-badge groups.' },
    { id: 'google-play-badge', source: 'assets-source/badges/get-it-on-google-play.png', transformation: `Copied unchanged (${playMeta.width}×${playMeta.height}). Built-in padding preserved; visible badge occupies ~67% of the box height.`, usage: 'All store-badge groups.' },
  ] };
  await writeFile(path.join(ROOT, 'DERIVATIVES.json'), JSON.stringify(derivatives, null, 2));

  const ts = `// GENERATED by scripts/build-images.mjs — do not edit by hand.
export interface ImageSource { w: number; h: number; file: string }
export interface ScreenshotImage {
  id: string; platform: 'iphone' | 'ipad' | 'android'; complete: boolean;
  /** True when the derivative is the bare app screen (no device frame in the image). */
  screenOnly: boolean;
  width: number; height: number; aspect: string; alt: string; caption: string;
  avif: ImageSource[]; webp: ImageSource[]; png: ImageSource[];
}
export const screenshots = {
${shots.map((s) => `  ${JSON.stringify(s.id)}: ${JSON.stringify({ id: s.id, platform: s.platform, complete: s.complete, screenOnly: s.screenOnly, width: s.width, height: s.height, aspect: s.aspect, alt: s.alt, caption: s.caption, avif: s.outputs.avif, webp: s.outputs.webp, png: s.outputs.png })} as ScreenshotImage,`).join('\n')}
} as const;
export type ScreenshotId = keyof typeof screenshots;
`;
  await writeFile(MANIFEST_TS, ts);
  console.log('manifest written');
}

main().catch((e) => { console.error(e); process.exit(1); });
