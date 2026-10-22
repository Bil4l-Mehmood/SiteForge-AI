import React, { useState } from 'react';
import { WebsiteSection } from '../../../types/schema';
import { ThemeStyles } from '../themeUtils';
import { SafeImage } from '../common/SafeImage';

interface GallerySectionProps {
  section: WebsiteSection;
  themeStyles: ThemeStyles;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  section,
  themeStyles,
}) => {
  const content = (section.content || {}) as Record<string, any>;
  const heading = content.heading || 'Work & Visual Showcase';
  const description = content.description || '';
  const items = Array.isArray(content.items) ? content.items : [];

  // Extract unique categories for filter tabs
  const categories = Array.from(
    new Set(items.map((i: any) => i.category).filter(Boolean))
  ) as string[];

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredItems =
    activeCategory === 'all'
      ? items
      : items.filter((item: any) => item.category === activeCategory);

  return (
    <section
      id={section.id}
      data-section-type="gallery"
      className={`${themeStyles.spacingClass} px-4 sm:px-6 lg:px-8 border-t border-slate-100/60`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
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

          {/* Category Tabs */}
          {categories.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item: any, idx: number) => (
            <div
              key={item.id || idx}
              className={`${themeStyles.cardClass} overflow-hidden shadow-xs hover:shadow-md transition-all group`}
              style={themeStyles.cardStyle}
            >
              <div className="relative overflow-hidden">
                <SafeImage
                  src={item.url}
                  alt={item.imageAlt || item.title || 'Showcase Image'}
                  aspectRatio="aspect-4/3"
                />
                {item.category && (
                  <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                )}
              </div>

              {(item.title || item.description) && (
                <div className="p-4">
                  {item.title && (
                    <h3
                      className="text-sm font-bold truncate mb-1"
                      style={{ color: themeStyles.colors.text }}
                    >
                      {item.title}
                    </h3>
                  )}
                  {item.description && (
                    <p
                      className="text-xs line-clamp-2"
                      style={{ color: themeStyles.colors.muted }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
