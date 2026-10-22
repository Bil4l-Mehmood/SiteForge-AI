/**
 * Website Export Service
 *
 * Implements full source code project generation (React + Vite + Tailwind)
 * and standalone multi-page static HTML export packages.
 *
 * Adheres strictly to the canonical WebsiteDocument schema, sanitizes all input,
 * prevents XSS, and packages clean, production-ready downloadable ZIP archives.
 */

import JSZip from 'jszip';
import { Project, WebsiteDocument, WebsitePage, WebsiteSection } from '../types';
import { WebsiteDocumentSchema } from '../types/schema';
import { getFontFamilyCss, isLightColor } from '../components/renderer/themeUtils';

export type ExportFormat = 'react-vite' | 'static-html' | 'json';

export interface ExportProgress {
  stage: 'validating' | 'generating' | 'packaging' | 'complete' | 'error';
  message: string;
  percent: number;
}

export type ExportProgressCallback = (progress: ExportProgress) => void;

/**
 * Escapes HTML characters for safe static template injection
 */
function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitizes URLs to prevent javascript: or unsafe script protocols
 */
function sanitizeUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (trimmed.startsWith('#') || trimmed.startsWith('/')) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) return trimmed;
  return '#';
}

/**
 * Generates a filesystem-safe project slug
 */
export function sanitizeProjectSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'siteforge-website'
  );
}

/**
 * Sanitizes archive entry paths to strictly prevent path traversal (Zip Slip vulnerability)
 */
export function sanitizeZipFilePath(rawPath: string): string {
  if (!rawPath || typeof rawPath !== 'string') return 'unnamed-file';
  // Strip null bytes and control chars
  let cleaned = rawPath.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
  // Normalize Windows backslashes to forward slashes
  cleaned = cleaned.replace(/\\+/g, '/');
  // Strip drive letters like C: or D:
  cleaned = cleaned.replace(/^[a-zA-Z]:/g, '');
  // Strip leading slashes to prevent absolute paths
  cleaned = cleaned.replace(/^\/+/g, '');

  // Split into segments and filter out '.' and '..'
  const segments = cleaned.split('/').filter((seg) => {
    const trimmed = seg.trim();
    return trimmed.length > 0 && trimmed !== '.' && trimmed !== '..';
  });

  if (segments.length === 0) return 'unnamed-file';
  return segments.join('/');
}

/**
 * Derives a sanitized, safe HTML filename for a given page
 */
export function sanitizePageFileName(pagePath: string, isHome: boolean): string {
  if (isHome || pagePath === '/' || !pagePath.trim()) return 'index.html';
  const slug = pagePath
    .toLowerCase()
    .replace(/^\/+/, '')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return sanitizeZipFilePath(`${slug || 'page'}.html`);
}

export class ExportService {
  /**
   * Validates and prepares the document for export
   */
  static validateForExport(docOrProject: WebsiteDocument | Project): WebsiteDocument {
    const rawDoc =
      'document' in docOrProject
        ? docOrProject.document || docOrProject.specification
        : docOrProject;

    if (!rawDoc) {
      throw new Error('No website document found to export. Generate a website first.');
    }

    const validation = WebsiteDocumentSchema.safeParse(rawDoc);
    if (!validation.success) {
      const issueDetails = validation.error.issues
        .slice(0, 3)
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
      throw new Error(`Website document validation failed: ${issueDetails}`);
    }

    return validation.data;
  }

