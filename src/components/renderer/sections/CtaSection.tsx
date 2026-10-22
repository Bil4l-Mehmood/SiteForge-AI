import React from 'react';
import { WebsiteSection } from '../../../types/schema';
import { ThemeStyles } from '../themeUtils';
import { SafeButton } from '../common/SafeButton';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CtaSectionProps {
  section: WebsiteSection;
  themeStyles: ThemeStyles;
  onNavigate: (pathOrAnchor: string) => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({
  section,
  themeStyles,
  onNavigate,
}) => {
  const content = (section.content || {}) as Record<string, any>;
  const heading = content.heading || 'Ready to Get Started?';
  const description = content.description || 'Join thousands of satisfied clients today.';
  const buttonText = content.buttonText || 'Contact Us Today';
  const buttonLink = content.buttonLink || '#contact';
  const badge = content.badge;

  return (
    <section
      id={section.id}
      data-section-type="cta"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      <div
        className={`${themeStyles.radiusClass} max-w-5xl mx-auto p-8 sm:p-14 text-center relative overflow-hidden shadow-lg border`}
        style={{
          backgroundColor: themeStyles.isDark ? '#1E293B' : '#0F172A',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Subtle accent glow in background */}
        <div
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ backgroundColor: themeStyles.colors.primary }}
        />

        <div className="relative z-10 max-w-2xl mx-auto">
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-white/10 text-white/90 border border-white/20 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{badge}</span>
            </div>
          )}

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            {heading}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
            {description}
          </p>

          <SafeButton
            label={buttonText}
            href={buttonLink}
            variant="primary"
            themeStyles={themeStyles}
            onNavigate={onNavigate}
            icon={<ArrowRight className="w-4 h-4" />}
            className="text-base px-6 py-3"
          />
        </div>
      </div>
    </section>
  );
};
