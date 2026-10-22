import React, { useState, useEffect } from 'react';
import { WebsiteDocument, WebsitePage } from '../../types/schema';
import { validateWebsiteDocument } from '../../../server/validator';
import { computeThemeStyles } from './themeUtils';
import { RenderedNavbar } from './common/RenderedNavbar';
import { PageRenderer } from './PageRenderer';
import { FooterSection } from './sections/FooterSection';
import { AlertTriangle, Home, FileQuestion } from 'lucide-react';

export interface WebsiteRendererProps {
  document: WebsiteDocument;
  onPageChange?: (path: string) => void;
  initialPath?: string;
  className?: string;
}

export const WebsiteRenderer: React.FC<WebsiteRendererProps> = ({
  document: rawDoc,
  onPageChange,
  initialPath = '/',
  className = '',
}) => {
  // Validate incoming document
  const validationOutcome = validateWebsiteDocument(rawDoc);

  const [activePath, setActivePath] = useState<string>(initialPath);

  // Sync when initialPath changes
  useEffect(() => {
    if (initialPath) {
      setActivePath(initialPath);
    }
  }, [initialPath]);

  // If validation failed, display clear error UI
  if (!validationOutcome.valid) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 min-h-[400px]">
        <div className="max-w-md w-full bg-white border border-rose-200 rounded-xl p-6 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1.5">
            Unable to Render Website
          </h3>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            The website specification could not be validated against the canonical schema:
          </p>
          <div className="bg-rose-50/60 border border-rose-100 rounded-lg p-3 text-[11px] font-mono text-rose-800 text-left overflow-x-auto mb-4">
            {validationOutcome.error}
          </div>
          <p className="text-[11px] text-slate-400">
            Please submit a revised prompt in the chat panel to regenerate a valid specification.
          </p>
        </div>
      </div>
    );
  }

  const doc = validationOutcome.document;
  const themeStyles = computeThemeStyles(doc.theme);

  // Find active page matching current activePath
  const activePage: WebsitePage | undefined = doc.pages.find(
    (p) => p.path.toLowerCase() === activePath.toLowerCase()
  ) || (activePath === '/' ? doc.pages[0] : undefined);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleNavigate = (pathOrAnchor: string) => {
    if (!pathOrAnchor) return;

    if (pathOrAnchor.startsWith('#')) {
      const targetId = pathOrAnchor.replace('#', '');
      const docContext = containerRef.current?.ownerDocument || document;
      const el = docContext.getElementById(targetId) || docContext.querySelector(`[data-section-type="${targetId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      // If not on current page, switch to Home and scroll
      if (activePath !== '/') {
        setActivePath('/');
        onPageChange?.('/');
        setTimeout(() => {
          const homeDoc = containerRef.current?.ownerDocument || document;
          const homeEl = homeDoc.getElementById(targetId) || homeDoc.querySelector(`[data-section-type="${targetId}"]`);
          homeEl?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
      return;
    }

    if (pathOrAnchor.startsWith('/')) {
      setActivePath(pathOrAnchor);
      onPageChange?.(pathOrAnchor);
    }
  };

  // Check if page already includes a header or footer section
  const hasPageHeader = activePage?.sections.some(
    (s) => s.type === 'header' && s.isVisible !== false
  );
  const hasPageFooter = activePage?.sections.some(
    (s) => s.type === 'footer' && s.isVisible !== false
  );

  return (
    <div
      ref={containerRef}
      className={`w-full flex-1 flex flex-col relative select-text overflow-x-hidden ${className}`}
      style={themeStyles.containerStyle}
    >
      {/* Top Rendered Navbar (if no explicit header section on the active page) */}
      {!hasPageHeader && (
        <RenderedNavbar
          navigation={doc.navigation}
          pages={doc.pages}
          activePagePath={activePath}
          themeStyles={themeStyles}
          onNavigate={handleNavigate}
          siteTitle={doc.title}
        />
      )}

      {/* Main Page Content or 404 Route Fallback */}
      {activePage ? (
        <PageRenderer
          page={activePage}
          themeStyles={themeStyles}
          onNavigate={handleNavigate}
        />
      ) : (
        <div className="py-24 px-4 text-center max-w-md mx-auto my-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <FileQuestion className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: themeStyles.colors.text }}>
            Page Not Found
          </h2>
          <p className="text-xs mb-6" style={{ color: themeStyles.colors.muted }}>
            The requested page route <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{activePath}</code> does not exist in this website blueprint.
          </p>
          <button
            type="button"
            onClick={() => handleNavigate('/')}
            className={`inline-flex items-center gap-1.5 ${themeStyles.buttonClass('primary')}`}
            style={themeStyles.buttonInlineStyle('primary')}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </button>
        </div>
      )}

      {/* Auto Footer if active page doesn't define its own footer */}
      {!hasPageFooter && (
        <FooterSection
          section={{
            id: 'auto_footer',
            type: 'footer',
            layout: 'grid',
            isVisible: true,
            content: {
              brandName: doc.navigation?.brandName || doc.title,
              description: doc.description,
              links: doc.pages.map((p) => ({ label: p.name, href: p.path })),
            },
          }}
          themeStyles={themeStyles}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
};
