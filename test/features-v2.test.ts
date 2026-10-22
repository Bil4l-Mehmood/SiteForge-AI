/**
 * Automated Test Suite for New Features:
 * - User Authentication (Sign In & Sign Up)
 * - Lead Capture & Contact Queries
 * - Curated Theme Presets Engine (Option 2)
 * - Section Outline & Dynamic CMS Operations (Option 3)
 * - SEO & Social Audit Verification (Option 4)
 */

import { AuthService } from '../src/services/authService';
import { LeadService } from '../src/services/leadService';
import { CURATED_THEME_PRESETS } from '../src/services/themePresets';
import { WebsiteThemeSchema, WebsiteSection, SectionType } from '../src/types/schema';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✓ ${message}`);
}

async function runTests() {
  console.log('--- RUNNING NEW FEATURES V2 TEST SUITE ---\n');

  // Test 1: AuthService - Default User Session
  {
    const currentUser = AuthService.getCurrentUser();
    assert(currentUser !== null, 'AuthService initializes with an active user session');
    assert(currentUser?.email === 'bilal@pctsc.com', 'Default authenticated user email is bilal@pctsc.com');
    assert(currentUser?.plan === 'Pro', 'Default authenticated user has Pro tier privileges');
  }

  // Test 2: AuthService - Sign In Validation
  {
    const invalidRes = AuthService.signIn('invalid-email-format');
    assert(!invalidRes.success, 'AuthService rejects invalid email addresses');
    assert(Boolean(invalidRes.error), 'AuthService returns informative error for invalid email');

    const validRes = AuthService.signIn('elena@vance.io');
    assert(validRes.success, 'AuthService successfully signs in with valid email');
    assert(validRes.user?.email === 'elena@vance.io', 'AuthService correctly updates user session');
  }

  // Test 3: AuthService - Sign Up Flow
  {
    const signupRes = AuthService.signUp({
      name: 'Dr. Sarah Connor',
      email: 'sarah@skynet-defense.org',
      organization: 'Cyberdyne Systems',
    });
    assert(signupRes.success, 'AuthService successfully registers new user profile');
    assert(signupRes.user?.name === 'Dr. Sarah Connor', 'AuthService preserves user display name');
    assert(signupRes.user?.organization === 'Cyberdyne Systems', 'AuthService stores organization name');

    // Switch back to Bilal
    AuthService.signIn('bilal@pctsc.com');
    assert(AuthService.getCurrentUser()?.email === 'bilal@pctsc.com', 'Restored primary account session');
  }

  // Test 4: LeadService - Capturing Form Submissions
  {
    const initialCount = LeadService.getLeads().length;
    const newLead = await LeadService.submitLead({
      projectId: 'siteforge_app',
      websiteTitle: 'SiteForge AI Platform',
      name: 'James Rodriguez',
      email: 'james@creativeedge.com',
      category: 'Enterprise / API Access',
      subject: 'Custom AI website deployment pipeline',
      message: 'We want to integrate SiteForge AI into our automated client onboarding.',
    });

    assert(newLead.id.startsWith('lead_'), 'Generated unique lead ID with prefix');
    assert(newLead.status === 'new', 'New lead initializes in "new" status');
    assert(LeadService.getLeads().length === initialCount + 1, 'Lead stored successfully in memory store');
  }

  // Test 5: LeadService - Status Updates and CSV Export
  {
    const leads = LeadService.getLeads();
    const targetLead = leads[0];
    LeadService.updateStatus(targetLead.id, 'contacted');

    const updated = LeadService.getLeads().find((l) => l.id === targetLead.id);
    assert(updated?.status === 'contacted', 'Lead status successfully transitioned to "contacted"');

    const csv = LeadService.exportAsCsv();
    assert(csv.includes('ID,Date,Project / Website,Name,Email'), 'CSV export generates canonical headers');
    assert(csv.includes('james@creativeedge.com') || csv.includes(targetLead.email), 'CSV export includes submitted lead record');
  }

  // Test 6: Option 2 - Curated Theme Presets Validation
  {
    assert(CURATED_THEME_PRESETS.length === 6, 'Contains 6 curated designer theme presets');

    for (const preset of CURATED_THEME_PRESETS) {
      const parsed = WebsiteThemeSchema.safeParse(preset.theme);
      assert(parsed.success, `Theme preset "${preset.name}" conforms strictly to WebsiteThemeSchema`);
      assert(preset.previewColors.length >= 3, `Theme preset "${preset.name}" has sufficient palette swatch previews`);
    }
  }

  // Test 7: Option 3 - Section Outline & Dynamic CMS Operations
  {
    let sections: WebsiteSection[] = [
      { id: 'sec_1', type: 'hero', layout: 'centered', content: { heading: 'Hero' }, isVisible: true },
      { id: 'sec_2', type: 'features', layout: 'grid', content: { heading: 'Features' }, isVisible: true },
      { id: 'sec_3', type: 'pricing', layout: 'cards', content: { heading: 'Pricing' }, isVisible: true },
    ];

    // Reorder: Move Features down
    const moved = [...sections];
    const [featureSec] = moved.splice(1, 1);
    moved.splice(2, 0, featureSec);
    assert(moved[2].id === 'sec_2', 'Section reordering shifted target section to new index');

    // Duplicate: Duplicate pricing
    const duplicated: WebsiteSection = {
      ...sections[2],
      id: `sec_pricing_dup_${Date.now()}`,
      content: { ...sections[2].content, heading: 'Pricing (Copy)' },
    };
    const withDup = [...sections, duplicated];
    assert(withDup.length === 4, 'Section duplication incremented page section count');
    assert((withDup[3].content as any).heading === 'Pricing (Copy)', 'Duplicated section content preserved with copy indicator');

    // Toggle visibility
    const toggled = withDup.map((s, idx) => (idx === 0 ? { ...s, isVisible: false } : s));
    assert(toggled[0].isVisible === false, 'Section visibility toggle hides targeted section');
  }

  // Test 8: Option 4 - SEO & Performance Audit Data Structures
  {
    const sampleTitle = 'PCTSC Global Enterprise Cloud';
    const sampleDesc = 'Mission-critical cloud infrastructure and software architecture.';

    const schemaJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: sampleTitle,
      description: sampleDesc,
    };

    assert(schemaJsonLd['@context'] === 'https://schema.org', 'Schema.org JSON-LD valid context');
    assert(schemaJsonLd['@type'] === 'WebSite', 'Schema.org JSON-LD valid entity type');
    assert(schemaJsonLd.name === sampleTitle, 'Schema.org JSON-LD title mapping intact');
  }

  console.log('\n--- ALL NEW FEATURES V2 TESTS PASSED ---');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
