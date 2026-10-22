import React from 'react';
import { WebsiteSection } from '../../../types/schema';
import { ThemeStyles } from '../themeUtils';

interface ProcessSectionProps {
  section: WebsiteSection;
  themeStyles: ThemeStyles;
}

export const ProcessSection: React.FC<ProcessSectionProps> = ({
  section,
  themeStyles,
}) => {
  const content = (section.content || {}) as Record<string, any>;
  const heading = content.heading || 'How It Works';
  const description = content.description || 'A clear, proven roadmap from start to finish.';
  const steps = Array.isArray(content.steps) ? content.steps : [];

  return (
    <section
      id={section.id}
      data-section-type="process"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step: any, idx: number) => {
            const num = step.stepNumber || idx + 1;
            const padded = num < 10 ? `0${num}` : `${num}`;

            return (
              <div
                key={step.id || idx}
                className={`${themeStyles.cardClass} p-6 sm:p-7 relative shadow-xs flex flex-col justify-between`}
                style={themeStyles.cardStyle}
              >
                <div>
                  <div
                    className="text-2xl sm:text-3xl font-extrabold font-mono mb-4 inline-block px-3 py-1 rounded-lg"
                    style={{
                      backgroundColor: `${themeStyles.colors.primary}15`,
                      color: themeStyles.colors.primary,
                    }}
                  >
                    {padded}
                  </div>

                  <h3
                    className="text-base sm:text-lg font-bold mb-2.5"
                    style={{ color: themeStyles.colors.text }}
                  >
                    {step.title}
                  </h3>

                  <p
                    className="text-xs sm:text-sm leading-relaxed"
                    style={{ color: themeStyles.colors.muted }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
