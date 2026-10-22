/**
 * Canonical WebsiteDocument Schema Definition
 *
 * Implements strict runtime validation via Zod and static TypeScript types.
 * Serves as the single source of truth for AI-generated website data across
 * both client and server layers.
 */

import { z } from 'zod';

// ============================================================================
// 1. Primitive & Enum Validators
// ============================================================================

export const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const HexColorSchema = z
  .string()
  .regex(HEX_COLOR_REGEX, 'Must be a valid hex color code (e.g. #2563EB or #FFF)');

export const SafeUrlSchema = z.string().refine((val) => {
  const trimmed = val.trim();
  if (trimmed.startsWith('#') || trimmed.startsWith('/')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}, 'URL must be a valid internal path (/...), anchor (#...), or https:// link.');

export const WebsiteCategorySchema = z.enum([
  'business',
  'portfolio',
  'saas',
  'agency',
  'ecommerce',
  'blog',
  'other',
]);

export type WebsiteCategory = z.infer<typeof WebsiteCategorySchema>;

export const FontPresetSchema = z.enum([
  'Plus Jakarta Sans',
  'Outfit',
  'Manrope',
  'DM Sans',
  'Bricolage Grotesque',
  'Public Sans',
]);

export type FontPreset = z.infer<typeof FontPresetSchema>;

export const SectionTypeSchema = z.enum([
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
]);

export type SectionType = z.infer<typeof SectionTypeSchema>;

export const SectionLayoutSchema = z.enum([
  'centered',
  'split',
  'grid',
  'cards',
  'linear',
]);

export type SectionLayout = z.infer<typeof SectionLayoutSchema>;

// ============================================================================
// 2. Global Theme Schema
// ============================================================================

export const GlobalThemeSchema = z.object({
  primaryColor: HexColorSchema,
  secondaryColor: HexColorSchema,
  backgroundColor: HexColorSchema,
  surfaceColor: HexColorSchema,
  textColor: HexColorSchema,
  mutedTextColor: HexColorSchema.optional(),
  mutedColor: HexColorSchema.optional(),
  accentColor: HexColorSchema,
  fontFamily: FontPresetSchema.default('Plus Jakarta Sans'),
  headingFont: FontPresetSchema.default('Plus Jakarta Sans').optional(),
  bodyFont: FontPresetSchema.default('DM Sans').optional(),
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'xl', 'full']).default('md'),
  spacing: z.enum(['compact', 'comfortable', 'normal', 'spacious']).default('comfortable'),
  buttonStyle: z.enum(['rounded', 'pill', 'square', 'outline']).default('rounded').optional(),
  mode: z.enum(['light', 'dark']).default('light').optional(),
});

export type GlobalTheme = z.infer<typeof GlobalThemeSchema>;
export const WebsiteThemeSchema = GlobalThemeSchema;
export type WebsiteTheme = GlobalTheme;

// ============================================================================
// 3. Navigation Schema
// ============================================================================

export const NavigationItemSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1).max(50),
  href: SafeUrlSchema,
  isExternal: z.boolean().default(false).optional(),
});

export type NavigationItem = z.infer<typeof NavigationItemSchema>;

export const NavigationSchema = z.object({
  brandName: z.string().min(1).max(80),
  logoText: z.string().max(80).optional(),
  items: z.array(NavigationItemSchema).default([]),
  primaryCta: z
    .object({
      label: z.string().min(1).max(50),
      href: SafeUrlSchema,
    })
    .optional(),
});

export type Navigation = z.infer<typeof NavigationSchema>;

// ============================================================================
// 4. Metadata & SEO Schemas
// ============================================================================

export const WebsiteSeoSchema = z.object({
  title: z.string().max(120).optional(),
  description: z.string().max(400).optional(),
  keywords: z.array(z.string().max(100)).default([]),
  ogTitle: z.string().max(120).optional(),
  ogDescription: z.string().max(400).optional(),
  ogImage: SafeUrlSchema.optional(),
});

export type WebsiteSeo = z.infer<typeof WebsiteSeoSchema>;

// ============================================================================
// 5. Section Content Schemas (Controlled by SectionType)
// ============================================================================

