import React from 'react';
import { WebsiteSection } from '../../../types/schema';
import { ThemeStyles } from '../themeUtils';
import { SafeButton } from '../common/SafeButton';
import { isSafeUrl } from '../../../../server/validator';

interface HeaderSectionProps {
  section: WebsiteSection;
  themeStyles: ThemeStyles;
  onNavigate: (pathOrAnchor: string) => void;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  section,
  themeStyles,
  onNavigate,
}) => {
  const content = (section.content || {}) as Record<string, any>;
  const brandName = content.brandName || 'Brand';
  const tagline = content.tagline;
  const primaryCta = content.primaryCta;
  const links = Array.isArray(content.links) ? content.links : [];

  return (
    <header
      id={section.id}
      data-section-type="header"
      className="py-4 px-4 sm:px-6 lg:px-8 border-b"
      style={{
        backgroundColor: themeStyles.colors.background,
        borderColor: themeStyles.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div>
          <span
            className="text-base sm:text-lg font-bold tracking-tight block"
            style={{ color: themeStyles.colors.text }}
          >
            {brandName}
          </span>
          {tagline && (
            <span className="text-[11px] block" style={{ color: themeStyles.colors.muted }}>
              {tagline}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {links.length > 0 && (
            <nav className="hidden sm:flex items-center gap-3">
              {links.map((link: any, idx: number) => {
                const safeHref = link.href && isSafeUrl(link.href) ? link.href : '#';
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onNavigate(safeHref)}
                    className="text-xs font-medium hover:underline cursor-pointer"
                    style={{ color: themeStyles.colors.muted }}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          )}

          {primaryCta && (
            <SafeButton
              label={primaryCta.label || 'Contact'}
              href={primaryCta.href || '#contact'}
              variant="primary"
              themeStyles={themeStyles}
              onNavigate={onNavigate}
              className="text-xs py-1.5 px-3"
            />
          )}
        </div>
      </div>
    </header>
  );
};
