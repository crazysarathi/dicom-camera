import { screenshots, type ScreenshotId } from '@/images/manifest';
import { cn } from '@/lib/utils';

interface ScreenshotFigureProps {
  image: ScreenshotId;
  /** Only the true hero image should be priority-loaded. */
  priority?: boolean;
  /** `sizes` attribute describing the rendered width, e.g. "(min-width: 1024px) 420px, 80vw". */
  sizes?: string;
  className?: string;
  imgClassName?: string;
  /** false = no caption; true = manifest caption; string = custom caption. */
  caption?: boolean | string;
  /** Fade the hard-cut bottom edge of compositions that bleed off the original canvas. */
  bleed?: boolean;
  /** Override the manifest alt text when the surrounding copy already describes the screen. */
  alt?: string;
  id?: string;
}

/**
 * Responsive, genuine store screenshot. Originals already include the device frame; no extra frame is added.
 * Emits AVIF and WebP sources with a PNG fallback and explicit dimensions to avoid layout shift.
 * The crop is tight to the device frame and the canvas outside the frame is transparent (see scripts/build-images.mjs).
 * Screen-only derivatives (no device frame in the artwork) get rounded corners and a hairline ring so they read as an app screen.
 */
export function ScreenshotFigure({ image, priority = false, sizes = '(min-width: 1024px) 420px, 80vw', className, imgClassName, caption = false, bleed, alt, id }: ScreenshotFigureProps) {
  const img = screenshots[image];
  const srcSet = (list: { w: number; file: string }[]) => list.map((s) => `${s.file} ${s.w}w`).join(', ');
  const fallback = img.png[Math.min(img.png.length - 1, 3)];
  const captionText = caption === true ? img.caption : typeof caption === 'string' ? caption : undefined;
  const priorityAttrs = priority ? { fetchpriority: 'high' } : {};
  return (
    <figure id={id} className={cn('m-0', className)}>
      <picture className={cn('block', bleed && !img.complete && 'screen-bleed-mask')}>
        <source type="image/avif" srcSet={srcSet(img.avif)} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet(img.webp)} sizes={sizes} />
        <img
          src={fallback.file}
          srcSet={srcSet(img.png)}
          sizes={sizes}
          width={img.width}
          height={img.height}
          alt={alt ?? img.alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          className={cn('h-auto w-full', img.screenOnly && 'rounded-[4%] ring-1 ring-ink/15', imgClassName)}
          style={{ aspectRatio: img.aspect }}
          {...priorityAttrs}
        />
      </picture>
      {captionText && <figcaption className="mt-3 text-sm text-muted-foreground">{captionText}</figcaption>}
    </figure>
  );
}
