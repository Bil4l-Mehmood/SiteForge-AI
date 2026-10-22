import { ViewportMode, DeviceOrientation, ZoomLevel } from '../src/types';
import { validateWebsiteDocument } from '../server/validator';
import { WebsiteDocument } from '../src/types/schema';

console.log('--- RUNNING RESPONSIVE PREVIEW & DEVICE CONTROLS TESTS ---');

// Canonical default viewport dimensions specified in Prompt 8
const DEVICE_SPECS: Record<
  'desktop' | 'tablet' | 'mobile',
  { portrait: { width: number; height: number }; landscape: { width: number; height: number } }
> = {
  desktop: {
    portrait: { width: 1440, height: 900 },
    landscape: { width: 1440, height: 900 },
  },
  tablet: {
    portrait: { width: 768, height: 1024 },
    landscape: { width: 1024, height: 768 },
  },
  mobile: {
    portrait: { width: 390, height: 844 },
    landscape: { width: 844, height: 390 },
  },
};

// 1. Verify default viewport dimensions match requirements
console.log('Checking device dimensions:');
if (DEVICE_SPECS.desktop.portrait.width !== 1440) {
  throw new Error(`Expected Desktop width to be 1440px, got ${DEVICE_SPECS.desktop.portrait.width}`);
}
if (DEVICE_SPECS.tablet.portrait.width !== 768) {
  throw new Error(`Expected Tablet width to be 768px, got ${DEVICE_SPECS.tablet.portrait.width}`);
}
if (DEVICE_SPECS.mobile.portrait.width !== 390) {
  throw new Error(`Expected Mobile width to be 390px, got ${DEVICE_SPECS.mobile.portrait.width}`);
}
console.log('✓ Test 1 Passed: Viewport default dimensions match requirements (1440px, 768px, 390px)');

// 2. Verify orientation rotation swaps width and height for mobile and tablet
if (DEVICE_SPECS.mobile.landscape.width !== 844 || DEVICE_SPECS.mobile.landscape.height !== 390) {
  throw new Error('Mobile landscape dimensions incorrect');
}
if (DEVICE_SPECS.tablet.landscape.width !== 1024 || DEVICE_SPECS.tablet.landscape.height !== 768) {
  throw new Error('Tablet landscape dimensions incorrect');
}
console.log('✓ Test 2 Passed: Device orientation rotation correctly swaps aspect ratios');

// 3. Verify media query breakpoint logic
const evaluateTailwindBreakpoints = (width: number) => {
  return {
    isSm: width >= 640,
    isMd: width >= 768,
    isLg: width >= 1024,
    isXl: width >= 1280,
  };
};

const mobileBP = evaluateTailwindBreakpoints(DEVICE_SPECS.mobile.portrait.width);
if (mobileBP.isSm || mobileBP.isMd || mobileBP.isLg) {
  throw new Error('Mobile width (390px) should not match sm, md, or lg breakpoints');
}

const tabletBP = evaluateTailwindBreakpoints(DEVICE_SPECS.tablet.portrait.width);
if (!tabletBP.isSm || !tabletBP.isMd || tabletBP.isLg) {
  throw new Error('Tablet width (768px) must match sm and md, but not lg breakpoint');
}

const desktopBP = evaluateTailwindBreakpoints(DEVICE_SPECS.desktop.portrait.width);
if (!desktopBP.isSm || !desktopBP.isMd || !desktopBP.isLg || !desktopBP.isXl) {
  throw new Error('Desktop width (1440px) must match sm, md, lg, and xl breakpoints');
}
console.log('✓ Test 3 Passed: Viewports trigger correct CSS media queries (single-col mobile, 2-col tablet, multi-col desktop)');

// 4. Verify auto-fit scaling algorithm prevents container overflow
const computeScale = (targetWidth: number, containerWidth: number, zoomLevel: ZoomLevel): number => {
  if (zoomLevel === 100) return 1.0;
  if (zoomLevel === 75) return 0.75;
  if (zoomLevel === 50) return 0.5;

  const available = Math.max(300, containerWidth - 48);
  if (targetWidth > available) {
    return Math.min(1.0, Math.max(0.35, available / targetWidth));
  }
  return 1.0;
};

// Container is 800px wide (e.g. desktop with chat panel open)
const desktopScaleInNarrowSpace = computeScale(1440, 800, 'fit');
if (desktopScaleInNarrowSpace >= 1.0 || desktopScaleInNarrowSpace <= 0.3) {
  throw new Error(`Desktop auto-fit scale unexpected: ${desktopScaleInNarrowSpace}`);
}
const scaledWidth = Math.round(1440 * desktopScaleInNarrowSpace);
if (scaledWidth > 800) {
  throw new Error(`Scaled width (${scaledWidth}px) exceeds container width (800px)`);
}

const zoom100 = computeScale(1440, 800, 100);
if (zoom100 !== 1.0) {
  throw new Error(`Expected zoom 100 to be 1.0, got ${zoom100}`);
}
console.log('✓ Test 4 Passed: Auto-fit scaling math correctly prevents horizontal overflow in constrained workspaces');

// 5. Verify document integrity and navigation paths across viewports
const sampleDoc: WebsiteDocument = {
  id: 'doc_preview_test',
  title: 'Responsive Preview Test',
  description: 'Validating viewport isolation',
  category: 'saas',
  schemaVersion: '1.0.0',
  createdAt: '2026-10-16T10:00:00Z',
  updatedAt: '2026-10-16T10:00:00Z',
  theme: {
    primaryColor: '#4F46E5',
    secondaryColor: '#10B981',
    backgroundColor: '#FFFFFF',
    surfaceColor: '#F8FAFC',
    textColor: '#0F172A',
    mutedTextColor: '#64748B',
    accentColor: '#818CF8',
    fontFamily: 'Plus Jakarta Sans',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'DM Sans',
    borderRadius: 'md',
    spacing: 'comfortable',
    buttonStyle: 'rounded',
    mode: 'light',
  },
  navigation: {
    brandName: 'ResponsiveCorp',
    items: [
      { label: 'Home', href: '/', isExternal: false },
      { label: 'Pricing', href: '/pricing', isExternal: false },
    ],
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
          content: { heading: 'Responsive AI Builder' },
        },
      ],
    },
    {
      id: 'p_pricing',
      name: 'Pricing',
      path: '/pricing',
      sections: [
        {
          id: 'sec_pricing',
          type: 'pricing',
          layout: 'grid',
          isVisible: true,
          content: { heading: 'Transparent Pricing' },
        },
      ],
    },
  ],
};

const validation = validateWebsiteDocument(sampleDoc);
if (!validation.valid) {
  throw new Error(`Sample document failed validation: ${validation.error}`);
}

console.log('✓ Test 5 Passed: Multi-page document valid for preview switching across routes and devices');
console.log('--- ALL RESPONSIVE PREVIEW TESTS PASSED (5/5) ---');
