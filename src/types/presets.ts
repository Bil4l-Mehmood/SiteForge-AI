/**
 * Generation Presets for SiteForge AI
 *
 * Provides sensible section sequencing, design tokens, and domain prompts
 * to guide Gemini generation consistently without rigid hardcoding.
 */

import { SectionType, GlobalTheme, WebsiteCategory } from './schema';

export interface GenerationPreset {
  id: string;
  category: WebsiteCategory;
  name: string;
  tagline: string;
  description: string;
  recommendedSections: SectionType[];
  recommendedPages: { name: string; path: string }[];
  defaultTheme: Partial<GlobalTheme>;
  guidelines: string;
}

export const GENERATION_PRESETS: Record<string, GenerationPreset> = {
  business: {
    id: 'business',
    category: 'business',
    name: 'Business Website',
    tagline: 'Professional Corporate Presence',
    description: 'Corporate firms, consultants, legal, finance, and enterprise service providers.',
    recommendedSections: [
      'hero',
      'about',
      'services',
      'statistics',
      'testimonials',
      'contact',
      'footer',
    ],
    recommendedPages: [
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' },
      { name: 'Services', path: '/services' },
      { name: 'Contact', path: '/contact' },
    ],
    defaultTheme: {
      primaryColor: '#0F172A',
      secondaryColor: '#334155',
      backgroundColor: '#FFFFFF',
      surfaceColor: '#F8FAFC',
      textColor: '#0F172A',
      mutedTextColor: '#64748B',
      accentColor: '#2563EB',
      fontFamily: 'Plus Jakarta Sans',
      headingFont: 'Plus Jakarta Sans',
      bodyFont: 'DM Sans',
      borderRadius: 'md',
      spacing: 'comfortable',
      buttonStyle: 'rounded',
      mode: 'light',
    },
    guidelines:
      'Emphasize trust, credibility, clear value proposition, executive consultation booking, and demonstrable business outcomes.',
  },

  portfolio: {
    id: 'portfolio',
    category: 'portfolio',
    name: 'Portfolio',
    tagline: 'Creative & Designer Showcase',
    description: 'Product designers, architects, photographers, developers, and creative directors.',
    recommendedSections: [
      'hero',
      'about',
      'gallery',
      'features',
      'testimonials',
      'contact',
      'footer',
    ],
    recommendedPages: [
      { name: 'Home', path: '/' },
      { name: 'Work', path: '/work' },
      { name: 'About', path: '/about' },
      { name: 'Contact', path: '/contact' },
    ],
    defaultTheme: {
      primaryColor: '#18181B',
      secondaryColor: '#27272A',
      backgroundColor: '#FAFAFA',
      surfaceColor: '#FFFFFF',
      textColor: '#09090B',
      mutedTextColor: '#71717A',
      accentColor: '#4F46E5',
      fontFamily: 'Outfit',
      headingFont: 'Outfit',
      bodyFont: 'Plus Jakarta Sans',
      borderRadius: 'lg',
      spacing: 'spacious',
      buttonStyle: 'pill',
      mode: 'light',
    },
    guidelines:
      'Feature project case studies, craftsmanship, visual design taste, and straightforward contact pathways without corporate clutter.',
  },

  saas: {
    id: 'saas',
    category: 'saas',
    name: 'SaaS Landing Page',
    tagline: 'High-Converting Software Product',
    description: 'Cloud platforms, developer tools, AI utilities, and B2B software solutions.',
    recommendedSections: [
      'hero',
      'features',
      'statistics',
      'pricing',
      'faq',
      'cta',
      'footer',
    ],
    recommendedPages: [
      { name: 'Home', path: '/' },
      { name: 'Pricing', path: '/pricing' },
      { name: 'Docs', path: '/docs' },
    ],
    defaultTheme: {
      primaryColor: '#2563EB',
      secondaryColor: '#1D4ED8',
      backgroundColor: '#FFFFFF',
      surfaceColor: '#F8FAFC',
      textColor: '#0F172A',
      mutedTextColor: '#64748B',
      accentColor: '#6366F1',
      fontFamily: 'Plus Jakarta Sans',
      headingFont: 'Plus Jakarta Sans',
      bodyFont: 'DM Sans',
      borderRadius: 'md',
      spacing: 'comfortable',
      buttonStyle: 'rounded',
      mode: 'light',
    },
    guidelines:
      'Highlight software benefits, developer experience, clear tiered pricing comparison, interactive preview triggers, and low-friction signup CTAs.',
  },

  agency: {
    id: 'agency',
    category: 'agency',
    name: 'Agency Website',
    tagline: 'Studio & Client Services',
    description: 'Digital agencies, marketing firms, branding studios, and engineering collectives.',
    recommendedSections: [
      'hero',
      'services',
      'process',
      'team',
      'testimonials',
      'cta',
      'footer',
    ],
    recommendedPages: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: 'Case Studies', path: '/cases' },
      { name: 'Contact', path: '/contact' },
    ],
    defaultTheme: {
      primaryColor: '#09090B',
      secondaryColor: '#18181B',
      backgroundColor: '#FFFFFF',
      surfaceColor: '#F4F4F5',
      textColor: '#09090B',
      mutedTextColor: '#71717A',
      accentColor: '#E11D48',
      fontFamily: 'Bricolage Grotesque',
      headingFont: 'Bricolage Grotesque',
      bodyFont: 'Plus Jakarta Sans',
      borderRadius: 'sm',
      spacing: 'comfortable',
      buttonStyle: 'square',
      mode: 'light',
    },
    guidelines:
      'Demonstrate methodology, step-by-step engagement process, agency team expertise, client transformations, and partnership inquiry CTA.',
  },

  ecommerce: {
    id: 'ecommerce',
    category: 'ecommerce',
    name: 'Online Store',
    tagline: 'Modern Storefront Presentation',
    description: 'Direct-to-consumer lifestyle brands, specialty retail, artisanal goods, and boutiques.',
    recommendedSections: [
      'hero',
      'features',
      'gallery',
      'testimonials',
      'faq',
      'footer',
    ],
    recommendedPages: [
      { name: 'Home', path: '/' },
      { name: 'Catalog', path: '/catalog' },
      { name: 'About', path: '/about' },
      { name: 'FAQ', path: '/faq' },
    ],
    defaultTheme: {
      primaryColor: '#18181B',
      secondaryColor: '#27272A',
      backgroundColor: '#FFFFFF',
      surfaceColor: '#FAFAFA',
      textColor: '#18181B',
      mutedTextColor: '#71717A',
      accentColor: '#059669',
      fontFamily: 'Manrope',
      headingFont: 'Manrope',
      bodyFont: 'DM Sans',
      borderRadius: 'md',
      spacing: 'comfortable',
      buttonStyle: 'rounded',
      mode: 'light',
    },
    guidelines:
      'Focus on product curation, collection aesthetics, sustainable materials or artisanal quality, and clean storefront presentation. Do NOT fake live payment processing or checkout mechanisms.',
  },
};

export function getPresetById(presetId?: string): GenerationPreset | undefined {
  if (!presetId) return undefined;
  return GENERATION_PRESETS[presetId.toLowerCase()];
}
