import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from '@/App';
import { notFoundRoute, routeDefs } from '@/routes';
import { renderHead } from '@/lib/seo';
import { siteConfig } from '@/config/site';

export function render(url: string) {
  const def = routeDefs.find((r) => r.path === url) ?? notFoundRoute;
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
  return { html, head: renderHead(def.meta), meta: def.meta };
}

export const routeList = routeDefs.map((r) => ({ path: r.path, meta: r.meta }));
export const notFound = { path: notFoundRoute.path, meta: notFoundRoute.meta };
export const config = { origin: siteConfig.origin, indexable: siteConfig.indexable };