  /**
   * Main export method: packages files into a downloadable Blob
   */
  static async exportWebsite(
    projectOrDoc: Project | WebsiteDocument,
    format: ExportFormat,
    onProgress?: ExportProgressCallback
  ): Promise<{ blob: Blob; filename: string; zip?: JSZip; files: string[] }> {
    onProgress?.({
      stage: 'validating',
      message: 'Validating website schema and structure...',
      percent: 15,
    });

    const doc = this.validateForExport(projectOrDoc);
    const projectName = 'name' in projectOrDoc ? projectOrDoc.name : doc.title;
    const projectId = 'id' in projectOrDoc ? projectOrDoc.id : doc.id;
    const slug = sanitizeProjectSlug(projectName || doc.title);

    if (format === 'json') {
      onProgress?.({
        stage: 'generating',
        message: 'Formatting canonical JSON document...',
        percent: 60,
      });

      const jsonStr = JSON.stringify(
        {
          generator: 'SiteForge AI Website Builder',
          exportedAt: new Date().toISOString(),
          project: {
            id: projectId,
            name: projectName,
          },
          websiteDocument: doc,
        },
        null,
        2
      );

      const blob = new Blob([jsonStr], { type: 'application/json' });
      onProgress?.({
        stage: 'complete',
        message: 'JSON blueprint ready for download.',
        percent: 100,
      });

      return { blob, filename: `${slug}-blueprint.json`, files: [`${slug}-blueprint.json`] };
    }

    const zip = new JSZip();

    if (format === 'react-vite') {
      onProgress?.({
        stage: 'generating',
        message: 'Synthesizing React 19 + Vite components and configuration...',
        percent: 40,
      });

      await this.generateReactViteProject(zip, doc, projectName);
    } else if (format === 'static-html') {
      onProgress?.({
        stage: 'generating',
        message: 'Synthesizing multi-page HTML and responsive styles...',
        percent: 40,
      });

      await this.generateStaticHtmlProject(zip, doc, projectName);
    }

    onProgress?.({
      stage: 'packaging',
      message: 'Compressing files into ZIP archive...',
      percent: 80,
    });

    const content = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const filename = `${slug}-${format === 'react-vite' ? 'react-vite-source' : 'static-website'}.zip`;
    const files = Object.keys(zip.files);

    onProgress?.({
      stage: 'complete',
      message: 'Website export complete! Download initiated.',
      percent: 100,
    });

    return { blob: content, filename, zip, files };
  }

  /**
   * Helper to trigger browser download
   */
  static triggerDownload(blob: Blob, filename: string): void {
    if (typeof window === 'undefined') return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }

  // ==========================================================================
  // Option A: React + Vite + Tailwind CSS Project Generation
  // ==========================================================================

  private static async generateReactViteProject(
    zip: JSZip,
    doc: WebsiteDocument,
    projectName: string
  ): Promise<void> {
    const slug = sanitizeProjectSlug(projectName || doc.title);
    const fontCss = getFontFamilyCss(doc.theme.fontFamily);
    const fontGoogleQuery = (doc.theme.fontFamily || 'Plus Jakarta Sans').replace(/\s+/g, '+');

    // 1. package.json
    zip.file(
      'package.json',
      JSON.stringify(
        {
          name: slug,
          private: true,
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview',
          },
          dependencies: {
            react: '^19.0.0',
            'react-dom': '^19.0.0',
            'lucide-react': '^0.546.0',
          },
          devDependencies: {
            '@types/react': '^19.0.0',
            '@types/react-dom': '^19.0.0',
            '@vitejs/plugin-react': '^4.3.4',
            '@tailwindcss/vite': '^4.0.0',
            tailwindcss: '^4.0.0',
            typescript: '^5.7.0',
            vite: '^6.0.0',
          },
        },
        null,
        2
      )
    );

    // 2. vite.config.ts
    zip.file(
      'vite.config.ts',
      `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
`
    );

