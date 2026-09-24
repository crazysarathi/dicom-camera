import { Link } from 'react-router-dom';
import type { PageMeta } from '@/lib/seo';
import { useDocumentMeta } from '@/lib/seo';
import { Section } from '@/components/Section';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { routes } from '@/config/site';

export const meta: PageMeta = {
  title: 'Page not found | DICOM Camera',
  description: 'This page may have moved, or the address may be incorrect.',
  path: '/404.html',
  noindex: true,
};

export default function NotFoundPage() {
  useDocumentMeta(meta);
  return (
    <Section className="min-h-[60vh]">
      <Breadcrumbs items={[{ label: 'Page not found' }]} className="mb-6" />
      <p className="eyebrow mb-3">Error 404</p>
      <h1>Page not found.</h1>
      <p className="lede mt-4">This page may have moved, or the address may be incorrect.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg"><Link to={routes.home}>Return home</Link></Button>
        <Button asChild variant="secondary" size="lg"><Link to={routes.download}>Get the app</Link></Button>
        <Button asChild variant="outline" size="lg"><Link to={routes.support}>Contact support</Link></Button>
      </div>
    </Section>
  );
}
