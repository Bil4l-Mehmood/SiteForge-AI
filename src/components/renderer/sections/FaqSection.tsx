import React, { useState } from 'react';
import { WebsiteSection } from '../../../types/schema';
import { ThemeStyles } from '../themeUtils';
import { ChevronDown } from 'lucide-react';

interface FaqSectionProps {
  section: WebsiteSection;
  themeStyles: ThemeStyles;
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  section,
  themeStyles,
}) => {
  const content = (section.content || {}) as Record<string, any>;
  const heading = content.heading || 'Frequently Asked Questions';
  const description = content.description || 'Everything you need to know about our services.';
  const items = Array.isArray(content.items) ? content.items : [];

  // Track expanded item indices
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      id={section.id}
      data-section-type="faq"
      className={`${themeStyles.spacingClass} px-4 sm:px-6 lg:px-8 border-t border-slate-100/60`}
    >
      <div className="max-w-4xl mx-auto">
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

        <div className="space-y-3">
          {items.map((item: any, idx: number) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={item.id || idx}
                className={`${themeStyles.cardClass} overflow-hidden shadow-2xs`}
                style={themeStyles.cardStyle}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  aria-expanded={isOpen}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span
                    className="text-sm sm:text-base font-semibold leading-snug"
                    style={{ color: themeStyles.colors.text }}
                  >
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    style={{ color: themeStyles.colors.muted }}
                  />
                </button>

                {isOpen && (
                  <div
                    className="px-5 pb-5 pt-1 text-xs sm:text-sm leading-relaxed border-t border-slate-100/60"
                    style={{ color: themeStyles.colors.muted }}
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