    // 3. tsconfig.json
    zip.file(
      'tsconfig.json',
      JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2022',
            useDefineForClassFields: true,
            lib: ['ES2022', 'DOM', 'DOM.Iterable'],
            module: 'ESNext',
            skipLibCheck: true,
            moduleResolution: 'bundler',
            allowImportingTsExtensions: false,
            resolveJsonModule: true,
            isolatedModules: true,
            moduleDetection: 'force',
            noEmit: true,
            jsx: 'react-jsx',
            strict: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            noFallthroughCasesInSwitch: true,
          },
          include: ['src'],
        },
        null,
        2
      )
    );

    // 4. index.html
    zip.file(
      'index.html',
      `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(doc.seo?.title || (doc.seo as any)?.metaTitle || doc.title)}</title>
    <meta name="description" content="${escapeHtml(doc.seo?.description || (doc.seo as any)?.metaDescription || doc.description)}" />
    ${doc.seo?.keywords && doc.seo.keywords.length > 0 ? `<meta name="keywords" content="${escapeHtml(doc.seo.keywords.join(', '))}" />` : ''}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=${fontGoogleQuery}:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body class="antialiased select-text">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
    );

    // 5. src/index.css
    zip.file(
      'src/index.css',
      `@import "tailwindcss";

:root {
  --color-primary: ${doc.theme.primaryColor};
  --color-secondary: ${doc.theme.secondaryColor};
  --color-background: ${doc.theme.backgroundColor};
  --color-surface: ${doc.theme.surfaceColor};
  --color-text: ${doc.theme.textColor};
  --color-muted: ${doc.theme.mutedTextColor};
  --color-accent: ${doc.theme.accentColor};
  font-family: ${fontCss};
}

body {
  background-color: var(--color-background);
  color: var(--color-text);
  overflow-x: hidden;
}
`
    );

    // 6. src/main.tsx
    zip.file(
      'src/main.tsx',
      `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`
    );

    // 7. src/data/websiteData.ts
    zip.file(
      'src/data/websiteData.ts',
      `export const websiteData = ${JSON.stringify(doc, null, 2)};\n`
    );

    // 8. src/components/Navbar.tsx
    zip.file(
      'src/components/Navbar.tsx',
      `import React, { useState } from 'react';
import { websiteData } from '../data/websiteData';

interface NavbarProps {
  currentPath: string;
  onNavigate: (pathOrAnchor: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const theme = websiteData.theme;
  const nav = websiteData.navigation;
  const pages = websiteData.pages;

  // Use configured nav items or derive from pages
  const configuredItems = (nav?.items || (nav as any)?.links || []) as Array<{ label: string; href: string }>;
  const navItems = configuredItems.length > 0
    ? configuredItems
    : pages.map(p => ({ label: p.name, href: p.path }));

  const cta = nav?.primaryCta || (nav as any)?.ctaButton || { label: 'Get Started', href: '#contact' };
  const brandTitle = nav?.brandName || nav?.logoText || websiteData.title;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo / Title */}
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); onNavigate('/'); }}
          className="font-bold text-lg tracking-tight transition-colors"
          style={{ color: theme.textColor }}
        >
          {brandTitle}
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item, idx) => {
            const isActive = currentPath === item.href;
            return (
              <a
                key={idx}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.href);
                }}
                className={\`transition-colors \${isActive ? 'font-semibold' : 'opacity-80 hover:opacity-100'}\`}
                style={{ color: isActive ? theme.primaryColor : theme.textColor }}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Desktop CTA Button */}
        <div className="hidden md:flex items-center">
          <a
            href={cta.href}
            onClick={(e) => {
              if (cta.href.startsWith('/') || cta.href.startsWith('#')) {
                e.preventDefault();
                onNavigate(cta.href);
              }
            }}
            className="px-4 py-2 text-sm font-semibold rounded-xl text-white transition-opacity hover:opacity-95 shadow-sm"
            style={{ backgroundColor: theme.primaryColor }}
          >
            {cta.label}
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.href);
                setIsMobileMenuOpen(false);
              }}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2">
            <a
              href={cta.href}
              onClick={(e) => {
                if (cta.href.startsWith('/') || cta.href.startsWith('#')) {
                  e.preventDefault();
                  onNavigate(cta.href);
                  setIsMobileMenuOpen(false);
                }
              }}
              className="block w-full text-center px-4 py-2.5 text-sm font-semibold rounded-xl text-white"
              style={{ backgroundColor: theme.primaryColor }}
            >
              {cta.label}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
`
    );

    // 9. src/components/Footer.tsx
    zip.file(
      'src/components/Footer.tsx',
      `import React from 'react';
import { websiteData } from '../data/websiteData';

export const Footer: React.FC = () => {
  const theme = websiteData.theme;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200" style={{ backgroundColor: theme.surfaceColor }}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ color: theme.mutedTextColor }}>
        <div>
          <span className="font-bold text-sm tracking-tight mr-2" style={{ color: theme.textColor }}>
            {websiteData.title}
          </span>
          <span>© {currentYear} All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#privacy" className="hover:underline">Privacy Policy</a>
          <a href="#terms" className="hover:underline">Terms of Service</a>
          <a href="#contact" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
};
`
    );

    // 10. src/components/SectionRenderer.tsx
    zip.file(
      'src/components/SectionRenderer.tsx',
      `import React from 'react';
import { websiteData } from '../data/websiteData';

interface SectionRendererProps {
  section: any;
  onNavigate: (path: string) => void;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({ section, onNavigate }) => {
  if (section.isVisible === false) return null;

  const content = section.content || {};
  const theme = websiteData.theme;

  const buttonStyle = {
    backgroundColor: theme.primaryColor,
    color: '#ffffff',
  };

  switch (section.type) {
    case 'hero':
      return (
        <section id={section.id} className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6" style={{ color: theme.textColor }}>
            {content.heading || 'Welcome to ' + websiteData.title}
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed" style={{ color: theme.mutedTextColor }}>
            {content.supportingText || content.description || websiteData.description}
          </p>
          {(content.primaryCta || content.buttonText) && (
            <a
              href={content.primaryCta?.href || content.buttonLink || '#contact'}
              onClick={(e) => {
                const target = content.primaryCta?.href || content.buttonLink || '#contact';
                if (target.startsWith('/') || target.startsWith('#')) {
                  e.preventDefault();
                  onNavigate(target);
                }
              }}
              className="inline-block px-6 py-3.5 text-base font-semibold rounded-xl shadow-md transition-transform hover:scale-105"
              style={buttonStyle}
            >
              {content.primaryCta?.label || content.buttonText || 'Get Started'}
            </a>
          )}
        </section>
      );

    case 'features':
      return (
        <section id={section.id} className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3" style={{ color: theme.textColor }}>
              {content.heading || 'Features & Capabilities'}
            </h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: theme.mutedTextColor }}>
              {content.subheading || 'Built with quality and performance in mind.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(content.features || content.items || []).map((feat: any, idx: number) => (
              <div key={idx} className="p-6 rounded-2xl border border-slate-200/80 shadow-xs" style={{ backgroundColor: theme.surfaceColor }}>
                <h3 className="font-bold text-lg mb-2" style={{ color: theme.textColor }}>{feat.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: theme.mutedTextColor }}>{feat.description}</p>
              </div>
            ))}
          </div>
        </section>
      );

    case 'testimonials':
      return (
        <section id={section.id} className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3" style={{ color: theme.textColor }}>
              {content.heading || 'What People Say'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(content.testimonials || []).map((item: any, idx: number) => (
              <div key={idx} className="p-6 rounded-2xl border border-slate-200/80 shadow-xs" style={{ backgroundColor: theme.surfaceColor }}>
                <p className="italic text-sm mb-4 leading-relaxed" style={{ color: theme.textColor }}>"{item.quote}"</p>
                <div>
                  <span className="font-bold text-sm block" style={{ color: theme.textColor }}>{item.author}</span>
                  <span className="text-xs" style={{ color: theme.mutedTextColor }}>{item.role || item.company}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      );

    case 'pricing':
      return (
        <section id={section.id} className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3" style={{ color: theme.textColor }}>
              {content.heading || 'Transparent Pricing'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(content.plans || []).map((plan: any, idx: number) => (
              <div key={idx} className={\`p-6 rounded-2xl border flex flex-col justify-between \${plan.isPopular ? 'ring-2 ring-indigo-500 shadow-md' : 'border-slate-200 shadow-xs'}\`} style={{ backgroundColor: theme.surfaceColor }}>
                <div>
                  <h3 className="font-bold text-xl mb-1" style={{ color: theme.textColor }}>{plan.name}</h3>
                  <div className="text-3xl font-extrabold my-4" style={{ color: theme.textColor }}>{plan.price}</div>
                  <ul className="space-y-2 text-sm mb-6" style={{ color: theme.mutedTextColor }}>
                    {(plan.features || []).map((f: string, fIdx: number) => (
                      <li key={fIdx}>✓ {f}</li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => onNavigate('#contact')}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm text-white"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {plan.ctaLabel || 'Choose Plan'}
                </button>
              </div>
            ))}
          </div>
        </section>
      );

    case 'faq':
      return (
        <section id={section.id} className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-8" style={{ color: theme.textColor }}>
            {content.heading || 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-4">
            {(content.items || content.faqs || []).map((faq: any, idx: number) => (
              <details key={idx} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs group">
                <summary className="font-semibold text-sm cursor-pointer list-none flex justify-between items-center" style={{ color: theme.textColor }}>
                  <span>{faq.question}</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: theme.mutedTextColor }}>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      );

    case 'contact':
      return (
        <section id={section.id} className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2" style={{ color: theme.textColor }}>
              {content.heading || 'Get in Touch'}
            </h2>
            <p className="text-sm" style={{ color: theme.mutedTextColor }}>
              {content.subheading || 'Send a message and we will get back to you shortly.'}
            </p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for reaching out!'); }} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: theme.textColor }}>Name</label>
              <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Your Name" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: theme.textColor }}>Email</label>
              <input type="email" required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="you@domain.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: theme.textColor }}>Message</label>
              <textarea rows={4} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="How can we help?"></textarea>
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl font-semibold text-sm text-white" style={{ backgroundColor: theme.primaryColor }}>
              Send Message
            </button>
          </form>
        </section>
      );

    default:
      return (
        <section id={section.id} className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          {content.heading && (
            <h2 className="text-2xl font-bold mb-4" style={{ color: theme.textColor }}>{content.heading}</h2>
          )}
          {content.subheading && (
            <p className="text-sm mb-4" style={{ color: theme.mutedTextColor }}>{content.subheading}</p>
          )}
        </section>
      );
  }
};
`
    );

    // 11. src/App.tsx
    zip.file(
      'src/App.tsx',
      `import React, { useState, useEffect } from 'react';
import { websiteData } from './data/websiteData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SectionRenderer } from './components/SectionRenderer';

export default function App() {
  const [currentPath, setCurrentPath] = useState('/');

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPath]);

  const handleNavigate = (pathOrAnchor: string) => {
    if (pathOrAnchor.startsWith('#')) {
      const targetId = pathOrAnchor.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    setCurrentPath(pathOrAnchor.startsWith('/') ? pathOrAnchor : '/' + pathOrAnchor);
  };

  // Resolve matching page from websiteData.pages
  const activePage = websiteData.pages.find(p => p.path === currentPath) || websiteData.pages[0];

  return (
    <div className="min-h-screen flex flex-col bg-white select-text">
      <Navbar currentPath={currentPath} onNavigate={handleNavigate} />

      <main className="flex-1">
        {activePage ? (
          <div>
            {activePage.sections.map((section: any) => (
              <SectionRenderer key={section.id} section={section} onNavigate={handleNavigate} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <h2 className="text-2xl font-bold mb-2">404 - Page Not Found</h2>
            <p className="text-sm text-slate-500 mb-6">The requested page does not exist.</p>
            <button
              onClick={() => handleNavigate('/')}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm"
            >
              Back to Home
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
`
    );

    // 12. README.md
    zip.file(
      'README.md',
      `# ${doc.title}

> Generated with [SiteForge AI](https://siteforge.live) — Production-ready React + Vite application.

## Overview

- **Project Title**: ${doc.title}
- **Description**: ${doc.description}
- **Category**: ${doc.category}
- **Theme**: Primary (${doc.theme.primaryColor}), Font (${doc.theme.fontFamily})
- **Pages**: ${doc.pages.map((p) => `${p.name} (\`${p.path}\`)`).join(', ')}

