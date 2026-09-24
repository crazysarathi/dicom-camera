import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from '@/App';

// Hash-based routing: every route is served from the single prerendered index.html
// (e.g. https://dicom.camera/#/workflows/). The homepage markup is prerendered and hydrated;
// deep links to other hash routes render on the client from a clean container so React never
// tries to hydrate markup for a different page.
const container = document.getElementById('root')!;
const app = (
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);

const hashPath = window.location.hash.replace(/^#/, '');
const isHome = hashPath === '' || hashPath === '/';
if (container.hasChildNodes() && isHome) {
  hydrateRoot(container, app);
} else {
  container.replaceChildren();
  createRoot(container).render(app);
}
