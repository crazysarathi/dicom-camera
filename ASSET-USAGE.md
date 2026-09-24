# Asset usage and provenance

Generated from `DERIVATIVES.json` (image build of 2026-09-24). Originals live in `assets-source/` and are never modified; `assets-source/asset-manifest.json` records source URLs, dimensions, checksums, retrieval date and review flags for every original in the package.

## Screenshots used on the public site

| Asset ID | Original | Crop (left, top, width × height of original) | Transformation | Where used | Alt text |
| --- | --- | --- | --- | --- | --- |
| iphone-06 | `assets-source/apple/iphone-06-body-part.png` (1197×2600) | 61, 670, 1075×1930 | Faithful crop to the existing device frame (removes the legacy promotional headline); the white canvas outside the frame is made transparent; app screen and frame unchanged. Resized (downscale only) to responsive widths in AVIF, WebP and PNG (all with alpha). Widths: 320w, 480w, 640w, 800w, 1000w (`public/images/iphone-body-part-*`). | Homepage hero (priority image); homepage gallery (iPhone); How it works (patient-first section); Download page (iPhone and iPad panel) | DICOM Camera on iPhone showing body-part selection. |
| iphone-01 | `assets-source/apple/iphone-01-home.png` (1197×2600) | 61, 507, 1075×2093 | Faithful crop to the existing device frame (removes the legacy promotional headline); the white canvas outside the frame is made transparent; app screen and frame unchanged. Resized (downscale only) to responsive widths in AVIF, WebP and PNG (all with alpha). Widths: 320w, 480w, 640w, 800w, 1000w (`public/images/iphone-capture-options-*`). | Homepage gallery (iPhone). Caption notes the earlier "Quick Photos" label. | DICOM Camera capture options on iPhone. |
| ipad-03 | `assets-source/apple/ipad-03.png` (1600×2134) | 85, 450, 1430×1684 | Faithful crop to the existing device frame (removes the legacy promotional headline); the white canvas outside the frame is made transparent; app screen and frame unchanged. Resized (downscale only) to responsive widths in AVIF, WebP and PNG (all with alpha). Widths: 320w, 480w, 640w, 800w, 1000w (`public/images/ipad-capture-options-*`). | Homepage flexible-capture section; homepage gallery (iPad); How it works (Quick Take section); Enterprise hero aside | DICOM Camera on iPad with worklist, patient, Quick Take, and Photo Album entry options. |
| ipad-04 | `assets-source/apple/ipad-04.png` (1600×2134) | 85, 689, 1431×1445 | Faithful crop to the existing device frame (removes the legacy promotional headline); the white canvas outside the frame is made transparent; app screen and frame unchanged. Resized (downscale only) to responsive widths in AVIF, WebP and PNG (all with alpha). Widths: 320w, 480w, 640w, 800w, 1000w (`public/images/ipad-body-part-*`). | Homepage gallery (iPad) | Body-part selection in DICOM Camera on iPad. |
| android-08 | `assets-source/google-play/android-08.png` (1620×2880) | 142, 651, 1317×2108 | Faithful crop to the app screen inside the device frame (removes the legacy promotional headline and the tablet-proportioned device mockup); screen content unchanged. Resized (downscale only) to responsive widths in AVIF, WebP and PNG. Widths: 320w, 480w, 640w, 800w, 1000w (`public/images/android-body-part-*`). | Homepage gallery (Android); Download page (Android panel) | Body-part selection in DICOM Camera on Android. |
| android-10 | `assets-source/google-play/android-10.png` (1620×2880) | 142, 808, 1318×2072 | Faithful crop to the app screen inside the device frame (removes the legacy promotional headline and the tablet-proportioned device mockup); screen content unchanged. Resized (downscale only) to responsive widths in AVIF, WebP and PNG. Widths: 320w, 480w, 640w, 800w, 1000w (`public/images/android-capture-options-*`). | Homepage gallery (Android). Caption notes the earlier "Quick Photos" label. | DICOM Camera capture options on Android. |

Android note: the Google Play compositions show the app on a tablet-proportioned device mockup. To avoid presenting Android as a tablet, the site shows the app screen itself (a faithful crop inside the frame, displayed as a bordered screen). If the owner supplies Android phone screenshots, add them to `scripts/build-images.mjs` and rebuild.

Not used on the public site (per `ASSETS.md` review flags): iphone-02, 03, 04, 05, 07, 08, 09, 10; ipad-01, 02, 05, 06, 07; android-01, 02, 03, 04, 05, 06, 07, 09. The private contact sheets in `../asset-previews/` are not deployed.

## Icons, badges and social card

| Asset ID | Original | Transformation | Usage |
| --- | --- | --- | --- |
| apple-icon | `assets-source/apple/dicom-camera-app-icon.jpg` | Resized square PNG/WebP derivatives (48–512px). Artwork unchanged. | Header, footer, favicons, social card, download page. |
| android-icon | `assets-source/google-play/dicom-camera-app-icon.png` | Resized square PNG derivatives (64–256px). Artwork unchanged. | Android section of the download page only. |
| app-store-badge | `assets-source/badges/download-on-the-app-store.svg` | Copied unchanged. | All store-badge groups. |
| google-play-badge | `assets-source/badges/get-it-on-google-play.png` | Copied unchanged (646×250). Built-in padding preserved; visible badge occupies ~67% of the box height. | All store-badge groups. |
| social-card | apple-icon, iphone-06 | Composite 1200×630 JPEG: app icon, typeset wordmark, cropped iPhone body-part screenshot on near-white background. | Open Graph / Twitter card image. |

Favicons (`favicon.ico` 16/32/48, `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png` 180, `icon-192.png`, `icon-512.png`) are resized copies of the Apple app icon.

Store badges are the official artwork, linked only to the verified listings: App Store `https://apps.apple.com/in/app/dicom-camera/id6459410698`, Google Play `https://play.google.com/store/apps/details?id=com.raster.dicomcamera`. The footer carries the Apple and Google trademark attribution line.