export const HeroContentSchema = z.object({
  heading: z.string().min(1).max(180),
  supportingText: z.string().min(1).max(500),
  primaryCta: z.object({
    label: z.string().min(1).max(50),
    href: SafeUrlSchema,
  }),
  secondaryCta: z
    .object({
      label: z.string().min(1).max(50),
      href: SafeUrlSchema,
    })
    .optional(),
  imageReference: z
    .object({
      alt: z.string().max(100),
      badge: z.string().max(40).optional(),
      url: SafeUrlSchema.optional(),
    })
    .optional(),
  alignment: z.enum(['left', 'center']).default('left'),
});

export const FeatureItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(300),
  icon: z.string().max(40).optional(),
});

export const FeaturesContentSchema = z.object({
  heading: z.string().min(1).max(150),
  description: z.string().max(400).optional(),
  items: z.array(FeatureItemSchema).min(1).max(12),
});

export const AboutContentSchema = z.object({
  heading: z.string().min(1).max(150),
  story: z.string().min(1).max(1000),
  mission: z.string().max(400).optional(),
  vision: z.string().max(400).optional(),
  highlights: z.array(z.string().max(100)).max(6).optional(),
});

export const ServiceItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(300),
  icon: z.string().max(40).optional(),
  badge: z.string().max(40).optional(),
});

export const ServicesContentSchema = z.object({
  heading: z.string().min(1).max(150),
  description: z.string().max(400).optional(),
  items: z.array(ServiceItemSchema).min(1).max(12),
});

export const StatItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1).max(60),
  value: z.string().min(1).max(30),
  description: z.string().max(150).optional(),
});

export const StatisticsContentSchema = z.object({
  heading: z.string().max(150).optional(),
  description: z.string().max(300).optional(),
  items: z.array(StatItemSchema).min(2).max(6),
});

export const TestimonialItemSchema = z.object({
  id: z.string(),
  quote: z.string().min(1).max(400),
  author: z.string().min(1).max(80),
  role: z.string().max(80).optional(),
  company: z.string().max(80).optional(),
});

export const TestimonialsContentSchema = z.object({
  heading: z.string().min(1).max(150),
  description: z.string().max(300).optional(),
  disclaimer: z
    .string()
    .default('Generated placeholder testimonials for layout preview purposes.'),
  items: z.array(TestimonialItemSchema).min(1).max(8),
});

export const PricingPlanSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  price: z.string().min(1).max(30),
  billingPeriod: z.string().max(30).default('/month'),
  description: z.string().max(200).optional(),
  features: z.array(z.string().max(100)).min(1).max(10),
  isPopular: z.boolean().default(false),
  ctaText: z.string().max(40).default('Choose Plan'),
});

export const PricingContentSchema = z.object({
  heading: z.string().min(1).max(150),
  description: z.string().max(300).optional(),
  disclaimer: z
    .string()
    .default('Illustrative tier pricing for preview structure purposes only.'),
  plans: z.array(PricingPlanSchema).min(1).max(4),
});

export const GalleryItemSchema = z.object({
  id: z.string(),
  title: z.string().max(80).optional(),
  description: z.string().max(200).optional(),
  category: z.string().max(40).optional(),
  imageAlt: z.string().min(1).max(100),
});

export const GalleryContentSchema = z.object({
  heading: z.string().min(1).max(150),
  description: z.string().max(300).optional(),
  items: z.array(GalleryItemSchema).min(1).max(12),
});

export const TeamMemberSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(80),
  role: z.string().min(1).max(80),
  bio: z.string().max(300).optional(),
});

export const TeamContentSchema = z.object({
  heading: z.string().min(1).max(150),
  description: z.string().max(300).optional(),
  members: z.array(TeamMemberSchema).min(1).max(8),
});

export const ProcessStepSchema = z.object({
  id: z.string(),
  stepNumber: z.number().int().min(1).max(20),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(300),
});

export const ProcessContentSchema = z.object({
  heading: z.string().min(1).max(150),
  description: z.string().max(300).optional(),
  steps: z.array(ProcessStepSchema).min(2).max(8),
});

export const FaqItemSchema = z.object({
  id: z.string(),
  question: z.string().min(1).max(200),
  answer: z.string().min(1).max(600),
});

export const FaqContentSchema = z.object({
  heading: z.string().min(1).max(150),
  description: z.string().max(300).optional(),
  items: z.array(FaqItemSchema).min(1).max(12),
});

