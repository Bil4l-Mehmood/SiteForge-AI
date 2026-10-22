import React from 'react';
import { WebsiteSection } from '../../../types/schema';
import { ThemeStyles } from '../themeUtils';
import { isSafeUrl } from '../../../../server/validator';

interface FooterSectionProps {
  section: WebsiteSection;
  themeStyles: ThemeStyles;
  onNavigate: (pathOrAnchor: string) => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  section,
  themeStyles,
  onNavigate,
}) => {
  const content = (section.content || {}) as Record<string, any>;
  const brandName = content.brandName || 'SiteForge';
  const description = content.description || '';
  const links = Array.isArray(content.links) ? content.links : [];
  const currentYear = new Date().getFullYear();
  const copyrightText = content.copyrightText || `© ${currentYear} ${brandName}. All rights reserved.`;

  return (
    <footer
      id={section.id}
      data-section-type="footer"
      className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t"
      style={{
        backgroundColor: themeStyles.colors.surface,
        borderColor: themeStyles.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 pb-10 border-b border-slate-200/50">
          <div className="max-w-sm">
            <span
              className="text-lg font-bold tracking-tight block mb-2"
              style={{ color: themeStyles.colors.text }}
            >
              {brandName}
            </span>
            {description && (
              <p className="text-xs leading-relaxed" style={{ color: themeStyles.colors.muted }}>
                {description}
              </p>
            )}
          </div>

          {links.length > 0 && (
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {links.map((link: any, idx: number) => {
                const safeHref = link.href && isSafeUrl(link.href) ? link.href : '#';

                const handleClick = (e: React.MouseEvent) => {
                  if (safeHref.startsWith('/') || safeHref.startsWith('#')) {
                    e.preventDefault();
                    onNavigate(safeHref);
                  }
                };

                return (
                  <a
                    key={idx}
                    href={safeHref}
                    onClick={handleClick}
                    className="text-xs font-medium hover:underline transition-colors"
                    style={{ color: themeStyles.colors.muted }}
                    rel={safeHref.startsWith('http') ? 'noopener noreferrer' : undefined}
                    target={safeHref.startsWith('http') ? '_blank' : undefined}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <span>{copyrightText}</span>
          <span className="font-mono text-[10px]">Built with SiteForge AI</span>
        </div>
      </div>
    </footer>
  );
};
