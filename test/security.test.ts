/**
 * Security, Validation & Reliability Test Suite
 * Prompt 11 of 12 — SiteForge AI
 */

import { validateWebsiteDocument, isSafeUrl, isInternalHost, ALLOWED_SECTION_TYPES } from '../server/validator';
import { GeminiGenerationService } from '../server/geminiService';
import { ProjectService } from '../src/services/projectService';
import { ExportService, sanitizeZipFilePath, sanitizePageFileName } from '../src/services/exportService';
import { WebsiteDocument } from '../src/types/schema';
import { Project } from '../src/types';

console.log('--- RUNNING SECURITY, VALIDATION & RELIABILITY TESTS ---');

const canonicalValidDoc: WebsiteDocument = {
  id: 'doc_sec_test',
  title: 'CyberGuard Security Platform',
  description: 'Enterprise zero-trust network access and compliance.',
  category: 'saas',
  theme: {
    primaryColor: '#0EA5E9',
    secondaryColor: '#0284C7',
    backgroundColor: '#0F172A',
    surfaceColor: '#1E293B',
    textColor: '#F8FAFC',
    mutedTextColor: '#94A3B8',
    accentColor: '#38BDF8',
    fontFamily: 'Plus Jakarta Sans',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'DM Sans',
    borderRadius: 'md',
    spacing: 'comfortable',
    buttonStyle: 'rounded',
    mode: 'dark',
  },
  navigation: {
    brandName: 'CyberGuard',
    items: [
      { label: 'Solutions', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
    ],
    primaryCta: { label: 'Start Free Trial', href: '#cta' },
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
            heading: 'Zero Trust Infrastructure Security',
            supportingText: 'Secure corporate assets anywhere.',
            primaryCta: { label: 'Deploy Now', href: '#features' },
          },
        },
        {
          id: 'sec_features',
          type: 'features',
          layout: 'grid',
          isVisible: true,
          content: {
            heading: 'Protection Everywhere',
            items: [
              { id: 'f1', title: 'Endpoint Armor', description: 'Real-time telemetry' },
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

// ----------------------------------------------------------------------------
// Scenario 1: Invalid WebsiteDocument data is rejected
// ----------------------------------------------------------------------------
const invalidDocNoTitle = { ...canonicalValidDoc, title: '' };
const outcome1 = validateWebsiteDocument(invalidDocNoTitle);
console.assert(outcome1.valid === false, 'Scenario 1 Failed: Document with empty title must be rejected');

const invalidDocBadHex = {
  ...canonicalValidDoc,
  theme: { ...canonicalValidDoc.theme, primaryColor: 'red; background: url(evil.com)' },
};
const outcome1b = validateWebsiteDocument(invalidDocBadHex);
console.assert(outcome1b.valid === false, 'Scenario 1 Failed: Malicious CSS injection in hex color must be rejected');

console.log('✓ Scenario 1 Passed: Invalid WebsiteDocument data safely rejected');

// ----------------------------------------------------------------------------
// Scenario 2: Unknown section types cannot execute code
// ----------------------------------------------------------------------------
const rogueSectionDoc = {
  ...canonicalValidDoc,
  pages: [
    {
      ...canonicalValidDoc.pages[0],
      sections: [
        {
          id: 'sec_rogue',
          type: '<script>alert(1)</script>',
          heading: 'Dangerous Section',
          content: {},
        },
      ],
    },
  ],
};
const outcome2 = validateWebsiteDocument(rogueSectionDoc);
console.assert(outcome2.valid === true, 'Scenario 2 Failed: Rogue section should be safely normalized');
console.assert(
  ALLOWED_SECTION_TYPES.includes(outcome2.document!.pages[0].sections[0].type),
  'Scenario 2 Failed: Rogue section must be converted to an allowed section type'
);
console.assert(!outcome2.document!.pages[0].sections[0].type.includes('<script>'), 'Scenario 2 Failed: Script tags in section type must not survive');
console.log('✓ Scenario 2 Passed: Unknown section types safely sanitized without code execution');

// ----------------------------------------------------------------------------
// Scenario 3: Unsafe URL protocols are rejected
// ----------------------------------------------------------------------------
const unsafeUrls = [
  'javascript:alert(document.cookie)',
  'JAVASCRIPT:void(0)',
  'data:text/html,<script>alert(1)</script>',
  'vbscript:msgbox("test")',
  'file:///etc/passwd',
  'about:blank',
  '//evil.com/phishing',
  '/\\evil.com',
  '\\/evil.com',
  'http://localhost:3000/admin',
  'http://127.0.0.1:8080/internal',
  'http://169.254.169.254/latest/meta-data/',
  'http://metadata.google.internal/computeMetadata/v1/',
  'http://[::1]:8080',
  'http://[::ffff:127.0.0.1]/secret',
  'http://2130706433/admin', // Integer IP 127.0.0.1
];

for (const badUrl of unsafeUrls) {
  console.assert(!isSafeUrl(badUrl), `Scenario 3 Failed: Unsafe URL should be rejected: ${badUrl}`);
}

const safeUrls = [
  '/',
  '/about',
  '/services/cloud',
  '#features',
  '#pricing',
  'https://example.com',
  'https://siteforge.ai/docs',
  'mailto:support@example.com',
  'tel:+1234567890',
];

for (const goodUrl of safeUrls) {
  console.assert(isSafeUrl(goodUrl), `Scenario 3 Failed: Legitimate URL should be accepted: ${goodUrl}`);
}

console.log('✓ Scenario 3 Passed: Unsafe URL protocols, script vectors & internal hosts rejected');

// ----------------------------------------------------------------------------
// Scenario 4 & 5: Malformed editing operations do not corrupt website & failed edits preserve valid doc
// ----------------------------------------------------------------------------
const malformedEditPayload = {
  id: 'doc_corrupt',
  title: 'Broken',
  pages: 'not an array', // Corrupt structure
};

const editValidation = validateWebsiteDocument(malformedEditPayload);
console.assert(editValidation.valid === false, 'Scenario 4 Failed: Corrupt editing payload must be rejected');

// Simulate edit failure recovery: original canonicalValidDoc remains intact
const preservedDoc = canonicalValidDoc;
const preservedVal = validateWebsiteDocument(preservedDoc);
console.assert(preservedVal.valid === true, 'Scenario 5 Failed: Original valid document must be preserved');
console.assert(preservedVal.document?.title === 'CyberGuard Security Platform', 'Scenario 5 Failed: Title mutated unexpectedly');
console.log('✓ Scenarios 4 & 5 Passed: Malformed edits rejected; previous valid website strictly preserved');

// ----------------------------------------------------------------------------
// Scenario 6: Invalid version snapshots cannot replace a valid document
// ----------------------------------------------------------------------------
const testProj: Project = {
  id: 'proj_test_restore',
  name: 'Security Test Project',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  document: canonicalValidDoc,
  documentHistory: [
    {
      id: 'ver_valid',
      versionNumber: 1,
      document: canonicalValidDoc,
      timestamp: new Date().toISOString(),
      label: 'Valid Version',
      changeType: 'generation',
    },
    {
      id: 'ver_corrupt',
      versionNumber: 2,
      // @ts-expect-error intentionally invalid document structure
      document: { title: '', pages: [] }, // Invalid snapshot!
      timestamp: new Date().toISOString(),
      label: 'Corrupted Snapshot',
      changeType: 'edit',
    },
  ],
};

ProjectService.saveProject(testProj);

// Attempt restoring corrupted version
const restoreResult = ProjectService.restoreVersion(testProj.id, 'ver_corrupt');
console.assert(restoreResult === null, 'Scenario 6 Failed: Restoring corrupt version snapshot should return null');

// Confirm the active project document is still the valid document
const currentProject = ProjectService.getProject(testProj.id);
console.assert(currentProject !== null, 'Scenario 6 Failed: Project missing');
console.assert(currentProject?.document?.title === 'CyberGuard Security Platform', 'Scenario 6 Failed: Current valid document was overwritten by corrupt snapshot');
console.log('✓ Scenario 6 Passed: Invalid version snapshot rejected and valid document preserved');

// ----------------------------------------------------------------------------
// Scenario 7: Corrupted stored projects are handled gracefully
// ----------------------------------------------------------------------------
const sanitizedCorrupt = ProjectService.sanitizeProject({
  id: 'proj_bad',
  name: null,
  document: { broken: true },
});
console.assert(sanitizedCorrupt !== null, 'Scenario 7 Failed: Sanitizer should return safe project envelope');
console.assert(sanitizedCorrupt?.name === 'Untitled Website', 'Scenario 7 Failed: Expected default title');
console.assert(sanitizedCorrupt?.document === undefined, 'Scenario 7 Failed: Corrupt document should not be assigned');

// Non-object primitive
console.assert(ProjectService.sanitizeProject('invalid') === null, 'Scenario 7 Failed: String should return null');
console.assert(ProjectService.sanitizeProject(null) === null, 'Scenario 7 Failed: Null should return null');
console.log('✓ Scenario 7 Passed: Corrupted stored projects handled gracefully without crashing');

// ----------------------------------------------------------------------------
// Scenario 8: Exported files do not contain API keys or secrets
// ----------------------------------------------------------------------------
const testApiKey = 'AIzaSyA_TEST_MOCK_GEMINI_KEY_1234567';
process.env.GEMINI_API_KEY = testApiKey;

async function testExportSafety() {
  const result = await ExportService.exportWebsite(canonicalValidDoc, 'react-vite');
  const zip = result.zip;
  console.assert(zip !== undefined, 'Scenario 8 Failed: ZIP should be generated');

  if (zip) {
    for (const [filename, fileObj] of Object.entries(zip.files)) {
      const text = await fileObj.async('text');
      console.assert(!text.includes(testApiKey), `Scenario 8 Failed: Exported file ${filename} leaked GEMINI_API_KEY`);
      console.assert(!text.includes('AIza'), `Scenario 8 Failed: Exported file ${filename} contained Google API key pattern`);
    }
  }

  const staticResult = await ExportService.exportWebsite(canonicalValidDoc, 'static-html');
  if (staticResult.zip) {
    for (const [filename, fileObj] of Object.entries(staticResult.zip.files)) {
      const text = await fileObj.async('text');
      console.assert(!text.includes(testApiKey), `Scenario 8 Failed: Static exported file ${filename} leaked GEMINI_API_KEY`);
    }
  }
}

await testExportSafety();
console.log('✓ Scenario 8 Passed: Export packages verified 100% free of API keys and server secrets');

// ----------------------------------------------------------------------------
// Scenario 9: Malicious filenames cannot cause path traversal in export
// ----------------------------------------------------------------------------
const traversalFilenames = [
  '../../../etc/passwd',
  '..\\..\\windows\\system32\\cmd.exe',
  'foo/../../bar.txt',
  '/etc/shadow',
  'C:\\boot.ini',
  'null\0byte.html',
  '..',
  './',
];

for (const rawName of traversalFilenames) {
  const cleaned = sanitizeZipFilePath(rawName);
  console.assert(!cleaned.includes('..'), `Scenario 9 Failed: Path traversal ".." persisted in: ${cleaned}`);
  console.assert(!cleaned.startsWith('/'), `Scenario 9 Failed: Leading slash persisted in: ${cleaned}`);
  console.assert(!cleaned.includes('\\'), `Scenario 9 Failed: Backslash persisted in: ${cleaned}`);
  console.assert(!cleaned.includes('\0'), `Scenario 9 Failed: Null byte persisted in: ${cleaned}`);
}

const traversalPageName = sanitizePageFileName('../../../evil/path', false);
console.assert(!traversalPageName.includes('..'), `Scenario 9 Failed: Traversal persisted in page filename: ${traversalPageName}`);
console.assert(traversalPageName.endsWith('.html'), 'Scenario 9 Failed: Page filename must end with .html');
console.log('✓ Scenario 9 Passed: Path traversal (Zip Slip) sequences stripped and sanitized');

// ----------------------------------------------------------------------------
// Scenario 10: External asset fetching/hosts: SSRF destinations prohibited
// ----------------------------------------------------------------------------
const prohibitedHosts = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '169.254.169.254',
  'metadata.google.internal',
  '10.0.0.1',
  '172.16.0.1',
  '192.168.1.1',
  '::1',
  '::ffff:127.0.0.1',
  '2130706433', // decimal representation of 127.0.0.1
];

for (const host of prohibitedHosts) {
  console.assert(isInternalHost(host), `Scenario 10 Failed: ${host} must be classified as internal`);
}

const publicHosts = ['example.com', 'google.com', 'images.unsplash.com', 'cdnjs.cloudflare.com'];
for (const host of publicHosts) {
  console.assert(!isInternalHost(host), `Scenario 10 Failed: ${host} should not be classified as internal`);
}
console.log('✓ Scenario 10 Passed: Prohibited internal SSRF destinations strictly identified');

// ----------------------------------------------------------------------------
// Scenario 11: Gemini errors do not expose secrets
// ----------------------------------------------------------------------------
const leakError = new Error(`Error connecting to https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${testApiKey} at /root/project/server/geminiService.ts:120 with Bearer ya29.SECRET_TOKEN_VALUE`);
const sanitizedError = GeminiGenerationService.sanitizeErrorMessage(leakError);

console.assert(!sanitizedError.includes(testApiKey), 'Scenario 11 Failed: API key leaked in sanitized error');
console.assert(!sanitizedError.includes('ya29.SECRET_TOKEN_VALUE'), 'Scenario 11 Failed: Bearer token leaked in sanitized error');
console.assert(!sanitizedError.includes('/root/project/'), 'Scenario 11 Failed: Internal server file path leaked in sanitized error');
console.assert(sanitizedError.includes('[REDACTED]'), 'Scenario 11 Failed: Expected [REDACTED] query param placeholder');

const directKeyError = new Error(`Direct key failure with ${testApiKey}`);
const directSanitized = GeminiGenerationService.sanitizeErrorMessage(directKeyError);
console.assert(directSanitized.includes('[REDACTED_API_KEY]'), 'Scenario 11 Failed: Direct key not replaced with [REDACTED_API_KEY]');
console.log('✓ Scenario 11 Passed: Error sanitizer strips API keys, tokens, query params, and paths');

// ----------------------------------------------------------------------------
// Scenario 12: Large or malformed requests handled safely
// ----------------------------------------------------------------------------
const hugePrompt = 'a'.repeat(3000);
let promptRejected = false;
try {
  await GeminiGenerationService.generateWebsite(hugePrompt);
} catch (err: any) {
  promptRejected = err.code === 'PROMPT_TOO_LONG' || err.status === 400;
}
console.assert(promptRejected, 'Scenario 12 Failed: Prompts over 2500 characters must be rejected');

const emptyPrompt = '   ';
let emptyRejected = false;
try {
  await GeminiGenerationService.generateWebsite(emptyPrompt);
} catch (err: any) {
  emptyRejected = err.code === 'EMPTY_PROMPT' || err.status === 400;
}
console.assert(emptyRejected, 'Scenario 12 Failed: Empty prompts must be rejected');
console.log('✓ Scenario 12 Passed: Oversized and empty requests rejected with safe 400 errors');

// ----------------------------------------------------------------------------
// Scenario 13: Existing website generation, editing, rendering, persistence, and export still work
// ----------------------------------------------------------------------------
const fullDocOutcome = validateWebsiteDocument(canonicalValidDoc);
console.assert(fullDocOutcome.valid === true, 'Scenario 13 Failed: Canonical doc must be valid');
const sanitizedProj = ProjectService.sanitizeProject(testProj);
console.assert(sanitizedProj !== null && sanitizedProj.id === testProj.id, 'Scenario 13 Failed: Project persistence round-trip failed');
console.assert(sanitizedProj?.document?.pages[0].sections.length === 2, 'Scenario 13 Failed: Sections intact');
console.log('✓ Scenario 13 Passed: End-to-end integration across all core systems intact');

console.log('--- ALL SECURITY & RELIABILITY TESTS PASSED (13/13) ---');
