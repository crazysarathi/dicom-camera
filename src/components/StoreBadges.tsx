import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

interface StoreBadgesProps {
  size?: 'md' | 'lg';
  className?: string;
  /** Optional accessible name for the group, e.g. "Download DICOM Camera". */
  label?: string;
  /** Row (wraps) or a left-aligned column. */
  layout?: 'row' | 'column';
}

// The official Google Play PNG (646×250) carries built-in clear space: the visible badge occupies
// x 41–605, y 41–209. We size the box so the visible badge is at least as large as the App Store
// badge, and pull the clear space back with negative margins so both badges align on their edges.
const PLAY = { w: 646, h: 250, padX: 41 / 646, padY: 41 / 250 };
const APP_STORE_RATIO = 119.66 / 40;

export function StoreBadges({ size = 'md', className, label = 'Download DICOM Camera', layout = 'row' }: StoreBadgesProps) {
  const appStoreH = size === 'lg' ? 56 : 48; // px (visible badge height)
  const appStoreW = Math.round(appStoreH * APP_STORE_RATIO);
  const playH = Math.round(appStoreH / (1 - 2 * PLAY.padY)); // box height so the visible badge ≈ appStoreH
  const playW = Math.round(playH * (PLAY.w / PLAY.h));
  const playPadX = Math.round(playW * PLAY.padX);
  const playPadY = Math.round(playH * PLAY.padY);
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('flex gap-x-3 gap-y-3', layout === 'row' ? 'flex-wrap items-center' : 'flex-col items-start', className)}
    >
      <a href={siteConfig.stores.appStore.url} className="inline-flex shrink-0 rounded-lg" rel="noopener">
        <img src={siteConfig.stores.appStore.badge} width={appStoreW} height={appStoreH} alt={siteConfig.stores.appStore.label} style={{ height: appStoreH, width: 'auto' }} decoding="async" />
      </a>
      <a href={siteConfig.stores.googlePlay.url} className="inline-flex shrink-0 rounded-lg" rel="noopener">
        <img
          src={siteConfig.stores.googlePlay.badge}
          width={playW}
          height={playH}
          alt={siteConfig.stores.googlePlay.label}
          style={{ height: playH, width: 'auto', margin: `${-playPadY}px ${-playPadX}px`, maxWidth: 'none' }}
          decoding="async"
        />
      </a>
    </div>
  );
}
