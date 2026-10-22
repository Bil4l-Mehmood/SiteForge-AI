import React from 'react';
import { WebsitePage } from '../../types/schema';
import { ThemeStyles } from './themeUtils';
import { SectionRenderer } from './SectionRenderer';
import { LayoutTemplate } from 'lucide-react';

interface PageRendererProps {
  page: WebsitePage;
  themeStyles: ThemeStyles;
  onNavigate: (pathOrAnchor: string) => void;
}

export const PageRenderer: React.FC<PageRendererProps> = ({
  page,
  themeStyles,
  onNavigate,
}) => {
  if (!page || !Array.isArray(page.sections) || page.sections.length === 0) {
    return (
      <div className="py-24 px-4 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <LayoutTemplate className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold mb-1" style={{ color: themeStyles.colors.text }}>
          Empty Page
        </h3>
        <p className="text-xs" style={{ color: themeStyles.colors.muted }}>
          This page does not have any sections defined yet.
        </p>
      </div>
    );
  }

  return (
    <main className="w-full min-h-[500px]">
      {page.sections.map((section, sIdx) => (
        <SectionRenderer
          key={section.id || `sec_${sIdx}`}
          section={section}
          themeStyles={themeStyles}
          onNavigate={onNavigate}
        />
      ))}
    </main>
  );
};
