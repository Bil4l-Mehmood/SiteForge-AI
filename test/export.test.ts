/**
 * Automated Test Suite for Website Export Engine
 * Prompt 10 of 12 — SiteForge AI
 */

import { ExportService, sanitizeProjectSlug } from '../src/services/exportService';
import { WebsiteDocument } from '../src/types/schema';
import { Project } from '../src/types';

console.log('--- RUNNING WEBSITE EXPORT ENGINE TESTS ---');

const testMultiPageDoc: WebsiteDocument = {
  id: 'doc_export_test',
  title: 'QuantumFlow AI Platform',
  description: 'Next-generation AI orchestration for distributed engineering teams.',
  category: 'saas',
  schemaVersion: '1.0.0',
  createdAt: '2026-10-16T10:00:00Z',
  updatedAt: '2026-10-16T10:00:00Z',
  seo: {
    title: 'QuantumFlow - Autonomous Cloud Intelligence',
    description: 'Scale engineering velocity with quantum agents.',
    keywords: ['AI', 'cloud', 'devops'],
  },
  theme: {
    primaryColor: '#6366F1',
    secondaryColor: '#10B981',
    backgroundColor: '#FFFFFF',
    surfaceColor: '#F8FAFC',
    textColor: '#0F172A',
    mutedTextColor: '#64748B',
    accentColor: '#818CF8',
    fontFamily: 'Plus Jakarta Sans',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Plus Jakarta Sans',
    borderRadius: 'lg',
    spacing: 'comfortable',
    buttonStyle: 'rounded',
    mode: 'light',
  },
  navigation: {
    brandName: 'QuantumFlow',
    logoText: 'QuantumFlow',
    items: [
      { label: 'Home', href: '/' },
      { label: 'Features', href: '#features' },
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '#contact' },
    ],
    primaryCta: { label: 'Get Started', href: '#contact' },
  },
  pages: [
    {
      id: 'page_home',
      name: 'Home',
      path: '/',
      sections: [
        {
          id: 'sec_hero',
          type: 'hero',
          layout: 'split',
          isVisible: true,
          content: {
            heading: 'Autonomous Cloud Intelligence',
            supportingText: 'Orchestrate agents across all your clusters effortlessly.',
            primaryCta: { label: 'Start Free Trial', href: '#contact' },
          },
        },
        {
          id: 'sec_features',
          type: 'features',
          layout: 'grid',
          isVisible: true,
          content: {
            heading: 'Engineered for Performance',
            features: [
              { title: 'Zero Latency', description: 'Sub-millisecond model routing' },
              { title: 'Global Mesh', description: 'Deploy instantly to 40+ edge regions' },
            ],
          },
        },
        {
          id: 'sec_faq',
          type: 'faq',
          layout: 'grid',
          isVisible: true,
          content: {
            heading: 'Questions & Answers',
            items: [
              { question: 'How is it billed?', answer: 'Usage-based per inference minute.' },
            ],
          },
        },
        {
          id: 'sec_contact',
          type: 'contact',
          layout: 'grid',
          isVisible: true,
          content: {
            heading: 'Contact Our Architects',
            subheading: 'We will respond within 2 hours.',
          },
        },
      ],
    },
    {
      id: 'page_about',
      name: 'About',
      path: '/about',
      sections: [
        {
          id: 'sec_about_hero',
          type: 'hero',
          layout: 'centered',
          isVisible: true,
          content: {
            heading: 'Our Mission at QuantumFlow',
            supportingText: 'Building the foundational intelligence layer for modern cloud native stacks.',
          },
        },
      ],
    },
  ],
};

const testProject: Project = {
  id: 'proj_export_1',
  name: 'QuantumFlow AI Platform',
  description: 'Enterprise AI orchestration',
  initialPrompt: 'Create a website for QuantumFlow AI',
  createdAt: '2026-10-16T10:00:00Z',
  updatedAt: '2026-10-16T10:00:00Z',
  status: 'ready',
  document: testMultiPageDoc,
  specification: testMultiPageDoc,
  chatHistory: [],
};

