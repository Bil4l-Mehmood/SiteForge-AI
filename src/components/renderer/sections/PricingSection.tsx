import React from 'react';
import { WebsiteSection } from '../../../types/schema';
import { ThemeStyles } from '../themeUtils';
import { SafeButton } from '../common/SafeButton';
import { Check } from 'lucide-react';

interface PricingSectionProps {
  section: WebsiteSection;
  themeStyles: ThemeStyles;
  onNavigate: (pathOrAnchor: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  section,
  themeStyles,
  onNavigate,
}) => {
  const content = (section.content || {}) as Record<string, any>;
  const heading = content.heading || 'Flexible Pricing Plans';
  const description = content.description || 'Choose the right plan tailored to your needs.';
  const disclaimer = content.disclaimer;
  const plans = Array.isArray(content.plans) ? content.plans : [];

  return (
    <section
      id={section.id}
      data-section-type="pricing"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {plans.map((plan: any, idx: number) => {
            const isPopular = Boolean(plan.isPopular);

            return (
              <div
                key={plan.id || idx}
                className={`${themeStyles.cardClass} p-7 flex flex-col justify-between relative shadow-sm transition-all ${
                  isPopular ? 'ring-2 shadow-lg -translate-y-1' : ''
                }`}
                style={{
                  ...themeStyles.cardStyle,
                  borderColor: isPopular ? themeStyles.colors.primary : undefined,
                }}
              >
                {isPopular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs"
                    style={{
                      backgroundColor: themeStyles.colors.primary,
                      color: '#FFFFFF',
                    }}
                  >
                    Most Popular
                  </div>
                )}

                <div>
                  <h3
                    className="text-lg font-bold mb-1"
                    style={{ color: themeStyles.colors.text }}
                  >
                    {plan.name}
                  </h3>
                  {plan.description && (
                    <p
                      className="text-xs mb-4 min-h-[32px]"
                      style={{ color: themeStyles.colors.muted }}
                    >
                      {plan.description}
                    </p>
                  )}

                  <div className="mb-6 flex items-baseline gap-1">
                    <span
                      className="text-3xl sm:text-4xl font-extrabold tracking-tight"
                      style={{ color: themeStyles.colors.text }}
                    >
                      {plan.price}
                    </span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: themeStyles.colors.muted }}
                    >
                      {plan.billingPeriod || '/month'}
                    </span>
                  </div>

                  {Array.isArray(plan.features) && (
                    <ul className="space-y-2.5 mb-8 text-xs sm:text-sm">
                      {plan.features.map((feature: string, fIdx: number) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <Check
                            className="w-4 h-4 shrink-0 mt-0.5"
                            style={{ color: themeStyles.colors.primary }}
                          />
                          <span style={{ color: themeStyles.colors.text }}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <SafeButton
                  label={plan.ctaText || 'Choose Plan'}
                  href="#contact"
                  variant={isPopular ? 'primary' : 'outline'}
                  themeStyles={themeStyles}
                  onNavigate={onNavigate}
                  className="w-full text-center"
                />
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
