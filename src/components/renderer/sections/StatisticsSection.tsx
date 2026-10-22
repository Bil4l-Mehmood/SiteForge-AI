import React from 'react';
import { WebsiteSection } from '../../../types/schema';
import { ThemeStyles } from '../themeUtils';

interface StatisticsSectionProps {
  section: WebsiteSection;
  themeStyles: ThemeStyles;
}

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({
  section,
  themeStyles,
}) => {
  const content = (section.content || {}) as Record<string, any>;
  const heading = content.heading;
  const description = content.description;
  const items = Array.isArray(content.items) ? content.items : [];

  return (
    <section
      id={section.id}
      data-section-type="statistics"
      className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-100/60"
      style={{ backgroundColor: `${themeStyles.colors.surface}80` }}
    >
      <div className="max-w-6xl mx-auto">
        {(heading || description) && (
          <div className="text-center max-w-xl mx-auto mb-10">
            {heading && (
              <h2 className="text-xl sm:text-3xl font-bold mb-2 tracking-tight" style={{ color: themeStyles.colors.text }}>
                {heading}
              </h2>
            )}
            {description && (
              <p className="text-xs sm:text-sm" style={{ color: themeStyles.colors.muted }}>
                {description}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          {items.map((stat: any, idx: number) => (
            <div key={stat.id || idx} className="p-4">
              <div
                className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-1"
                style={{ color: themeStyles.colors.primary }}
              >
                {stat.value}
              </div>

              <div
                className="text-xs sm:text-sm font-semibold tracking-wide"
                style={{ color: themeStyles.colors.text }}
              >
                {stat.label}
              </div>

              {stat.description && (
                <div
                  className="text-[11px] mt-1 leading-snug"
                  style={{ color: themeStyles.colors.muted }}
                >
                  {stat.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
