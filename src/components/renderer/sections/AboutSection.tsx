import React from 'react';
import { WebsiteSection } from '../../../types/schema';
import { ThemeStyles } from '../themeUtils';
import { Check, Target, Compass } from 'lucide-react';

interface AboutSectionProps {
  section: WebsiteSection;
  themeStyles: ThemeStyles;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  section,
  themeStyles,
}) => {
  const content = (section.content || {}) as Record<string, any>;
  const heading = content.heading || 'About Us';
  const story = content.story || content.description || '';
  const mission = content.mission;
  const vision = content.vision;
  const highlights = Array.isArray(content.highlights) ? content.highlights : [];

  return (
    <section
      id={section.id}
      data-section-type="about"
      className={`${themeStyles.spacingClass} px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Main Story Column */}
          <div className="lg:col-span-7">
            <span
              className="text-xs font-bold uppercase tracking-wider mb-2 block"
              style={{ color: themeStyles.colors.primary }}
            >
              Our Journey
            </span>
            <h2
              className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight"
              style={{ color: themeStyles.colors.text }}
            >
              {heading}
            </h2>

            <div
              className="text-sm sm:text-base leading-relaxed space-y-4 mb-8"
              style={{ color: themeStyles.colors.muted }}
            >
              <p>{story}</p>
            </div>

            {/* Highlights List */}
            {highlights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {highlights.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${themeStyles.colors.primary}20`,
                        color: themeStyles.colors.primary,
                      }}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span style={{ color: themeStyles.colors.text }}>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mission & Vision Cards Column */}
          <div className="lg:col-span-5 space-y-4">
            {mission && (
              <div
                className={`${themeStyles.cardClass} p-6 shadow-xs`}
                style={themeStyles.cardStyle}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4" style={{ color: themeStyles.colors.primary }} />
                  <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: themeStyles.colors.text }}>
                    Our Mission
                  </h3>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: themeStyles.colors.muted }}>
                  {mission}
                </p>
              </div>
            )}

            {vision && (
              <div
                className={`${themeStyles.cardClass} p-6 shadow-xs`}
                style={themeStyles.cardStyle}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Compass className="w-4 h-4" style={{ color: themeStyles.colors.primary }} />
                  <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: themeStyles.colors.text }}>
                    Our Vision
                  </h3>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: themeStyles.colors.muted }}>
                  {vision}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
