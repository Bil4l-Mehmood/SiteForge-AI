/**
 * Lead & Contact Query Management Service
 *
 * Captures, persists, manages, and exports contact form inquiries from both
 * SiteForge AI platform contact pages and individual generated websites.
 */

export interface LeadSubmission {
  id: string;
  projectId: string; // 'siteforge_app' or project UUID
  websiteTitle: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  category?: 'General Inquiry' | 'Feature Request' | 'Technical Support' | 'Enterprise / API Access' | 'Client Inquiry';
  message: string;
  submittedAt: string;
  status: 'new' | 'contacted' | 'archived';
  pagePath?: string;
}

const STORAGE_KEY_LEADS = 'siteforge_leads_store';

class LeadServiceClass {
  private leads: LeadSubmission[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LEADS);
      if (stored) {
        this.leads = JSON.parse(stored);
      } else {
        // Seed initial sample leads so user can immediately test and appreciate the dashboard
        this.leads = [
          {
            id: 'lead_sample_1',
            projectId: 'siteforge_app',
            websiteTitle: 'SiteForge AI Platform',
            name: 'Sophia Laurent',
            email: 'sophia@luxurymedia.fr',
            category: 'Enterprise / API Access',
            subject: 'Multi-brand website generation for our agency portfolio',
            message: 'We are looking to deploy SiteForge AI for generating client preview landing pages automatically. Would love to discuss API rate limits.',
            submittedAt: '2026-03-20T14:32:00Z',
            status: 'new',
          },
          {
            id: 'lead_sample_2',
            projectId: 'siteforge_app',
            websiteTitle: 'SiteForge AI Platform',
            name: 'Marcus Vance',
            email: 'marcus@vancecreative.io',
            category: 'Feature Request',
            subject: 'Custom font uploading and Figma token sync',
            message: 'Awesome tool! Is there any plan to support direct typography imports from Adobe Typekit or Google Fonts links?',
            submittedAt: '2026-03-19T11:15:00Z',
            status: 'contacted',
          },
        ];
        localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(this.leads));
      }
    } catch {
      this.leads = [];
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(this.leads));
    } catch (e) {
      console.warn('[LeadService] Failed to save leads to localStorage:', e);
    }
  }

  public async submitLead(data: Omit<LeadSubmission, 'id' | 'submittedAt' | 'status'>): Promise<LeadSubmission> {
    const newLead: LeadSubmission = {
      ...data,
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      submittedAt: new Date().toISOString(),
      status: 'new',
    };

    this.leads.unshift(newLead);
    this.saveToStorage();

    // Also attempt backend POST if in browser environment
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLead),
        });
      } catch {
        // Local storage acts as safe resilient fallback
      }
    }

    return newLead;
  }

  public getLeads(projectId?: string): LeadSubmission[] {
    this.loadFromStorage();
    if (!projectId) return [...this.leads];
    return this.leads.filter((l) => l.projectId === projectId);
  }

  public updateStatus(leadId: string, status: LeadSubmission['status']): void {
    this.leads = this.leads.map((l) => (l.id === leadId ? { ...l, status } : l));
    this.saveToStorage();
  }

  public deleteLead(leadId: string): void {
    this.leads = this.leads.filter((l) => l.id !== leadId);
    this.saveToStorage();
  }

  public exportAsCsv(projectId?: string): string {
    const list = this.getLeads(projectId);
    const headers = ['ID', 'Date', 'Project / Website', 'Name', 'Email', 'Phone', 'Category', 'Subject', 'Status', 'Message'];
    const rows = list.map((l) => [
      `"${l.id}"`,
      `"${new Date(l.submittedAt).toLocaleDateString()}"`,
      `"${(l.websiteTitle || '').replace(/"/g, '""')}"`,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.category || '').replace(/"/g, '""')}"`,
      `"${(l.subject || '').replace(/"/g, '""')}"`,
      `"${l.status}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}

export const LeadService = new LeadServiceClass();
