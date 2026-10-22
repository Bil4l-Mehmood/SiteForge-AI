/**
 * Automated Test Suite for Project Saving, Persistence & Version History
 * Prompt 9 of 12 — SiteForge AI
 */

import { ProjectService } from '../src/services/projectService';
import { WebsiteDocument } from '../src/types/schema';
import { Project } from '../src/types';

console.log('--- RUNNING PROJECT PERSISTENCE & VERSION HISTORY TESTS ---');

// Mock localStorage for node test runner
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

(global as any).window = {
  localStorage: localStorageMock,
};

const sampleDoc: WebsiteDocument = {
  id: 'doc_proj_v1',
  title: 'Apex Cloud Solutions',
  description: 'Enterprise Kubernetes and multicloud orchestration platform.',
  category: 'saas',
  schemaVersion: '1.0.0',
  createdAt: '2026-10-16T10:00:00Z',
  updatedAt: '2026-10-16T10:00:00Z',
  theme: {
    primaryColor: '#2563EB',
    secondaryColor: '#10B981',
    backgroundColor: '#FFFFFF',
    surfaceColor: '#F8FAFC',
    textColor: '#0F172A',
    mutedTextColor: '#64748B',
    accentColor: '#38BDF8',
    fontFamily: 'Plus Jakarta Sans',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Plus Jakarta Sans',
    borderRadius: 'md',
    spacing: 'comfortable',
    buttonStyle: 'rounded',
    mode: 'light',
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
            headline: 'Scale your infrastructure seamlessly',
            subheadline: 'The modern control plane for Kubernetes',
          },
        },
      ],
    },
  ],
};

// 1. Create Project
const p1 = ProjectService.createProject('Build a modern cloud management dashboard', 'Apex Cloud');
if (!p1.id || !p1.id.startsWith('proj_')) {
  console.error('Test 1 Failed: Project ID not generated properly');
  process.exit(1);
}
if (p1.name !== 'Apex Cloud' || p1.schemaVersion !== '1.0.0') {
  console.error('Test 1 Failed: Name or schemaVersion mismatch');
  process.exit(1);
}
console.log('✓ Test 1 Passed: Project created with stable ID, name, and schemaVersion');

// 2. Add Initial Generation Version
const addInitResult = ProjectService.addVersion(
  p1.id,
  sampleDoc,
  'Initial Generation',
  'Synthesized SaaS website with hero section',
  'generation'
);
if (!addInitResult || addInitResult.project.documentHistory?.length !== 1) {
  console.error('Test 2 Failed: Initial version not recorded in document history');
  process.exit(1);
}
if (addInitResult.version.versionNumber !== 1 || addInitResult.version.changeType !== 'generation') {
  console.error('Test 2 Failed: Initial version metadata incorrect');
  process.exit(1);
}
console.log('✓ Test 2 Passed: Initial version recorded with v1 and generation tag');

// 3. Conversational Edit Versioning
const editedDoc: WebsiteDocument = {
  ...sampleDoc,
  title: 'Apex Cloud Platform - Updated',
  theme: {
    ...sampleDoc.theme,
    primaryColor: '#1E3A8A', // Deep navy
  },
  updatedAt: new Date().toISOString(),
};

const addEditResult = ProjectService.addVersion(
  p1.id,
  editedDoc,
  'Change primary color to navy blue',
  'Updated primary theme color to #1E3A8A',
  'edit'
);
if (!addEditResult || addEditResult.project.documentHistory?.length !== 2) {
  console.error('Test 3 Failed: Conversational edit version not recorded');
  process.exit(1);
}
if (addEditResult.version.versionNumber !== 2 || addEditResult.project.document?.theme.primaryColor !== '#1E3A8A') {
  console.error('Test 3 Failed: Edit document did not update active state');
  process.exit(1);
}
console.log('✓ Test 3 Passed: Conversational edit recorded as v2 with summary and updated theme');

// 4. Version Restoration
const v1Id = addInitResult.version.id;
const restoreResult = ProjectService.restoreVersion(p1.id, v1Id);
if (!restoreResult) {
  console.error('Test 4 Failed: Could not restore v1');
  process.exit(1);
}
if (restoreResult.project.document?.theme.primaryColor !== '#2563EB') {
  console.error('Test 4 Failed: Restored project did not revert primary color to #2563EB');
  process.exit(1);
}
if (restoreResult.project.documentHistory?.length !== 3) {
  console.error('Test 4 Failed: Restoration did not create safe audit version entry');
  process.exit(1);
}
console.log('✓ Test 4 Passed: Version restoration successfully restored v1 document state without loss');

// 5. Duplicating a Project
const duplicated = ProjectService.duplicateProject(p1.id);
if (!duplicated || duplicated.id === p1.id) {
  console.error('Test 5 Failed: Duplicated project failed or reused ID');
  process.exit(1);
}
if (!duplicated.name.startsWith('Copy of') || duplicated.documentHistory?.length !== 3) {
  console.error('Test 5 Failed: Duplicated project did not retain versions or rename');
  process.exit(1);
}
console.log('✓ Test 5 Passed: Project duplication creates independent copy with full revision history');

// 6. JSON Export & Import
const exportedJson = ProjectService.exportProjectAsJson(duplicated);
const importResult = ProjectService.importProjectFromJson(exportedJson);
if (!importResult.success || !importResult.project) {
  console.error('Test 6 Failed: JSON import failed:', importResult.error);
  process.exit(1);
}
if (!importResult.project.name.includes('(Imported)') || importResult.project.documentHistory?.length !== 3) {
  console.error('Test 6 Failed: Imported project did not preserve history');
  process.exit(1);
}
console.log('✓ Test 6 Passed: Full JSON backup export and validated re-import verified');

// 7. Schema Sanitization & Recovery on Corrupt Stored Data
const corruptProject = {
  id: 'proj_corrupt',
  name: 'Broken Stored Item',
  document: {
    // missing required fields like pages, theme
    brokenField: true,
  },
  chatHistory: 'not-an-array',
};
const sanitized = ProjectService.sanitizeProject(corruptProject);
if (!sanitized || sanitized.document !== undefined || !Array.isArray(sanitized.chatHistory)) {
  console.error('Test 7 Failed: Corrupted project data was not safely sanitized');
  process.exit(1);
}
console.log('✓ Test 7 Passed: Corrupt stored data safely sanitized without crashing');

// 8. Project Renaming and Deletion
const renamed = ProjectService.renameProject(p1.id, 'Renamed Apex Platform');
if (!renamed || renamed.name !== 'Renamed Apex Platform') {
  console.error('Test 8 Failed: Project rename failed');
  process.exit(1);
}
ProjectService.deleteProject(p1.id);
const reloaded = ProjectService.getProject(p1.id);
if (reloaded !== null) {
  console.error('Test 8 Failed: Project was not deleted');
  process.exit(1);
}
console.log('✓ Test 8 Passed: Project renaming and deletion verified');

console.log('--- ALL PROJECT PERSISTENCE & VERSION HISTORY TESTS PASSED (8/8) ---');
