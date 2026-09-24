import { Outlet } from 'react-router-dom';
import { SkipLink } from '@/components/SkipLink';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { MotionProvider } from '@/components/MotionProvider';
import { ScrollManager } from '@/components/ScrollManager';
import { Toaster } from '@/components/ui/sonner';
import { BackToTop } from '@/components/BackToTop';

export function Layout() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <ScrollManager />
      <MotionProvider>
        <main id="main" tabIndex={-1} className="pt-[var(--header-h)] outline-none">
          <Outlet />
        </main>
        <SiteFooter />
      </MotionProvider>
      <BackToTop />
      <Toaster />
    </>
  );
}
