import type { ComponentType } from 'react';
import type { PageMeta } from '@/lib/seo';
import { routes } from '@/config/site';
import HomePage, { meta as homeMeta } from '@/pages/Home';
import WorkflowsPage, { meta as workflowsMeta } from '@/pages/Workflows';
import EnterprisePage, { meta as enterpriseMeta } from '@/pages/Enterprise';
import IntegrationPage, { meta as integrationMeta } from '@/pages/Integration';
import PrivacyRetentionPage, { meta as privacyMeta } from '@/pages/PrivacyRetention';
import DownloadPage, { meta as downloadMeta } from '@/pages/Download';
import SupportPage, { meta as supportMeta } from '@/pages/Support';
import ContactPage, { meta as contactMeta } from '@/pages/Contact';
import NotFoundPage, { meta as notFoundMeta } from '@/pages/NotFound';

export interface RouteDef {
  path: string;
  meta: PageMeta;
  Component: ComponentType;
}

export const routeDefs: RouteDef[] = [
  { path: routes.home, meta: homeMeta, Component: HomePage },
  { path: routes.workflows, meta: workflowsMeta, Component: WorkflowsPage },
  { path: routes.enterprise, meta: enterpriseMeta, Component: EnterprisePage },
  { path: routes.integration, meta: integrationMeta, Component: IntegrationPage },
  { path: routes.privacy, meta: privacyMeta, Component: PrivacyRetentionPage },
  { path: routes.download, meta: downloadMeta, Component: DownloadPage },
  { path: routes.support, meta: supportMeta, Component: SupportPage },
  { path: routes.contact, meta: contactMeta, Component: ContactPage },
];

export const notFoundRoute: RouteDef = { path: '/404.html', meta: notFoundMeta, Component: NotFoundPage };