export const ContactContentSchema = z.object({
  heading: z.string().min(1).max(150),
  supportingText: z.string().max(400).optional(),
  email: z.string().email().optional().or(z.literal('')),
  formFields: z
    .array(z.enum(['name', 'email', 'phone', 'subject', 'message']))
    .default(['name', 'email', 'message']),
  submissionNotice: z
    .string()
    .default('Form preview interface. Backend submission handler will be wired in future milestone.'),
});

export const CtaContentSchema = z.object({
  heading: z.string().min(1).max(150),
  description: z.string().max(400).optional(),
  buttonText: z.string().min(1).max(50),
  buttonLink: SafeUrlSchema,
  badge: z.string().max(40).optional(),
});

export const FooterLinkSchema = z.object({
  label: z.string().min(1).max(40),
  href: SafeUrlSchema,
});

export const FooterContentSchema = z.object({
  brandName: z.string().min(1).max(80),
  description: z.string().max(300).optional(),
  links: z.array(FooterLinkSchema).max(12).default([]),
  copyrightText: z.string().max(100).optional(),
});

export const HeaderContentSchema = z.object({
  brandName: z.string().min(1).max(80),
  tagline: z.string().max(200).optional(),
  primaryCta: z
    .object({
      label: z.string().min(1).max(50),
      href: SafeUrlSchema,
    })
    .optional(),
  links: z.array(FooterLinkSchema).max(10).default([]),
});

// Union of all validated section contents
export const SectionContentSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('hero'), data: HeroContentSchema }),
  z.object({ type: z.literal('features'), data: FeaturesContentSchema }),
  z.object({ type: z.literal('about'), data: AboutContentSchema }),
  z.object({ type: z.literal('services'), data: ServicesContentSchema }),
  z.object({ type: z.literal('statistics'), data: StatisticsContentSchema }),
  z.object({ type: z.literal('testimonials'), data: TestimonialsContentSchema }),
  z.object({ type: z.literal('pricing'), data: PricingContentSchema }),
  z.object({ type: z.literal('gallery'), data: GalleryContentSchema }),
  z.object({ type: z.literal('team'), data: TeamContentSchema }),
  z.object({ type: z.literal('process'), data: ProcessContentSchema }),
  z.object({ type: z.literal('faq'), data: FaqContentSchema }),
  z.object({ type: z.literal('contact'), data: ContactContentSchema }),
  z.object({ type: z.literal('cta'), data: CtaContentSchema }),
  z.object({ type: z.literal('footer'), data: FooterContentSchema }),
  z.object({ type: z.literal('header'), data: HeaderContentSchema }),
]);

// Generic section document
export const WebsiteSectionSchema = z.object({
  id: z.string(),
  type: SectionTypeSchema,
  label: z.string().max(60).optional(),
  layout: SectionLayoutSchema.default('grid'),
  isVisible: z.boolean().default(true),
  // Content can be typed object matching section schema
  content: z.record(z.string(), z.unknown()),
});

export type WebsiteSection = z.infer<typeof WebsiteSectionSchema>;

// ============================================================================
// 6. Website Page Schema
// ============================================================================

export const RoutePathSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^\/[a-zA-Z0-9\-_/]*$/, 'Route path must start with / and contain only alphanumeric, dash, or slash characters.');

export const WebsitePageSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(60),
  path: RoutePathSchema,
  seo: z
    .object({
      title: z.string().max(80).optional(),
      description: z.string().max(200).optional(),
    })
    .optional(),
  sections: z.array(WebsiteSectionSchema).min(1).max(20),
});

export type WebsitePage = z.infer<typeof WebsitePageSchema>;

// ============================================================================
// 7. Canonical WebsiteDocument Schema
// ============================================================================

export const CURRENT_SCHEMA_VERSION = '1.0.0';

export const WebsiteDocumentSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(400),
  category: WebsiteCategorySchema.default('business'),
  theme: GlobalThemeSchema,
  navigation: NavigationSchema.optional(),
  pages: z.array(WebsitePageSchema).min(1).max(10),
  seo: WebsiteSeoSchema.optional(),
  schemaVersion: z.string().default(CURRENT_SCHEMA_VERSION),
  createdAt: z.string(),
  updatedAt: z.string(),
  presetId: z.string().optional(),
});

export type WebsiteDocument = z.infer<typeof WebsiteDocumentSchema>;
