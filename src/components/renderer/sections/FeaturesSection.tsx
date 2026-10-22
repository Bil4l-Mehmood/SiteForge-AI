import React from 'react';
import { WebsiteSection } from '../../../types/schema';
import { ThemeStyles } from '../themeUtils';
import { getSectionIcon } from '../common/iconHelper';

interface FeaturesSectionProps {
  section: WebsiteSection;
  themeStyles: ThemeStyles;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  section,
  themeStyles,
}) => {
  const content = (section.content || {}) as Record<string, any>;
  const heading = content.heading || 'Features & Capabilities';
  const description = content.description || content.supportingText || '';
  const items = Array.isArray(content.items) ? content.items : [];

  return (
    <section
      id={section.id}
      data-section-type="features"
      className={`${themeStyles.spacingClass} px-4 sm:px-6 lg:px-8 border-t border-slate-100/60`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2
            className="text-2xl sm:text-4xl font-bold tracking-tight mb-4"
            style={{ color: themeStyles.colors.text }}
          >
            {heading}
          </h2>
          {description && (
            <p
              className="text-sm sm:text-base leading-relaxed"
              style={{ color: themeStyles.colors.muted }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {items.map((item: any, idx: number) => {
            const Icon = getSectionIcon(item.icon);
            return (
              <div
                key={item.id || idx}
                className={`${themeStyles.cardClass} p-6 sm:p-7 shadow-xs hover:shadow-md hover:-translate-y-0.5`}
                style={themeStyles.cardStyle}
              >
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center mb-5"
                  style={{
                    backgroundColor: `${themeStyles.colors.primary}15`,
                    color: themeStyles.colors.primary,
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <h3
                  className="text-lg font-bold mb-2 tracking-tight"
                  style={{ color: themeStyles.colors.text }}
                >
                  {item.title}
                </h3>

                <p
                  className="text-xs sm:text-sm leading-relaxed"
                  style={{ color: themeStyles.colors.muted }}
                >
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
