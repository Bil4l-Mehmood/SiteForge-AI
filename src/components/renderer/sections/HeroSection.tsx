import React from 'react';
import { WebsiteSection } from '../../../types/schema';
import { ThemeStyles } from '../themeUtils';
import { SafeButton } from '../common/SafeButton';
import { SafeImage } from '../common/SafeImage';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  section: WebsiteSection;
  themeStyles: ThemeStyles;
  onNavigate: (pathOrAnchor: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  section,
  themeStyles,
  onNavigate,
}) => {
  const content = (section.content || {}) as Record<string, any>;
  const heading = content.heading || 'Craft Extraordinary Experiences';
  const supportingText = content.supportingText || content.description || '';
  const primaryCta = content.primaryCta || (content.buttonText ? { label: content.buttonText, href: content.buttonLink || '#contact' } : undefined);
  const secondaryCta = content.secondaryCta;
  const imageRef = content.imageReference;
  const alignment = content.alignment === 'center' ? 'center' : 'left';
  const isCentered = alignment === 'center' || section.layout === 'centered';

  return (
    <section
      id={section.id}
      data-section-type="hero"
      className={`${themeStyles.spacingClass} px-4 sm:px-6 lg:px-8 relative overflow-hidden`}
    >
      <div className="max-w-6xl mx-auto">
        <div
          className={`flex flex-col ${
            isCentered ? 'items-center text-center' : 'lg:flex-row lg:items-center lg:justify-between gap-12'
          }`}
        >
          {/* Text Content Column */}
          <div className={isCentered ? 'max-w-3xl' : 'max-w-xl shrink-0'}>
            {/* Optional badge */}
            {imageRef?.badge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-indigo-50 border border-indigo-200 text-indigo-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{imageRef.badge}</span>
              </div>
            )}

            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] mb-5"
              style={{ color: themeStyles.colors.text }}
            >
              {heading}
            </h1>

            {supportingText && (
              <p
                className="text-base sm:text-lg leading-relaxed mb-8"
                style={{ color: themeStyles.colors.muted }}
              >
                {supportingText}
              </p>
            )}

            {/* Actions */}
            {(primaryCta || secondaryCta) && (
              <div
                className={`flex flex-wrap items-center gap-3 ${
                  isCentered ? 'justify-center' : 'justify-start'
                }`}
              >
                {primaryCta && (
                  <SafeButton
                    label={primaryCta.label || 'Get Started'}
                    href={primaryCta.href || '#contact'}
                    variant="primary"
                    themeStyles={themeStyles}
                    onNavigate={onNavigate}
                    icon={<ArrowRight className="w-4 h-4" />}
                  />
                )}
                {secondaryCta && (
                  <SafeButton
                    label={secondaryCta.label || 'Learn More'}
                    href={secondaryCta.href || '#features'}
                    variant="outline"
                    themeStyles={themeStyles}
                    onNavigate={onNavigate}
                  />
                )}
              </div>
            )}
          </div>

          {/* Visual Artwork / Hero Image Column */}
          {(!isCentered || imageRef?.url) && (
            <div className={`mt-8 lg:mt-0 w-full ${isCentered ? 'max-w-3xl mt-12' : 'max-w-lg'}`}>
              <div
                className="p-2 sm:p-3 rounded-2xl border shadow-lg"
                style={{
                  backgroundColor: themeStyles.colors.surface,
                  borderColor: themeStyles.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                }}
              >
                <SafeImage
                  src={imageRef?.url}
                  alt={imageRef?.alt || heading}
                  aspectRatio="aspect-16/10"
                  className="rounded-xl"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
