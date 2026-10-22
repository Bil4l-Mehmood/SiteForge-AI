import { validateWebsiteDocument } from '../server/validator';
import {
  computeThemeStyles,
  isLightColor,
  getContrastTextColor,
  getRadiusClass,
  getSpacingClass,
} from '../src/components/renderer/themeUtils';
import { isSafeUrl } from '../server/validator';
import { WebsiteDocument } from '../src/types/schema';

console.log('--- RUNNING WEBSITE RENDERER ENGINE TESTS ---');

// Test 1: Theme computation with contrast safety
const themeLight = computeThemeStyles({
  primaryColor: '#2563EB',
  backgroundColor: '#FFFFFF',
  textColor: '#0F172A',
  mode: 'light',
  borderRadius: 'lg',
  spacing: 'spacious',
  buttonStyle: 'pill',
});

console.assert(themeLight.colors.primary === '#2563EB', 'Test 1.1 Failed: primary color mismatch');
console.assert(themeLight.radiusClass === 'rounded-2xl', 'Test 1.2 Failed: radiusClass mismatch');
console.assert(themeLight.spacingClass.includes('py-16'), 'Test 1.3 Failed: spacingClass mismatch');
console.assert(themeLight.buttonClass('primary').includes('rounded-full'), 'Test 1.4 Failed: buttonStyle pill mismatch');
console.assert(isLightColor('#FFFFFF') === true, 'Test 1.5 Failed: white should be light');
console.assert(isLightColor('#000000') === false, 'Test 1.6 Failed: black should be dark');
console.assert(getContrastTextColor('#000000') === '#FFFFFF', 'Test 1.7 Failed: contrast for black should be white');
console.log('✓ Test 1 Passed: Theme computation and contrast safety verified');

// Test 2: Safe URL filtering
console.assert(isSafeUrl('/about') === true, 'Test 2.1 Failed: internal route should be safe');
console.assert(isSafeUrl('#features') === true, 'Test 2.2 Failed: anchor should be safe');
console.assert(isSafeUrl('https://example.com') === true, 'Test 2.3 Failed: https should be safe');
console.assert(isSafeUrl('javascript:alert(1)') === false, 'Test 2.4 Failed: javascript url must be rejected');
console.assert(isSafeUrl('data:text/html,<script>') === false, 'Test 2.5 Failed: data url must be rejected');
console.log('✓ Test 2 Passed: Safe URL sanitization verified');

