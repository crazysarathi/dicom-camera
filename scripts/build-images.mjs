// Builds optimised public image derivatives from the private originals in ../assets.
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
const ASSETS = path.resolve(ROOT, '..', 'assets');
const OUT = path.join(ROOT, 'public', 'images');
const MANIFEST_TS = path.join(ROOT, 'src', 'images', 'manifest.ts');

// Frame bounds were measured from the originals (first row containing a wide dark run =
// top edge of the device frame). `top` is nudged up a few px to keep the frame's rounded
// corners intact. Bottom = original height (compositions bleed off the canvas bottom)
// except where the device is complete inside the canvas.
const SCREENSHOTS = [
  { id: 'iphone-06', src: 'apple/iphone-06-body-part.png', out: 'iphone-body-part', crop: { left: 40, top: 655, right: 1156, bottom: 2600 },
    alt: 'DICOM Camera on iPhone showing body-part selection.', platform: 'iphone', complete: false,
    caption: 'Body-part selection on iPhone.' },
  { id: 'iphone-01', src: 'apple/iphone-01-home.png', out: 'iphone-capture-options', crop: { left: 40, top: 492, right: 1156, bottom: 2600 },
    alt: 'DICOM Camera capture options on iPhone.', platform: 'iphone', complete: false,
    caption: 'Capture options on iPhone. This earlier screen labels the capture-first option “Quick Photos”.' },
  { id: 'ipad-03', src: 'apple/ipad-03.png', out: 'ipad-capture-options', crop: { left: 64, top: 435, right: 1536, bottom: 2134 },
    alt: 'DICOM Camera on iPad with worklist, patient, Quick Take, and Photo Album entry options.', platform: 'ipad', complete: false,
    caption: 'Capture entry options on iPad, including Quick Take.' },
  { id: 'ipad-04', src: 'apple/ipad-04.png', out: 'ipad-body-part', crop: { left: 64, top: 674, right: 1536, bottom: 2134 },
    alt: 'Body-part selection in DICOM Camera on iPad.', platform: 'ipad', complete: false,
    caption: 'Body-part selection on iPad.' },
  { id: 'android-08', src: 'google-play/android-08.png', out: 'android-body-part', crop: { left: 61, top: 570, right: 1558, bottom: 2845 },
    alt: 'Body-part selection in DICOM Camera on Android.', platform: 'android', complete: true,
    caption: 'Body-part selection on Android.' },
  { id: 'android-10', src: 'google-play/android-10.png', out: 'android-capture-options', crop: { left: 61, top: 727, right: 1558, bottom: 2880 },
    alt: 'DICOM Camera capture options on Android.', platform: 'android', complete: false,
    caption: 'Capture options on Android. This earlier screen labels the capture-first option “Quick Photos”.' },
];

const WIDTHS = [320, 480, 640, 800, 1000];

async function exists(p) { try { await stat(p); return true; } catch { return false; } }

async function buildScreenshot(entry) {
  const srcPath = path.join(ASSETS, entry.src);
  const image = sharp(srcPath);
  const meta = await image.metadata();
  const c = entry.crop;
  const width = c.right - c.left;
  const height = c.bottom - c.top;
  if (c.right > meta.width || c.bottom > meta.height) throw new Error(`Crop out of bounds for ${entry.id}`);
  const base = image.extract({ left: c.left, top: c.top, width, height });
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
    id: entry.id, source: `assets/${entry.src}`, sourceWidth: meta.width, sourceHeight: meta.height,
    crop: { ...c, width, height }, transformation: 'Faithful crop removing the legacy promotional headline above the device frame; app screen and existing frame unchanged. Resized (downscale only) to responsive widths in AVIF, WebP and PNG.',
    platform: entry.platform, complete: entry.complete, alt: entry.alt, caption: entry.caption,
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
  records.push({ id: 'apple-icon', source: 'assets/apple/dicom-camera-app-icon.jpg', transformation: 'Resized square PNG/WebP derivatives (48–512px). Artwork unchanged.', usage: 'Header, footer, favicons, social card, download page.' });
  // Android icon (used only in Android download context).
  for (const s of [64, 128, 256]) {
    await sharp(android).resize(s, s).png({ compressionLevel: 9 }).toFile(path.join(OUT, `android-app-icon-${s}.png`));
  }
  records.push({ id: 'android-icon', source: 'assets/google-play/dicom-camera-app-icon.png', transformation: 'Resized square PNG derivatives (64–256px). Artwork unchanged.', usage: 'Android section of the download page only.' });
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
    { id: 'app-store-badge', source: 'assets/badges/download-on-the-app-store.svg', transformation: 'Copied unchanged.', usage: 'All store-badge groups.' },
    { id: 'google-play-badge', source: 'assets/badges/get-it-on-google-play.png', transformation: `Copied unchanged (${playMeta.width}×${playMeta.height}). Built-in padding preserved; visible badge occupies ~67% of the box height.`, usage: 'All store-badge groups.' },
  ] };
  await writeFile(path.join(ROOT, 'DERIVATIVES.json'), JSON.stringify(derivatives, null, 2));

  const ts = `// GENERATED by scripts/build-images.mjs — do not edit by hand.
export interface ImageSource { w: number; h: number; file: string }
export interface ScreenshotImage {
  id: string; platform: 'iphone' | 'ipad' | 'android'; complete: boolean;
  width: number; height: number; aspect: string; alt: string; caption: string;
  avif: ImageSource[]; webp: ImageSource[]; png: ImageSource[];
}
export const screenshots = {
${shots.map((s) => `  ${JSON.stringify(s.id)}: ${JSON.stringify({ id: s.id, platform: s.platform, complete: s.complete, width: s.width, height: s.height, aspect: s.aspect, alt: s.alt, caption: s.caption, avif: s.outputs.avif, webp: s.outputs.webp, png: s.outputs.png })} as ScreenshotImage,`).join('\n')}
} as const;
export type ScreenshotId = keyof typeof screenshots;
`;
  await writeFile(MANIFEST_TS, ts);
  console.log('manifest written');
}

main().catch((e) => { console.error(e); process.exit(1); });
