import React, { useState } from 'react';
import { Navigation, WebsitePage } from '../../../types/schema';
import { ThemeStyles } from '../themeUtils';
import { SafeButton } from './SafeButton';
import { Menu, X, Sparkles } from 'lucide-react';

interface RenderedNavbarProps {
  navigation?: Navigation;
  pages: WebsitePage[];
  activePagePath: string;
  themeStyles: ThemeStyles;
  onNavigate: (pathOrAnchor: string) => void;
  siteTitle: string;
}

export const RenderedNavbar: React.FC<RenderedNavbarProps> = ({
  navigation,
  pages,
  activePagePath,
  themeStyles,
  onNavigate,
  siteTitle,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const brandName = navigation?.brandName || siteTitle || 'Website';
  const logoText = navigation?.logoText;

  // Derive nav links: prefer navigation.items, fallback to pages list
  const navItems = navigation?.items && navigation.items.length > 0
    ? navigation.items
    : pages.map((p) => ({
        label: p.name,
        href: p.path,
        isExternal: false,
      }));

  const primaryCta = navigation?.primaryCta || { label: 'Get Started', href: '#contact' };

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    onNavigate(href);
  };

  return (
    <nav
      className="sticky top-0 z-40 backdrop-blur-md border-b transition-colors"
      style={{
        backgroundColor: `${themeStyles.colors.background}EE`,
        borderColor: themeStyles.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <button
          type="button"
          onClick={() => handleLinkClick('/')}
          className="flex items-center gap-2 font-bold text-base sm:text-lg tracking-tight text-left cursor-pointer"
          style={{ color: themeStyles.colors.text }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
            style={{
              backgroundColor: themeStyles.colors.primary,
              color: '#FFFFFF',
            }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span>{brandName}</span>
            {logoText && (
              <span className="text-[10px] block font-normal opacity-70">
                {logoText}
              </span>
            )}
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navItems.map((item, idx) => {
            const isActive = item.href === activePagePath;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleLinkClick(item.href)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'font-bold'
                    : 'hover:opacity-100 opacity-75'
                }`}
                style={{
                  color: isActive ? themeStyles.colors.primary : themeStyles.colors.text,
                  backgroundColor: isActive ? `${themeStyles.colors.primary}12` : 'transparent',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right CTA and Mobile Hamburger */}
        <div className="flex items-center gap-2">
          {primaryCta && (
            <div className="hidden sm:block">
              <SafeButton
                label={primaryCta.label}
                href={primaryCta.href}
                variant="primary"
                themeStyles={themeStyles}
                onNavigate={onNavigate}
                className="text-xs py-2 px-3.5"
              />
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-b px-4 py-4 space-y-2 shadow-lg"
          style={{
            backgroundColor: themeStyles.colors.surface,
            borderColor: themeStyles.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          }}
        >
          {navItems.map((item, idx) => {
            const isActive = item.href === activePagePath;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleLinkClick(item.href)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-between"
                style={{
                  color: isActive ? themeStyles.colors.primary : themeStyles.colors.text,
                  backgroundColor: isActive ? `${themeStyles.colors.primary}15` : 'transparent',
                }}
              >
                <span>{item.label}</span>
                {isActive && <span className="text-[10px] opacity-70">Active</span>}
              </button>
            );
          })}

          {primaryCta && (
            <div className="pt-2">
              <SafeButton
                label={primaryCta.label}
                href={primaryCta.href}
                variant="primary"
                themeStyles={themeStyles}
                onNavigate={onNavigate}
                className="w-full text-center text-xs py-2"
              />
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
