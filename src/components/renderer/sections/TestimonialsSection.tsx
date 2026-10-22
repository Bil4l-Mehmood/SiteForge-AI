import React from 'react';
import { WebsiteSection } from '../../../types/schema';
import { ThemeStyles } from '../themeUtils';
import { Quote } from 'lucide-react';

interface TestimonialsSectionProps {
  section: WebsiteSection;
  themeStyles: ThemeStyles;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  section,
  themeStyles,
}) => {
  const content = (section.content || {}) as Record<string, any>;
  const heading = content.heading || 'What People Say';
  const description = content.description || '';
  const disclaimer = content.disclaimer;
  const items = Array.isArray(content.items) ? content.items : [];

  return (
    <section
      id={section.id}
      data-section-type="testimonials"
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
          {items.map((item: any, idx: number) => {
            const initials = item.author
              ? item.author
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()
              : 'U';

            return (
              <div
                key={item.id || idx}
                className={`${themeStyles.cardClass} p-6 sm:p-7 shadow-xs flex flex-col justify-between`}
                style={themeStyles.cardStyle}
              >
                <div>
                  <Quote
                    className="w-7 h-7 mb-4 opacity-30"
                    style={{ color: themeStyles.colors.primary }}
                  />
                  <p
                    className="text-xs sm:text-sm leading-relaxed italic mb-6"
                    style={{ color: themeStyles.colors.text }}
                  >
                    "{item.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100/80">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none"
                    style={{
                      backgroundColor: `${themeStyles.colors.primary}20`,
                      color: themeStyles.colors.primary,
                    }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div
                      className="text-xs sm:text-sm font-bold truncate"
                      style={{ color: themeStyles.colors.text }}
                    >
                      {item.author}
                    </div>
                    {(item.role || item.company) && (
                      <div
                        className="text-[11px] truncate"
                        style={{ color: themeStyles.colors.muted }}
                      >
                        {item.role} {item.company ? `· ${item.company}` : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {disclaimer && (
          <p className="text-[11px] text-center mt-10 font-mono opacity-60">
            ℹ️ {disclaimer}
          </p>
        )}
      </div>
    </section>
  );
};
