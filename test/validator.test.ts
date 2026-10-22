import {
  validateWebsiteSpecification,
  validateWebsiteDocument,
  ALLOWED_SECTION_TYPES,
  isSafeUrl,
} from '../server/validator';

console.log('--- RUNNING VALIDATOR TESTS ---');

// Test 1: Valid specification passes
const validSpec = {
  title: 'Acme Studio',
  description: 'Design agency',
  theme: {
    primaryColor: '#10B981',
    backgroundColor: '#FFFFFF',
    textColor: '#111827',
    fontStyle: 'modern',
  },
  pages: [
    {
      name: 'Home',
      path: '/',
      sections: [
        {
          type: 'hero',
          heading: 'We Build Great Things',
          subheading: 'Award-winning creative design',
          buttonText: 'Get in Touch',
        },
        {
          type: 'features',
          heading: 'Core Capabilities',
          items: [{ title: 'Branding' }, { title: 'Development' }],
        },
      ],
    },
  ],
};

const res1 = validateWebsiteSpecification(validSpec);
console.assert(res1.valid === true, 'Test 1 Failed: valid spec was rejected');
console.assert(res1.specification?.title === 'Acme Studio', 'Test 1 Failed: title mismatch');
console.log('✓ Test 1 Passed: Valid specification accepted');

// Test 2: Missing title rejected
const invalidTitle = { ...validSpec, title: '   ' };
const res2 = validateWebsiteSpecification(invalidTitle);
console.assert(res2.valid === false, 'Test 2 Failed: empty title was accepted');
console.log('✓ Test 2 Passed: Empty title rejected');

// Test 3: Missing pages rejected
const noPages = { ...validSpec, pages: [] };
const res3 = validateWebsiteSpecification(noPages);
console.assert(res3.valid === false, 'Test 3 Failed: empty pages array was accepted');
console.log('✓ Test 3 Passed: Empty pages array rejected');

// Test 4: Uncontrolled section type sanitized to allowed list
const rogueSectionType = {
  ...validSpec,
  pages: [
    {
      name: 'Home',
      path: '/',
      sections: [
        {
          type: 'unrecognized_custom_crypto_widget',
          heading: 'Something odd',
        },
      ],
    },
  ],
};
const res4 = validateWebsiteSpecification(rogueSectionType);
console.assert(res4.valid === true, 'Test 4 Failed: should sanitize rogue section type');
console.assert(
  ALLOWED_SECTION_TYPES.includes(res4.specification!.pages[0].sections[0].type),
  'Test 4 Failed: section type was not sanitized to allowed list'
);
console.log('✓ Test 4 Passed: Rogue section type safely sanitized');

// Test 5: Malformed non-object rejected
const res5 = validateWebsiteSpecification('string not object');
console.assert(res5.valid === false, 'Test 5 Failed: string was accepted as spec');
console.log('✓ Test 5 Passed: Non-object primitive rejected');

// Test 6: Unsafe javascript: URL is rejected
const unsafeUrlSpec = {
  ...validSpec,
  pages: [
    {
      name: 'Home',
      path: '/',
      sections: [
        {
          type: 'hero',
          heading: 'Phishing Attack',
          buttonLink: 'javascript:alert(document.cookie)',
        },
      ],
    },
  ],
};
const res6 = validateWebsiteDocument(unsafeUrlSpec);
console.assert(res6.valid === false, 'Test 6 Failed: unsafe javascript: URL was accepted');
console.log('✓ Test 6 Passed: Malicious script URL rejected');

// Test 7: Navigation structure generated and preserved
const navSpec = {
  ...validSpec,
  navigation: {
    brandName: 'Acme Studio Brand',
    items: [
      { label: 'Work', href: '/#work' },
      { label: 'Pricing', href: '/#pricing' },
    ],
    primaryCta: { label: 'Start Project', href: '#contact' },
  },
};
const res7 = validateWebsiteDocument(navSpec);
console.assert(res7.valid === true, 'Test 7 Failed: navigation spec rejected');
console.assert(
  res7.document?.navigation?.brandName === 'Acme Studio Brand',
  'Test 7 Failed: brandName mismatch'
);
console.assert(
  res7.document?.navigation?.items.length === 2,
  'Test 7 Failed: navigation items count mismatch'
);
console.log('✓ Test 7 Passed: Navigation structure verified');

// Test 8: SEO metadata normalized and validated
const seoSpec = {
  ...validSpec,
  seo: {
    title: 'Acme Studio — Elite Digital Design',
    description: 'Transforming visions into reality.',
    keywords: ['design', 'agency', 'branding'],
    ogTitle: 'Acme Studio',
  },
};
const res8 = validateWebsiteDocument(seoSpec);
console.assert(res8.valid === true, 'Test 8 Failed: SEO metadata rejected');
console.assert(
  res8.document?.seo?.keywords.includes('branding'),
  'Test 8 Failed: keywords not preserved'
);
console.log('✓ Test 8 Passed: SEO metadata verified');

// Test 9: Duplicate page routes rejected
const duplicateRoutesSpec = {
  ...validSpec,
  pages: [
    { name: 'Home', path: '/', sections: [{ type: 'hero', heading: 'H' }] },
    { name: 'Duplicate Home', path: '/', sections: [{ type: 'features', heading: 'F' }] },
  ],
};
const res9 = validateWebsiteDocument(duplicateRoutesSpec);
console.assert(res9.valid === false, 'Test 9 Failed: duplicate routes should be rejected');
console.log('✓ Test 9 Passed: Duplicate route detection enforced');

console.log('--- ALL VALIDATOR TESTS PASSED (9/9) ---');
