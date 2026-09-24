// Approved copy for /contact/ (WEBSITE-COPY.md §8). Edit text here, not in the page component.
import { ENTERPRISE_MANAGER_TOPIC, routes, siteConfig } from '@/config/site';

export const contactContent = {
  eyebrow: 'Contact',
  title: 'Discuss DICOM Camera for your organisation.',
  intro:
    'Tell us about your clinical capture workflow and the systems you want to connect. We can discuss PACS integration, worklists, patient demographic queries, and retention requirements.',
  primaryAction: {
    label: 'Email Raster',
    email: siteConfig.email.commercial,
    note: 'Opens your email application.',
  },
  /**
   * Enquiry topics that arrive through the query string (e.g. /#/contact/?topic=enterprise-manager from the
   * Enterprise Manager call to action). The matching email route carries the topic in its subject line.
   */
  topics: {
    [ENTERPRISE_MANAGER_TOPIC]: {
      label: 'Enquiry topic',
      name: siteConfig.enterpriseManager.name,
      email: siteConfig.email.enterpriseManager,
      formTopic: 'Enterprise Manager',
      note: 'Your email will open with the Enterprise Manager subject line. Mention your clinical teams, licence requirements, integration settings and retention policies.',
    },
  } as Record<string, { label: string; name: string; email: { address: string; href: string }; formTopic: string; note: string }>,
  details: {
    id: 'useful-details',
    title: 'Useful details to include',
    items: [
      'Organisation and department.',
      'Intended clinical capture workflow.',
      'App platform and devices under consideration.',
      'PACS/archive and required interfaces, if known.',
      'Your question or deployment requirement.',
    ],
    caution: 'Please do not include patient information or clinical images.',
  },
  support: {
    id: 'product-support',
    title: 'Need product support?',
    // Rendered as: "Email {address} for help with an existing installation." with the address linked.
    before: 'Email ',
    after: ' for help with an existing installation.',
    email: siteConfig.email.support,
    link: { label: 'Support and frequently asked questions', to: routes.support },
  },
  // Only rendered when siteConfig.contactFormEndpoint is configured (a real form service).
  form: {
    id: 'enquiry-form',
    title: 'Send an enquiry',
    labels: {
      name: 'Name',
      email: 'Work email',
      organisation: 'Organisation',
      topic: 'Enquiry topic',
      pacs: 'PACS/archive',
      platform: 'App platform',
      message: 'Message',
    },
    optional: 'optional',
    topics: ['Hospital deployment', 'Enterprise Manager', 'Integration', 'Commercial enquiry'],
    platforms: ['iOS', 'Android', 'Both', 'Not sure'],
    note: 'Please do not include patient information.',
    submit: 'Send enquiry',
    submitting: 'Sending enquiry',
    success: 'Your enquiry has been sent.',
    error: "We couldn't send your enquiry. Please try again or email info@raster.in.",
    offline: 'You appear to be offline, so the enquiry cannot be sent from this page right now. You can email Raster instead once you are connected.',
    validation: {
      required: 'This field is required.',
      email: 'Enter a valid email address.',
      select: 'Choose an option.',
      summary: 'Check the highlighted fields and try again.',
    },
  },
} as const;