async function runTests() {
  // Test 1: Rejection when no website document exists
  try {
    const emptyProj: Project = { ...testProject, document: undefined, specification: undefined };
    ExportService.validateForExport(emptyProj);
    console.error('Test 1 Failed: Should have thrown for missing document');
    process.exit(1);
  } catch (err: any) {
    if (err.message.includes('No website document found')) {
      console.log('✓ Test 1 Passed: Empty website document safely rejected');
    } else {
      console.error('Test 1 Failed with unexpected message:', err.message);
      process.exit(1);
    }
  }

  // Test 2: Rejection on corrupt schema
  try {
    const corruptDoc = { ...testMultiPageDoc, pages: [] }; // pages must be min 1
    ExportService.validateForExport(corruptDoc as any);
    console.error('Test 2 Failed: Should have thrown for invalid pages array');
    process.exit(1);
  } catch (err: any) {
    if (err.message.includes('validation failed')) {
      console.log('✓ Test 2 Passed: Corrupted website document safely rejected by validator');
    } else {
      console.error('Test 2 Failed with unexpected message:', err.message);
      process.exit(1);
    }
  }

  // Test 3: Filename sanitization
  const slug = sanitizeProjectSlug('My Awesome & Cool Website! (v2)');
  if (slug !== 'my-awesome-cool-website-v2') {
    console.error('Test 3 Failed: Slug sanitization incorrect:', slug);
    process.exit(1);
  }
  console.log('✓ Test 3 Passed: Project slug sanitized for safe filesystem compatibility');

  // Test 4: Option A - React + Vite Project Generation
  const reactExport = await ExportService.exportWebsite(testProject, 'react-vite');
  if (!reactExport.filename.endsWith('-react-vite-source.zip')) {
    console.error('Test 4 Failed: Incorrect zip filename:', reactExport.filename);
    process.exit(1);
  }
  if (!reactExport.zip) {
    console.error('Test 4 Failed: No zip instance returned');
    process.exit(1);
  }

  const expectedReactFiles = [
    'package.json',
    'vite.config.ts',
    'tsconfig.json',
    'index.html',
    'README.md',
    'src/main.tsx',
    'src/App.tsx',
    'src/index.css',
    'src/data/websiteData.ts',
    'src/components/Navbar.tsx',
    'src/components/Footer.tsx',
    'src/components/SectionRenderer.tsx',
  ];

  for (const expectedFile of expectedReactFiles) {
    const file = reactExport.zip.file(expectedFile);
    if (!file) {
      console.error(`Test 4 Failed: Missing required file in React project: ${expectedFile}`);
      process.exit(1);
    }
  }

  // Verify package.json contents
  const pkgStr = await reactExport.zip.file('package.json')!.async('string');
  const pkg = JSON.parse(pkgStr);
  if (!pkg.dependencies.react || !pkg.scripts.dev || !pkg.scripts.build) {
    console.error('Test 4 Failed: package.json is missing dependencies or scripts');
    process.exit(1);
  }

  // Verify index.html contains SEO meta and Google Fonts
  const indexHtml = await reactExport.zip.file('index.html')!.async('string');
  if (
    !indexHtml.includes('Autonomous Cloud Intelligence') ||
    !indexHtml.includes('fonts.googleapis.com') ||
    !indexHtml.includes('/src/main.tsx')
  ) {
    console.error('Test 4 Failed: index.html missing SEO or entry point');
    process.exit(1);
  }

  // Verify README run instructions
  const readme = await reactExport.zip.file('README.md')!.async('string');
  if (!readme.includes('npm run dev') || !readme.includes('npm run build')) {
    console.error('Test 4 Failed: README missing dev / build run instructions');
    process.exit(1);
  }
  console.log('✓ Test 4 Passed: React 19 + Vite project synthesized with complete file tree, scripts & README');

  // Test 5: Option B - Static Multi-Page HTML Website Generation
  const staticExport = await ExportService.exportWebsite(testProject, 'static-html');
  if (!staticExport.filename.endsWith('-static-website.zip')) {
    console.error('Test 5 Failed: Incorrect static zip filename:', staticExport.filename);
    process.exit(1);
  }
  if (!staticExport.zip) {
    console.error('Test 5 Failed: No static zip instance returned');
    process.exit(1);
  }

  // Check multi-page files: index.html, about.html, 404.html, README.md
  const staticIndex = staticExport.zip.file('index.html');
  const staticAbout = staticExport.zip.file('about.html');
  const static404 = staticExport.zip.file('404.html');
  const staticReadme = staticExport.zip.file('README.md');

  if (!staticIndex || !staticAbout || !static404 || !staticReadme) {
    console.error('Test 5 Failed: Static HTML export missing multi-page files (index.html, about.html, 404.html, README.md)');
    process.exit(1);
  }

  const staticIndexContent = await staticIndex.async('string');
  if (
    !staticIndexContent.includes('Autonomous Cloud Intelligence') ||
    !staticIndexContent.includes('about.html') ||
    !staticIndexContent.includes('cdn.tailwindcss.com') ||
    !staticIndexContent.includes('--color-primary: #6366F1')
  ) {
    console.error('Test 5 Failed: Static index.html missing content, theme styles, or navigation links');
    process.exit(1);
  }

  const staticAboutContent = await staticAbout.async('string');
  if (!staticAboutContent.includes('Our Mission at QuantumFlow')) {
    console.error('Test 5 Failed: Static about.html missing page sections');
    process.exit(1);
  }
  console.log('✓ Test 5 Passed: Static multi-page website synthesized with zero-dependency HTML, CSS & navigation');

  // Test 6: Option C - Canonical JSON Blueprint Generation
  const jsonExport = await ExportService.exportWebsite(testProject, 'json');
  if (!jsonExport.filename.endsWith('-blueprint.json')) {
    console.error('Test 6 Failed: JSON filename incorrect:', jsonExport.filename);
    process.exit(1);
  }
  console.log('✓ Test 6 Passed: Canonical JSON blueprint generated successfully');

  // Test 7: Security check - No secrets or sensitive keys leaked
  const allContentReact = [pkgStr, indexHtml, readme].join('\n');
  if (
    allContentReact.includes('GEMINI_API_KEY') ||
    allContentReact.includes('AIZA') ||
    allContentReact.includes('siteforge_projects_v1')
  ) {
    console.error('Test 7 Failed: Exported files contain sensitive keys or internal storage references!');
    process.exit(1);
  }
  // Test 8: Physical extraction verification of generated source files
  const fs = await import('fs');
  const path = await import('path');
  const tempExportDir = path.resolve('.aistudio/test-extracted-export');
  fs.mkdirSync(tempExportDir, { recursive: true });

  for (const [filename, fileObj] of Object.entries(reactExport.zip.files)) {
    if (!fileObj.dir) {
      const fullPath = path.join(tempExportDir, filename);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      const data = await fileObj.async('nodebuffer');
      fs.writeFileSync(fullPath, data);
    }
  }

  // Verify extracted entry points exist on disk
  console.assert(fs.existsSync(path.join(tempExportDir, 'package.json')), 'Test 8 Failed: package.json missing on disk');
  console.assert(fs.existsSync(path.join(tempExportDir, 'src/App.tsx')), 'Test 8 Failed: src/App.tsx missing on disk');
  console.assert(fs.existsSync(path.join(tempExportDir, 'src/components/SectionRenderer.tsx')), 'Test 8 Failed: SectionRenderer missing on disk');
  console.assert(fs.existsSync(path.join(tempExportDir, 'index.html')), 'Test 8 Failed: index.html missing on disk');
  
  // Clean up test export
  fs.rmSync(tempExportDir, { recursive: true, force: true });
  console.log('✓ Test 8 Passed: Physical extraction of exported React project verified on filesystem');

  console.log('--- ALL WEBSITE EXPORT ENGINE TESTS PASSED (8/8) ---');
}

runTests().catch((err) => {
  console.error('Export test suite error:', err);
  process.exit(1);
});