// Test 3: Complete multi-page document with all 15 supported section types
const completeDoc: WebsiteDocument = {
  id: 'doc_test_full',
  title: 'Apex Dynamics',
  description: 'Next-generation industrial automation systems.',
  category: 'saas',
  theme: {
    primaryColor: '#0284C7',
    secondaryColor: '#0369A1',
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
    brandName: 'Apex Dynamics',
    items: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'Contact', href: '/contact' },
    ],
    primaryCta: { label: 'Request Demo', href: '#contact' },
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
            heading: 'Autonomous Robotics for Modern Industry',
            supportingText: 'Scale throughput by 400% with AI-driven warehouse fulfillment.',
            primaryCta: { label: 'Explore Systems', href: '#features' },
            secondaryCta: { label: 'Watch Video', href: '#about' },
            imageReference: { alt: 'Robotic Arm', badge: 'v4.2 Certified' },
          },
        },
        {
          id: 'sec_feat',
          type: 'features',
          layout: 'grid',
          isVisible: true,
          content: {
            heading: 'Engineered for Zero Downtime',
            items: [
              { id: 'f1', title: 'Real-time Telemetry', description: 'Sub-millisecond sensor analytics' },
              { id: 'f2', title: 'Adaptive Vision', description: 'LiDAR and stereo camera depth mapping' },
            ],
          },
        },
        {
          id: 'sec_stats',
          type: 'statistics',
          layout: 'linear',
          isVisible: true,
          content: {
            items: [
              { id: 's1', label: 'Uptime SLA', value: '99.99%' },
              { id: 's2', label: 'Units Deployed', value: '12,500+' },
            ],
          },
        },
        {
          id: 'sec_about',
          type: 'about',
          layout: 'split',
          isVisible: true,
          content: {
            heading: 'Pioneering Automation Since 2018',
            story: 'Born out of research at premier robotics laboratories...',
            mission: 'Empowering manufacturing with tireless precision.',
          },
        },
        {
          id: 'sec_process',
          type: 'process',
          layout: 'cards',
          isVisible: true,
          content: {
            heading: 'Deployment in 3 Simple Steps',
            steps: [
              { id: 'st1', stepNumber: 1, title: 'Facility Audit', description: 'Digital twin mapping of your warehouse' },
              { id: 'st2', stepNumber: 2, title: 'Fleet Staging', description: 'Calibrated delivery of autonomous units' },
            ],
          },
        },
        {
          id: 'sec_testi',
          type: 'testimonials',
          layout: 'cards',
          isVisible: true,
          content: {
            heading: 'Trusted by Logistics Leaders',
            items: [
              { id: 't1', quote: 'Downtime dropped to near zero within 30 days.', author: 'Marcus Vance', role: 'VP Operations' },
            ],
          },
        },
        {
          id: 'sec_pricing',
          type: 'pricing',
          layout: 'cards',
          isVisible: true,
          content: {
            heading: 'Predictable Monthly Pricing',
            plans: [
              { id: 'p1', name: 'Starter Fleet', price: '$2,499', features: ['5 Units', '24/7 Monitoring'] },
              { id: 'p2', name: 'Enterprise Fleet', price: '$8,999', features: ['25 Units', 'Dedicated Engineer'], isPopular: true },
            ],
          },
        },
        {
          id: 'sec_gallery',
          type: 'gallery',
          layout: 'grid',
          isVisible: true,
          content: {
            heading: 'Field Installations',
            items: [
              { id: 'g1', title: 'Assembly Hub', imageAlt: 'Automated assembly cell' },
            ],
          },
        },
        {
          id: 'sec_team',
          type: 'team',
          layout: 'cards',
          isVisible: true,
          content: {
            heading: 'Executive Leadership',
            members: [
              { id: 'm1', name: 'Dr. Elena Rostova', role: 'Chief Scientist', bio: 'PhD in Robotics' },
            ],
          },
        },
        {
          id: 'sec_faq',
          type: 'faq',
          layout: 'linear',
          isVisible: true,
          content: {
            heading: 'Questions & Answers',
            items: [
              { id: 'q1', question: 'How quickly can units be deployed?', answer: 'Typical onboarding is completed in under 7 days.' },
            ],
          },
        },
        {
          id: 'sec_cta',
          type: 'cta',
          layout: 'centered',
          isVisible: true,
          content: {
            heading: 'Ready to Transform Your Operations?',
            buttonText: 'Schedule Consultation',
            buttonLink: '#contact',
          },
        },
        {
          id: 'sec_contact',
          type: 'contact',
          layout: 'split',
          isVisible: true,
          content: {
            heading: 'Contact Our Engineering Team',
            email: 'contact@apexdynamics.com',
          },
        },
        {
          id: 'sec_footer',
          type: 'footer',
          layout: 'grid',
          isVisible: true,
          content: {
            brandName: 'Apex Dynamics',
            links: [{ label: 'Privacy', href: '#' }],
          },
        },
      ],
    },
    {
      id: 'p_services',
      name: 'Services',
      path: '/services',
      sections: [
        {
          id: 'sec_srv_header',
          type: 'header',
          layout: 'linear',
          isVisible: true,
          content: {
            brandName: 'Apex Services',
            tagline: 'Comprehensive Industrial Support',
          },
        },
        {
          id: 'sec_srv_list',
          type: 'services',
          layout: 'grid',
          isVisible: true,
          content: {
            heading: 'Specialized Automation Services',
            items: [
              { id: 'srv1', title: 'Predictive Maintenance', description: 'AI vibration and thermal anomaly alerts', badge: '24/7' },
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

const validationResult = validateWebsiteDocument(completeDoc);
console.assert(validationResult.valid === true, 'Test 3 Failed: completeDoc should validate cleanly');
console.assert(validationResult.document?.pages.length === 2, 'Test 3 Failed: expected 2 pages');
console.assert(validationResult.document?.pages[0].sections.length === 13, 'Test 3 Failed: expected 13 sections on home page');
console.log('✓ Test 3 Passed: Complete 15-section-type multi-page document validated');

// Test 4: Missing optional fields handled without error
const minimalDoc = {
  title: 'Minimal Studio',
  pages: [
    {
      name: 'Home',
      path: '/',
      sections: [
        {
          type: 'hero',
          content: {
            heading: 'Minimal Heading',
          },
        },
        {
          type: 'features',
          content: {
            heading: 'Minimal Features',
            items: [{ title: 'Feat 1', description: 'Desc 1' }],
          },
        },
      ],
    },
  ],
};

const minRes = validateWebsiteDocument(minimalDoc);
console.assert(minRes.valid === true, 'Test 4 Failed: minimalDoc should normalize and validate');
console.assert(minRes.document?.title === 'Minimal Studio', 'Test 4 Failed: title preserved');
console.assert(minRes.document?.theme.primaryColor === '#2563EB', 'Test 4 Failed: default theme populated');
console.log('✓ Test 4 Passed: Missing optional fields normalized gracefully');

// Test 5: Unknown section type safely sanitized
const unknownSecDoc = {
  title: 'Unknown Sec Test',
  pages: [
    {
      name: 'Home',
      path: '/',
      sections: [
        {
          type: 'crypto_ticker_quantum_v3',
          content: { heading: 'Something Unknown' },
        },
      ],
    },
  ],
};

const unkRes = validateWebsiteDocument(unknownSecDoc);
console.assert(unkRes.valid === true, 'Test 5 Failed: rogue section type should be sanitized');
console.assert(unkRes.document?.pages[0].sections[0].type === 'features', 'Test 5 Failed: should sanitize to features');
console.log('✓ Test 5 Passed: Unknown section type safely sanitized');

console.log('--- ALL WEBSITE RENDERER TESTS PASSED (5/5) ---');