## Prerequisites

- [Node.js](https://nodejs.org) >= 18.0.0
- npm or pnpm or bun

## Getting Started

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Start the local development server**:
   \`\`\`bash
   npm run dev
   \`\`\`
   Open your browser at the displayed local URL (usually \`http://localhost:5173\`).

3. **Build for production**:
   \`\`\`bash
   npm run build
   \`\`\`
   The production-optimized static assets will be output in the \`dist/\` directory.

4. **Preview the production build**:
   \`\`\`bash
   npm run preview
   \`\`\`

## Customization

- **Website Data & Content**: Edit \`src/data/websiteData.ts\` to modify copy, sections, navigation, and theme colors.
- **Section Components**: Customize individual section layouts in \`src/components/SectionRenderer.tsx\`.
- **Global Styles & Fonts**: Review \`src/index.css\` and \`index.html\`.
`
    );
  }

  // ==========================================================================
  // Option B: Static Multi-Page HTML Website Generation
  // ==========================================================================

  private static async generateStaticHtmlProject(
    zip: JSZip,
    doc: WebsiteDocument,
    projectName: string
  ): Promise<void> {
    const fontCss = getFontFamilyCss(doc.theme.fontFamily);
    const fontGoogleQuery = (doc.theme.fontFamily || 'Plus Jakarta Sans').replace(/\s+/g, '+');

    // Generate each page in doc.pages
    for (const page of doc.pages) {
      const isHome = page.path === '/' || page.path === '';
      const pageFileName = sanitizePageFileName(page.path, isHome);
      const htmlContent = this.renderStaticHtmlPage(doc, page, isHome, fontGoogleQuery, fontCss);
      zip.file(pageFileName, htmlContent);
    }

    // Also add a clean 404.html
    zip.file(
      '404.html',
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Page Not Found | ${escapeHtml(doc.title)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 min-h-screen flex items-center justify-center text-center p-4">
  <div>
    <h1 class="text-6xl font-black text-slate-800 mb-2">404</h1>
    <h2 class="text-xl font-bold text-slate-700 mb-2">Page Not Found</h2>
    <p class="text-sm text-slate-500 mb-6">The page you were looking for does not exist.</p>
    <a href="index.html" class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
      Return Home
    </a>
  </div>
</body>
</html>
`
    );

    // Static README
    zip.file(
      'README.md',
      `# ${doc.title} — Static Website Package

> Generated with [SiteForge AI](https://siteforge.live)

## Overview

This is a complete, self-contained multi-page static website.
It has **zero build dependencies** and can be run immediately!

- **Homepage**: \`index.html\`
- **Pages**: ${doc.pages.map((p) => p.name).join(', ')}

## How to Run

### Option 1: Direct Browser
Simply double-click \`index.html\` to open the website directly in any web browser.

### Option 2: Local Server
You can run a local web server using Python or npx:
\`\`\`bash
# Python 3
python -m http.server 8080

# Or using npx
npx serve
\`\`\`
Then visit \`http://localhost:8080\`.

## Deploying

This static package is ready to deploy to any static host:
- **GitHub Pages**: Upload repository files and enable Pages in settings.
- **Netlify**: Drag and drop this folder directly into the Netlify dashboard.
- **Vercel**: Deploy using \`vercel deploy\`.
- **Cloudflare Pages**: Link repo and select static output.
`
    );
  }

  /**
   * Helper to render a complete standalone HTML page
   */
  private static renderStaticHtmlPage(
    doc: WebsiteDocument,
    page: WebsitePage,
    isHome: boolean,
    fontGoogleQuery: string,
    fontCss: string
  ): string {
    const theme = doc.theme;
    const isDark = theme.mode === 'dark';

    // Construct nav links
    const navLinks = doc.pages.map((p) => {
      const href = p.path === '/' ? 'index.html' : `${p.path.replace(/^\//, '').replace(/\//g, '-')}.html`;
      const isActive = p.id === page.id;
      return `<a href="${href}" class="text-sm font-medium ${isActive ? 'font-bold underline' : 'opacity-80 hover:opacity-100'}" style="color: ${theme.textColor}">${escapeHtml(p.name)}</a>`;
    });

    const mobileNavLinks = doc.pages.map((p) => {
      const href = p.path === '/' ? 'index.html' : `${p.path.replace(/^\//, '').replace(/\//g, '-')}.html`;
      return `<a href="${href}" class="block py-2 text-sm font-semibold" style="color: ${theme.textColor}">${escapeHtml(p.name)}</a>`;
    });

    // Render section bodies
    const renderedSections = page.sections
      .map((sec) => this.renderStaticSection(sec, doc))
      .join('\n\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(page.seo?.title || page.name + ' | ' + doc.title)}</title>
  <meta name="description" content="${escapeHtml(page.seo?.description || doc.description)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${fontGoogleQuery}:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      --color-primary: ${theme.primaryColor};
      --color-secondary: ${theme.secondaryColor};
      --color-bg: ${theme.backgroundColor};
      --color-surface: ${theme.surfaceColor};
      --color-text: ${theme.textColor};
      --color-muted: ${theme.mutedTextColor};
      font-family: ${fontCss};
    }
    body {
      background-color: var(--color-bg);
      color: var(--color-text);
      overflow-x: hidden;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col select-text">

  <!-- Header & Navigation -->
  <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <a href="index.html" class="font-extrabold text-lg tracking-tight" style="color: ${theme.textColor}">
        ${escapeHtml(doc.navigation?.brandName || doc.navigation?.logoText || doc.title)}
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-6">
        ${navLinks.join('\n        ')}
      </nav>

      <!-- Desktop CTA -->
      <div class="hidden md:block">
        <a href="#contact" class="px-4 py-2 text-sm font-semibold rounded-xl text-white shadow-sm hover:opacity-95" style="background-color: ${theme.primaryColor}">
          ${escapeHtml(doc.navigation?.primaryCta?.label || (doc.navigation as any)?.ctaButton?.label || 'Get Started')}
        </a>
      </div>

      <!-- Mobile Menu Button -->
      <button onclick="document.getElementById('mobile-menu').classList.toggle('hidden')" class="md:hidden p-2 rounded-lg text-slate-700" aria-label="Menu">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>

    <!-- Mobile Drawer -->
    <div id="mobile-menu" class="hidden md:hidden px-4 py-3 bg-white border-b border-slate-200 space-y-2">
      ${mobileNavLinks.join('\n      ')}
      <div class="pt-2">
        <a href="#contact" class="block text-center py-2 text-sm font-semibold rounded-xl text-white" style="background-color: ${theme.primaryColor}">
          ${escapeHtml(doc.navigation?.primaryCta?.label || (doc.navigation as any)?.ctaButton?.label || 'Get Started')}
        </a>
      </div>
    </div>
  </header>

  <!-- Page Content -->
  <main class="flex-1">
    ${renderedSections}
  </main>

  <!-- Footer -->
  <footer class="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200" style="background-color: ${theme.surfaceColor}">
    <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style="color: ${theme.mutedTextColor}">
      <div>
        <span class="font-bold text-sm mr-2" style="color: ${theme.textColor}">${escapeHtml(doc.title)}</span>
        <span>© ${new Date().getFullYear()} All rights reserved.</span>
      </div>
      <div class="flex items-center gap-6">
        <a href="index.html" class="hover:underline">Home</a>
        <a href="#contact" class="hover:underline">Contact</a>
      </div>
    </div>
  </footer>

</body>
</html>
`;
  }

  /**
   * Helper to render static HTML for individual section types
   */
  private static renderStaticSection(sec: WebsiteSection, doc: WebsiteDocument): string {
    if (sec.isVisible === false) return '';
    const content = (sec.content || {}) as Record<string, any>;
    const theme = doc.theme;

    switch (sec.type) {
      case 'hero':
        return `
    <section id="${escapeHtml(sec.id)}" class="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
      <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6" style="color: ${theme.textColor}">
        ${escapeHtml(content.heading || doc.title)}
      </h1>
      <p class="text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed" style="color: ${theme.mutedTextColor}">
        ${escapeHtml(content.supportingText || content.description || doc.description)}
      </p>
      ${
        content.primaryCta || content.buttonText
          ? `<a href="${sanitizeUrl(content.primaryCta?.href || content.buttonLink || '#contact')}" class="inline-block px-6 py-3.5 text-base font-semibold rounded-xl text-white shadow-md hover:scale-105 transition-transform" style="background-color: ${theme.primaryColor}">
              ${escapeHtml(content.primaryCta?.label || content.buttonText || 'Get Started')}
             </a>`
          : ''
      }
    </section>`;

      case 'features':
        const feats = content.features || content.items || [];
        return `
    <section id="${escapeHtml(sec.id)}" class="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold tracking-tight mb-3" style="color: ${theme.textColor}">
          ${escapeHtml(content.heading || 'Features')}
        </h2>
        <p class="text-base max-w-2xl mx-auto" style="color: ${theme.mutedTextColor}">
          ${escapeHtml(content.subheading || 'Everything you need to succeed')}
        </p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${feats
          .map(
            (f: any) => `
          <div class="p-6 rounded-2xl border border-slate-200/80 shadow-xs" style="background-color: ${theme.surfaceColor}">
            <h3 class="font-bold text-lg mb-2" style="color: ${theme.textColor}">${escapeHtml(f.title)}</h3>
            <p class="text-sm leading-relaxed" style="color: ${theme.mutedTextColor}">${escapeHtml(f.description)}</p>
          </div>`
          )
          .join('\n        ')}
      </div>
    </section>`;

      case 'testimonials':
        const tests = content.testimonials || [];
        return `
    <section id="${escapeHtml(sec.id)}" class="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold tracking-tight mb-3" style="color: ${theme.textColor}">
          ${escapeHtml(content.heading || 'Testimonials')}
        </h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${tests
          .map(
            (t: any) => `
          <div class="p-6 rounded-2xl border border-slate-200 shadow-xs" style="background-color: ${theme.surfaceColor}">
            <p class="italic text-sm mb-4 leading-relaxed" style="color: ${theme.textColor}">"${escapeHtml(t.quote)}"</p>
            <span class="font-bold text-sm block" style="color: ${theme.textColor}">${escapeHtml(t.author)}</span>
            <span class="text-xs" style="color: ${theme.mutedTextColor}">${escapeHtml(t.role || t.company || '')}</span>
          </div>`
          )
          .join('\n        ')}
      </div>
    </section>`;

      case 'faq':
        const faqs = content.items || content.faqs || [];
        return `
    <section id="${escapeHtml(sec.id)}" class="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold tracking-tight text-center mb-8" style="color: ${theme.textColor}">
        ${escapeHtml(content.heading || 'Frequently Asked Questions')}
      </h2>
      <div class="space-y-4">
        ${faqs
          .map(
            (item: any) => `
        <details class="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs group">
          <summary class="font-semibold text-sm cursor-pointer list-none flex justify-between items-center" style="color: ${theme.textColor}">
            <span>${escapeHtml(item.question)}</span>
            <span class="text-slate-400">▼</span>
          </summary>
          <p class="mt-3 text-sm leading-relaxed" style="color: ${theme.mutedTextColor}">${escapeHtml(item.answer)}</p>
        </details>`
          )
          .join('\n        ')}
      </div>
    </section>`;

      case 'contact':
        return `
    <section id="${escapeHtml(sec.id)}" class="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold tracking-tight mb-2" style="color: ${theme.textColor}">
          ${escapeHtml(content.heading || 'Get in Touch')}
        </h2>
        <p class="text-sm" style="color: ${theme.mutedTextColor}">${escapeHtml(content.subheading || '')}</p>
      </div>
      <form onsubmit="event.preventDefault(); alert('Message sent!');" class="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
        <div>
          <label class="block text-xs font-semibold mb-1" style="color: ${theme.textColor}">Name</label>
          <input type="text" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Your Name">
        </div>
        <div>
          <label class="block text-xs font-semibold mb-1" style="color: ${theme.textColor}">Email</label>
          <input type="email" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="you@domain.com">
        </div>
        <div>
          <label class="block text-xs font-semibold mb-1" style="color: ${theme.textColor}">Message</label>
          <textarea rows="4" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Your message..."></textarea>
        </div>
        <button type="submit" class="w-full py-2.5 rounded-xl font-semibold text-sm text-white" style="background-color: ${theme.primaryColor}">
          Send Message
        </button>
      </form>
    </section>`;

      default:
        return `
    <section id="${escapeHtml(sec.id)}" class="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      ${content.heading ? `<h2 class="text-2xl font-bold mb-3" style="color: ${theme.textColor}">${escapeHtml(content.heading)}</h2>` : ''}
      ${content.subheading ? `<p class="text-sm" style="color: ${theme.mutedTextColor}">${escapeHtml(content.subheading)}</p>` : ''}
    </section>`;
    }
  }
}
