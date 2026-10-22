import React from 'react';
import { WebsiteSection } from '../../types/schema';
import { ThemeStyles } from './themeUtils';
import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { AboutSection } from './sections/AboutSection';
import { ServicesSection } from './sections/ServicesSection';
import { StatisticsSection } from './sections/StatisticsSection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { PricingSection } from './sections/PricingSection';
import { GallerySection } from './sections/GallerySection';
import { TeamSection } from './sections/TeamSection';
import { ProcessSection } from './sections/ProcessSection';
import { FaqSection } from './sections/FaqSection';
import { ContactSection } from './sections/ContactSection';
import { CtaSection } from './sections/CtaSection';
import { FooterSection } from './sections/FooterSection';
import { HeaderSection } from './sections/HeaderSection';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { AlertCircle } from 'lucide-react';

interface SectionRendererProps {
  section: WebsiteSection;
  themeStyles: ThemeStyles;
  onNavigate: (pathOrAnchor: string) => void;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({
  section,
  themeStyles,
  onNavigate,
}) => {
  if (section.isVisible === false) {
    return null;
  }

  const renderSectionContent = () => {
    switch (section.type) {
      case 'hero':
        return <HeroSection section={section} themeStyles={themeStyles} onNavigate={onNavigate} />;
      case 'features':
        return <FeaturesSection section={section} themeStyles={themeStyles} />;
      case 'about':
        return <AboutSection section={section} themeStyles={themeStyles} />;
      case 'services':
        return <ServicesSection section={section} themeStyles={themeStyles} onNavigate={onNavigate} />;
      case 'statistics':
        return <StatisticsSection section={section} themeStyles={themeStyles} />;
      case 'testimonials':
        return <TestimonialsSection section={section} themeStyles={themeStyles} />;
      case 'pricing':
        return <PricingSection section={section} themeStyles={themeStyles} onNavigate={onNavigate} />;
      case 'gallery':
        return <GallerySection section={section} themeStyles={themeStyles} />;
      case 'team':
        return <TeamSection section={section} themeStyles={themeStyles} />;
      case 'process':
        return <ProcessSection section={section} themeStyles={themeStyles} />;
      case 'faq':
        return <FaqSection section={section} themeStyles={themeStyles} />;
      case 'contact':
        return <ContactSection section={section} themeStyles={themeStyles} />;
      case 'cta':
        return <CtaSection section={section} themeStyles={themeStyles} onNavigate={onNavigate} />;
      case 'footer':
        return <FooterSection section={section} themeStyles={themeStyles} onNavigate={onNavigate} />;
      case 'header':
        return <HeaderSection section={section} themeStyles={themeStyles} onNavigate={onNavigate} />;
      default:
        // Graceful fallback for unknown/unsupported section types without crashing
        return (
          <div className="py-8 px-4 max-w-xl mx-auto text-center">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-400" />
              <span>Section type "{(section as any).type}" is in preview mode</span>
            </div>
          </div>
        );
    }
  };

  return (
    <ErrorBoundary
      fallbackTitle={`Error displaying ${section.type || 'section'}`}
      fallbackMessage="This individual section encountered an unexpected render issue. The remainder of your website is functioning normally."
    >
      {renderSectionContent()}
    </ErrorBoundary>
  );
};
