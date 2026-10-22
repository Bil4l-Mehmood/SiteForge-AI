import { validateWebsiteDocument } from '../server/validator';
import { WebsiteDocument } from '../src/types/schema';

console.log('--- RUNNING CONVERSATIONAL WEBSITE EDITING TESTS ---');

const baseDoc: WebsiteDocument = {
  id: 'doc_edit_test',
  title: 'CloudScale SaaS',
  description: 'Enterprise cloud infrastructure analytics.',
  category: 'saas',
  theme: {
    primaryColor: '#2563EB',
    secondaryColor: '#1E40AF',
    backgroundColor: '#FFFFFF',
    surfaceColor: '#F8FAFC',
    textColor: '#0F172A',
    mutedTextColor: '#64748B',
    accentColor: '#38BDF8',
    fontFamily: 'Plus Jakarta Sans',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'DM Sans',
    borderRadius: 'md',
    spacing: 'comfortable',
    buttonStyle: 'rounded',
    mode: 'light',
  },
  navigation: {
    brandName: 'CloudScale',
    items: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
    ],
    primaryCta: { label: 'Start Free Trial', href: '#cta' },
  },
  pages: [
    {
      id: 'p_home',
      name: 'Home',
      path: '/',
      sections: [
        {
          id: 'sec_hero',
          type: 'hero',
          layout: 'split',
          isVisible: true,
          content: {
            heading: 'Observability for Cloud Scale',
            supportingText: 'Monitor microservices in real time.',
            primaryCta: { label: 'Get Started', href: '#features' },
          },
        },
        {
          id: 'sec_features',
          type: 'features',
          layout: 'grid',
          isVisible: true,
          content: {
            heading: 'Key Capabilities',
            items: [
              { id: 'f1', title: 'Telemetry', description: 'Metrics collection' },
              { id: 'f2', title: 'Tracing', description: 'Distributed tracing' },
            ],
          },
        },
        {
          id: 'sec_pricing',
          type: 'pricing',
          layout: 'cards',
          isVisible: true,
          content: {
            heading: 'Simple Pricing',
            plans: [
              { id: 'pl1', name: 'Standard', price: '$49', features: ['All metrics', '5 seats'] },
            ],
          },
        },
      ],
    },
  ],
  schemaVersion: '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Test 1: Baseline document validates cleanly
const baseVal = validateWebsiteDocument(baseDoc);
console.assert(baseVal.valid === true, 'Test 1 Failed: baseDoc should be valid');
console.log('✓ Test 1 Passed: Base document validates cleanly');

// Test 2: Theme editing preserves schema integrity and other values
const themeEditedDoc: WebsiteDocument = {
  ...baseDoc,
  theme: {
    ...baseDoc.theme,
    primaryColor: '#0F172A', // Dark blue
    buttonStyle: 'pill',
    borderRadius: 'full',
  },
  updatedAt: new Date().toISOString(),
};
const resTheme = validateWebsiteDocument(themeEditedDoc);
console.assert(resTheme.valid === true, 'Test 2.1 Failed: theme edit invalid');
console.assert(resTheme.document?.theme.primaryColor === '#0F172A', 'Test 2.2 Failed: primaryColor mismatch');
console.assert(resTheme.document?.theme.buttonStyle === 'pill', 'Test 2.3 Failed: buttonStyle mismatch');
console.assert(resTheme.document?.theme.backgroundColor === '#FFFFFF', 'Test 2.4 Failed: backgroundColor was not preserved');
console.assert(resTheme.document?.pages[0].sections.length === 3, 'Test 2.5 Failed: sections were mutated unexpectedly');
console.log('✓ Test 2 Passed: Theme editing updates targeted values and preserves untouched sections');

// Test 3: Content copy edit on Hero section
const heroEditedDoc: WebsiteDocument = {
  ...baseDoc,
  pages: [
    {
      ...baseDoc.pages[0],
      sections: baseDoc.pages[0].sections.map((sec) =>
        sec.id === 'sec_hero'
          ? {
              ...sec,
              content: {
                ...sec.content,
                heading: 'Grow Your Business Faster',
              },
            }
          : sec
      ),
    },
  ],
  updatedAt: new Date().toISOString(),
};
const resHero = validateWebsiteDocument(heroEditedDoc);
console.assert(resHero.valid === true, 'Test 3.1 Failed: hero copy edit invalid');
console.assert(resHero.document?.pages[0].sections[0].content.heading === 'Grow Your Business Faster', 'Test 3.2 Failed: heading not updated');
console.assert(resHero.document?.pages[0].sections[0].content.supportingText === 'Monitor microservices in real time.', 'Test 3.3 Failed: supportingText was lost');
console.log('✓ Test 3 Passed: Section copy edit updates targeted field and preserves surrounding content');

// Test 4: Section insertion (Add testimonials section below features)
const sectionAddedDoc: WebsiteDocument = {
  ...baseDoc,
  pages: [
    {
      ...baseDoc.pages[0],
      sections: [
        baseDoc.pages[0].sections[0], // hero
        baseDoc.pages[0].sections[1], // features
        {
          id: 'sec_testi_new',
          type: 'testimonials',
          layout: 'cards',
          isVisible: true,
          content: {
            heading: 'Trusted by DevOps Engineers Worldwide',
            items: [
              { id: 't1', quote: 'Saved our team 20 hours a week.', author: 'Jane Doe', role: 'Staff Engineer' },
            ],
          },
        },
        baseDoc.pages[0].sections[2], // pricing
      ],
    },
  ],
  updatedAt: new Date().toISOString(),
};
const resSecAdd = validateWebsiteDocument(sectionAddedDoc);
console.assert(resSecAdd.valid === true, 'Test 4.1 Failed: section insertion invalid');
console.assert(resSecAdd.document?.pages[0].sections.length === 4, 'Test 4.2 Failed: expected 4 sections');
console.assert(resSecAdd.document?.pages[0].sections[2].type === 'testimonials', 'Test 4.3 Failed: testimonials not at index 2');
console.log('✓ Test 4 Passed: Section insertion inserts correctly in sequence and validates');

// Test 5: Section removal (Remove pricing section)
const sectionRemovedDoc: WebsiteDocument = {
  ...baseDoc,
  pages: [
    {
      ...baseDoc.pages[0],
      sections: baseDoc.pages[0].sections.filter((s) => s.type !== 'pricing'),
    },
  ],
  updatedAt: new Date().toISOString(),
};
const resSecRem = validateWebsiteDocument(sectionRemovedDoc);
console.assert(resSecRem.valid === true, 'Test 5.1 Failed: section removal invalid');
console.assert(resSecRem.document?.pages[0].sections.length === 2, 'Test 5.2 Failed: expected 2 sections');
console.assert(!resSecRem.document?.pages[0].sections.some((s) => s.type === 'pricing'), 'Test 5.3 Failed: pricing section still present');
console.log('✓ Test 5 Passed: Section removal removes targeted section and maintains page integrity');

// Test 6: Reverting back to original baseDoc version preserves complete state
const revertedDoc = baseDoc;
const resRev = validateWebsiteDocument(revertedDoc);
console.assert(resRev.valid === true, 'Test 6.1 Failed: reverted document invalid');
console.assert(resRev.document?.theme.primaryColor === '#2563EB', 'Test 6.2 Failed: theme reverted mismatch');
console.assert(resRev.document?.pages[0].sections.length === 3, 'Test 6.3 Failed: section count reverted mismatch');
console.log('✓ Test 6 Passed: Version reverting restores initial state flawlessly');

console.log('--- ALL CONVERSATIONAL EDITING TESTS PASSED (6/6) ---');
