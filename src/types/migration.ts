/**
 * Schema Migration & Backward Compatibility Adapter
 *
 * Normalizes legacy WebsiteSpecification objects or raw AI outputs
 * into canonical WebsiteDocument structures without data loss.
 */

import {
  WebsiteDocument,
  CURRENT_SCHEMA_VERSION,
  GlobalTheme,
  Navigation,
  WebsiteSeo,
  SectionType,
} from './schema';

export const ALLOWED_SECTION_TYPES: SectionType[] = [
  'hero',
  'features',
  'about',
  'services',
  'statistics',
  'testimonials',
  'pricing',
  'gallery',
  'team',
  'process',
  'faq',
  'contact',
  'cta',
  'footer',
  'header',
];

export function migrateToWebsiteDocument(raw: unknown): WebsiteDocument | null {
  if (!raw || typeof raw !== 'object') return null;

  const obj = raw as Record<string, unknown>;

  // Check for explicitly empty title
  if (typeof obj.title === 'string' && !obj.title.trim()) {
    return null;
  }

  const id =
    typeof obj.id === 'string' && obj.id.trim()
      ? obj.id.trim()
      : 'doc_' + Math.random().toString(36).substring(2, 9);

  const title =
    typeof obj.title === 'string' && obj.title.trim()
      ? obj.title.trim()
      : 'Generated Website';

  const description =
    typeof obj.description === 'string' && obj.description.trim()
      ? obj.description.trim()
      : 'Structured website specification created with SiteForge AI.';

  const category = (
    ['business', 'portfolio', 'saas', 'agency', 'ecommerce', 'blog', 'other'] as const
  ).includes(obj.category as any)
    ? (obj.category as any)
    : 'business';

  // Normalize theme
  const rawTheme = (
    obj.theme && typeof obj.theme === 'object' ? obj.theme : {}
  ) as Record<string, unknown>;
  const hexPattern = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

  const safeHex = (val: unknown, fallback: string) =>
    typeof val === 'string' && hexPattern.test(val.trim()) ? val.trim() : fallback;

  // Legacy fontStyle mapping
  let defaultFont = 'Plus Jakarta Sans';
  if (typeof rawTheme.fontStyle === 'string') {
    const fs = rawTheme.fontStyle.toLowerCase();
    if (fs.includes('serif')) defaultFont = 'Plus Jakarta Sans';
    else if (fs.includes('mono')) defaultFont = 'DM Sans';
    else if (fs.includes('display')) defaultFont = 'Outfit';
  }

  const theme: GlobalTheme = {
    primaryColor: safeHex(rawTheme.primaryColor, '#2563EB'),
    secondaryColor: safeHex(rawTheme.secondaryColor, '#1E40AF'),
    backgroundColor: safeHex(rawTheme.backgroundColor, '#FFFFFF'),
    surfaceColor: safeHex(rawTheme.surfaceColor, '#F8FAFC'),
    textColor: safeHex(rawTheme.textColor, '#0F172A'),
    mutedTextColor: safeHex(rawTheme.mutedTextColor, '#64748B'),
    accentColor: safeHex(rawTheme.accentColor, '#4F46E5'),
    fontFamily: (
      ['Plus Jakarta Sans', 'Outfit', 'Manrope', 'DM Sans', 'Bricolage Grotesque', 'Public Sans'] as const
    ).includes(rawTheme.fontFamily as any)
      ? (rawTheme.fontFamily as any)
      : (defaultFont as any),
    headingFont: (
      ['Plus Jakarta Sans', 'Outfit', 'Manrope', 'Bricolage Grotesque', 'DM Sans', 'Public Sans'] as const
    ).includes(rawTheme.headingFont as any)
      ? (rawTheme.headingFont as any)
      : (defaultFont as any),
    bodyFont: (
      ['DM Sans', 'Public Sans', 'Plus Jakarta Sans', 'Outfit', 'Manrope', 'Bricolage Grotesque'] as const
    ).includes(rawTheme.bodyFont as any)
      ? (rawTheme.bodyFont as any)
      : 'DM Sans',
    borderRadius: (['none', 'sm', 'md', 'lg', 'full'] as const).includes(
      rawTheme.borderRadius as any
    )
      ? (rawTheme.borderRadius as any)
      : 'md',
    spacing: (['compact', 'comfortable', 'spacious'] as const).includes(
      rawTheme.spacing as any
    )
      ? (rawTheme.spacing as any)
      : 'comfortable',
    buttonStyle: (['rounded', 'pill', 'square', 'outline'] as const).includes(
      rawTheme.buttonStyle as any
    )
      ? (rawTheme.buttonStyle as any)
      : 'rounded',
    mode: rawTheme.mode === 'dark' ? 'dark' : 'light',
  };

  // If pages array is explicitly empty, preserve empty array so schema rejects it
  if (Array.isArray(obj.pages) && obj.pages.length === 0) {
    return {
      id,
      title,
      description,
      category,
      theme,
      pages: [],
      schemaVersion: CURRENT_SCHEMA_VERSION,
      createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
      updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : new Date().toISOString(),
      presetId: typeof obj.presetId === 'string' ? obj.presetId : undefined,
    };
  }

  // Normalize pages
  const rawPages = Array.isArray(obj.pages) ? obj.pages : [];
  const pages = rawPages.map((rawPage: any, pIdx: number) => {
    const pageObj = (
      rawPage && typeof rawPage === 'object' ? rawPage : {}
    ) as Record<string, unknown>;

    const pageName =
      typeof pageObj.name === 'string' && pageObj.name.trim()
        ? pageObj.name.trim()
        : pIdx === 0
        ? 'Home'
        : `Page ${pIdx + 1}`;

    let path = '/';
    if (pIdx === 0) {
      path = '/';
    } else {
      const rawPath =
        typeof pageObj.path === 'string' && pageObj.path.trim()
          ? pageObj.path.trim()
          : `/${pageName}`;
      if (rawPath === '/') {
        path = '/';
      } else {
        const slug = rawPath
          .toLowerCase()
          .replace(/^\/+/, '')
          .replace(/[^a-z0-9\-_/]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        path = '/' + (slug || `page-${pIdx + 1}`);
      }
    }

    const rawSections = Array.isArray(pageObj.sections) ? pageObj.sections : [];
    const sections = rawSections.map((rawSec: any, sIdx: number) => {
      const secObj = (
        rawSec && typeof rawSec === 'object' ? rawSec : {}
      ) as Record<string, unknown>;

      const rawType =
        typeof secObj.type === 'string' ? secObj.type.toLowerCase().trim() : 'features';
      // Sanitize rogue/unsupported section types to an allowed section type
      const type: SectionType = ALLOWED_SECTION_TYPES.includes(rawType as SectionType)
        ? (rawType as SectionType)
        : 'features';

      const heading =
        typeof secObj.heading === 'string' && secObj.heading.trim()
          ? secObj.heading.trim()
          : 'Section';

      return {
        id:
          typeof secObj.id === 'string' && secObj.id
            ? secObj.id
            : `sec_${pIdx}_${sIdx}_${Math.random().toString(36).substring(2, 6)}`,
        type,
        label: typeof secObj.label === 'string' ? secObj.label : undefined,
        layout: (
          ['centered', 'split', 'grid', 'cards', 'linear'] as const
        ).includes(secObj.layout as any)
          ? (secObj.layout as any)
          : 'grid',
        isVisible: secObj.isVisible !== false,
        content:
          secObj.content && typeof secObj.content === 'object'
            ? (secObj.content as Record<string, unknown>)
            : {
                heading,
                supportingText: secObj.subheading,
                description: secObj.subheading,
                buttonText: secObj.buttonText,
                buttonLink: secObj.buttonLink,
                items: secObj.items,
              },
      };
    });

    return {
      id:
        typeof pageObj.id === 'string' && pageObj.id
          ? pageObj.id
          : `page_${pIdx}_${Math.random().toString(36).substring(2, 6)}`,
      name: pageName,
      path,
      seo:
        pageObj.seo && typeof pageObj.seo === 'object'
          ? (pageObj.seo as any)
          : undefined,
      sections,
    };
  });

  const finalPages =
    pages.length > 0
      ? pages
      : [
          {
            id: 'page_default',
            name: 'Home',
            path: '/',
            sections: [
              {
                id: 'sec_hero_default',
                type: 'hero' as const,
                layout: 'split' as const,
                isVisible: true,
                content: {
                  heading: `Welcome to ${title}`,
                  supportingText: description,
                  primaryCta: { label: 'Get Started', href: '#contact' },
                },
              },
            ],
          },
        ];

  // Normalize navigation
  let navigation: Navigation | undefined;
  if (obj.navigation && typeof obj.navigation === 'object') {
    const rawNav = obj.navigation as Record<string, unknown>;
    navigation = {
      brandName:
        typeof rawNav.brandName === 'string' && rawNav.brandName.trim()
          ? rawNav.brandName.trim()
          : title,
      logoText:
        typeof rawNav.logoText === 'string' ? rawNav.logoText.trim() : undefined,
      items: Array.isArray(rawNav.items)
        ? rawNav.items.map((it: any) => ({
            label: typeof it.label === 'string' ? it.label : 'Link',
            href: typeof it.href === 'string' ? it.href : '/',
            isExternal: Boolean(it.isExternal),
          }))
        : finalPages.map((p) => ({
            label: p.name,
            href: p.path,
            isExternal: false,
          })),
      primaryCta:
        rawNav.primaryCta && typeof rawNav.primaryCta === 'object'
          ? {
              label:
                typeof (rawNav.primaryCta as any).label === 'string'
                  ? (rawNav.primaryCta as any).label
                  : 'Contact Us',
              href:
                typeof (rawNav.primaryCta as any).href === 'string'
                  ? (rawNav.primaryCta as any).href
                  : '#contact',
            }
          : { label: 'Get Started', href: '#contact' },
    };
  } else {
    // Generate default navigation from pages and brand
    navigation = {
      brandName: title,
      items: finalPages.map((p) => ({
        label: p.name,
        href: p.path,
        isExternal: false,
      })),
      primaryCta: { label: 'Get Started', href: '#contact' },
    };
  }

  // Normalize SEO
  let seo: WebsiteSeo | undefined;
  if (obj.seo && typeof obj.seo === 'object') {
    const rawSeo = obj.seo as Record<string, unknown>;
    const seoTitle = typeof rawSeo.title === 'string' ? rawSeo.title.trim().slice(0, 120) : title.slice(0, 120);
    const seoDesc = typeof rawSeo.description === 'string' ? rawSeo.description.trim().slice(0, 400) : description.slice(0, 400);
    seo = {
      title: seoTitle,
      description: seoDesc,
      keywords: Array.isArray(rawSeo.keywords)
        ? rawSeo.keywords
            .filter((k) => typeof k === 'string')
            .map((k) => (k as string).trim().slice(0, 100))
            .filter(Boolean)
            .slice(0, 20)
        : [category, 'website', title.toLowerCase().slice(0, 100)],
      ogTitle: typeof rawSeo.ogTitle === 'string' ? rawSeo.ogTitle.trim().slice(0, 120) : seoTitle,
      ogDescription: typeof rawSeo.ogDescription === 'string' ? rawSeo.ogDescription.trim().slice(0, 400) : seoDesc,
      ogImage: typeof rawSeo.ogImage === 'string' ? rawSeo.ogImage : undefined,
    };
  } else {
    seo = {
      title: title.slice(0, 120),
      description: description.slice(0, 400),
      keywords: [category, 'website', title.toLowerCase().slice(0, 100)],
      ogTitle: title.slice(0, 120),
      ogDescription: description.slice(0, 400),
    };
  }

  return {
    id,
    title,
    description,
    category,
    theme,
    navigation,
    pages: finalPages,
    seo,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    createdAt:
      typeof obj.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt:
      typeof obj.updatedAt === 'string' ? obj.updatedAt : new Date().toISOString(),
    presetId: typeof obj.presetId === 'string' ? obj.presetId : undefined,
  };
}
