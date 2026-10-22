import React from 'react';
import { WebsiteSection } from '../../../types/schema';
import { ThemeStyles } from '../themeUtils';

interface TeamSectionProps {
  section: WebsiteSection;
  themeStyles: ThemeStyles;
}

export const TeamSection: React.FC<TeamSectionProps> = ({
  section,
  themeStyles,
}) => {
  const content = (section.content || {}) as Record<string, any>;
  const heading = content.heading || 'Meet Our Team';
  const description = content.description || 'The dedicated minds driving our mission.';
  const members = Array.isArray(content.members) ? content.members : [];

  return (
    <section
      id={section.id}
      data-section-type="team"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {members.map((member: any, idx: number) => {
            const initials = member.name
              ? member.name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()
              : 'TM';

            return (
              <div
                key={member.id || idx}
                className={`${themeStyles.cardClass} p-6 text-center shadow-xs hover:shadow-md transition-all`}
                style={themeStyles.cardStyle}
              >
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-lg shadow-inner select-none"
                  style={{
                    backgroundColor: `${themeStyles.colors.primary}20`,
                    color: themeStyles.colors.primary,
                  }}
                >
                  {initials}
                </div>

                <h3
                  className="text-base font-bold mb-1"
                  style={{ color: themeStyles.colors.text }}
                >
                  {member.name}
                </h3>

                <span
                  className="text-xs font-semibold block mb-3"
                  style={{ color: themeStyles.colors.primary }}
                >
                  {member.role}
                </span>

                {member.bio && (
                  <p
                    className="text-xs leading-relaxed line-clamp-3"
                    style={{ color: themeStyles.colors.muted }}
                  >
                    {member.bio}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
