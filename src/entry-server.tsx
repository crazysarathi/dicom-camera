import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { Router, createPath, type To } from 'react-router-dom';
import App from '@/App';
import { notFoundRoute, routeDefs } from '@/routes';
import { renderHead } from '@/lib/seo';
import { siteConfig } from '@/config/site';

// Static server render that produces the same hash-style hrefs ("#/workflows/") as the client's
// HashRouter, so hydrated links navigate client-side instead of reloading through redirect stubs.
const hashNavigator = {
  createHref: (to: To) => `#${typeof to === 'string' ? to : createPath(to)}`,
  push: () => {},
  replace: () => {},
  go: () => {},
};

export function render(url: string) {
  const def = routeDefs.find((r) => r.path === url) ?? notFoundRoute;
  const html = renderToString(
    <StrictMode>
      <Router location={url} navigator={hashNavigator} static>
        <App />
      </Router>
    </StrictMode>,
  );
  return { html, head: renderHead(def.meta), meta: def.meta };
}

export const routeList = routeDefs.map((r) => ({ path: r.path, meta: r.meta }));
export const notFound = { path: notFoundRoute.path, meta: notFoundRoute.meta };
export const config = { origin: siteConfig.origin, indexable: siteConfig.indexable };
