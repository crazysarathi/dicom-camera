import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { a11yLabels, headerCta, headerNav } from '@/content/nav';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // When a menu link navigates, close the sheet and let focus land on #main (ScrollManager) instead of
  // Radix returning it to the "Open navigation" button.
  const closedByNavigation = useRef(false);
  useEffect(() => {
    setOpen((wasOpen) => {
      if (wasOpen) closedByNavigation.current = true;
      return false;
    });
  }, [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'inline-flex min-h-11 items-center rounded-md px-3 text-[0.95rem] font-medium no-underline transition-colors hover:text-ink',
      isActive ? 'text-ink' : 'text-muted-foreground',
    );

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 h-[var(--header-h)] border-b transition-[background-color,border-color,box-shadow] duration-200',
        scrolled ? 'border-line bg-surface/90 shadow-[0_1px_0_rgba(20,34,53,0.04)] backdrop-blur-md' : 'border-transparent bg-surface/70 backdrop-blur-sm',
      )}
    >
      <div className="container-content flex h-full items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Primary" className="hidden lg:flex lg:items-center lg:gap-1">
          {headerNav.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {({ isActive }) => (
                <span className={cn('relative py-1', isActive && 'after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-primary')}>{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to={headerCta.to}>{headerCta.label}</Link>
          </Button>
          <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
            <DialogPrimitive.Trigger asChild>
              <Button variant="secondary" size="icon" className="lg:hidden" aria-label={a11yLabels.openNav} aria-expanded={open} aria-controls="mobile-navigation">
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
              <DialogPrimitive.Content
                id="mobile-navigation"
                aria-label="Site navigation"
                onCloseAutoFocus={(event) => {
                  if (!closedByNavigation.current) return;
                  event.preventDefault();
                  closedByNavigation.current = false;
                  document.getElementById('main')?.focus({ preventScroll: true });
                }}
                className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-card outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right data-[state=closed]:duration-200 data-[state=open]:duration-300"
              >
                <div className="flex h-[var(--header-h)] items-center justify-between border-b border-line px-5">
                  <DialogPrimitive.Title asChild>
                    <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Menu</span>
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description className="sr-only">Site navigation links and the download page.</DialogPrimitive.Description>
                  <DialogPrimitive.Close asChild>
                    <Button variant="secondary" size="icon" aria-label={a11yLabels.closeNav}>
                      <X className="size-5" aria-hidden="true" />
                    </Button>
                  </DialogPrimitive.Close>
                </div>
                <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
                  {headerNav.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn('flex min-h-12 items-center rounded-lg px-4 text-lg font-medium no-underline hover:bg-secondary', isActive ? 'bg-primary-soft text-primary-deep' : 'text-ink')
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                  <Button asChild size="lg" className="mt-4">
                    <Link to={headerCta.to}>{headerCta.label}</Link>
                  </Button>
                </nav>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>
        </div>
      </div>
    </header>
  );
}
