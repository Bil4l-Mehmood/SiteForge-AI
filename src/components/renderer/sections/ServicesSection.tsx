import React from 'react';
import { WebsiteSection } from '../../../types/schema';
import { ThemeStyles } from '../themeUtils';
import { getSectionIcon } from '../common/iconHelper';
import { ArrowUpRight } from 'lucide-react';

interface ServicesSectionProps {
  section: WebsiteSection;
  themeStyles: ThemeStyles;
  onNavigate: (pathOrAnchor: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  section,
  themeStyles,
  onNavigate,
}) => {
  const content = (section.content || {}) as Record<string, any>;
  const heading = content.heading || 'Our Services';
  const description = content.description || content.supportingText || '';
  const items = Array.isArray(content.items) ? content.items : [];

  return (
    <section
      id={section.id}
      data-section-type="services"
      className={`${themeStyles.spacingClass} px-4 sm:px-6 lg:px-8 border-t border-slate-100/60`}
    >
      <div className="max-w-6xl mx-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {items.map((service: any, idx: number) => {
            const Icon = getSectionIcon(service.icon);
            return (
              <div
                key={service.id || idx}
                className={`${themeStyles.cardClass} p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
                style={themeStyles.cardStyle}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `${themeStyles.colors.primary}15`,
                        color: themeStyles.colors.primary,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {service.badge && (
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${themeStyles.colors.primary}15`,
                          color: themeStyles.colors.primary,
                        }}
                      >
                        {service.badge}
                      </span>
                    )}
                  </div>

                  <h3
                    className="text-lg font-bold mb-2 tracking-tight"
                    style={{ color: themeStyles.colors.text }}
                  >
                    {service.title}
                  </h3>

                  <p
                    className="text-xs sm:text-sm leading-relaxed mb-6"
                    style={{ color: themeStyles.colors.muted }}
                  >
                    {service.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('#contact')}
                  className="inline-flex items-center gap-1 text-xs font-semibold hover:underline cursor-pointer self-start"
                  style={{ color: themeStyles.colors.primary }}
                >
                  <span>Inquire Now</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
