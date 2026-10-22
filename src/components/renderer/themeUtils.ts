/**
 * Theme Utilities for the Website Rendering Engine
 *
 * Converts canonical GlobalTheme tokens into CSS variables, class mappings,
 * and contrast-safe styles.
 */

import { GlobalTheme } from '../../types/schema';

export interface ThemeStyles {
  containerStyle: React.CSSProperties;
  buttonClass: (variant?: 'primary' | 'secondary' | 'outline') => string;
  buttonInlineStyle: (variant?: 'primary' | 'secondary' | 'outline') => React.CSSProperties;
  radiusClass: string;
  spacingClass: string;
  cardStyle: React.CSSProperties;
  cardClass: string;
  isDark: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
  };
}

/**
 * Calculates whether a hex color is light or dark to guarantee high-contrast text.
 */
export function isLightColor(hex: string): boolean {
  if (!hex || typeof hex !== 'string') return true;
  const clean = hex.replace('#', '');
  const r = parseInt(clean.length === 3 ? clean[0] + clean[0] : clean.substring(0, 2), 16);
  const g = parseInt(clean.length === 3 ? clean[1] + clean[1] : clean.substring(2, 4), 16);
  const b = parseInt(clean.length === 3 ? clean[2] + clean[2] : clean.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return true;
  // Perceived brightness formula (YIQ)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128;
}

export function getContrastTextColor(bgHex: string): string {
  return isLightColor(bgHex) ? '#0F172A' : '#FFFFFF';
}

/**
 * Maps border radius token to Tailwind class
 */
export function getRadiusClass(radius?: string): string {
  switch (radius) {
    case 'none':
      return 'rounded-none';
    case 'sm':
      return 'rounded-sm';
    case 'lg':
      return 'rounded-2xl';
    case 'full':
      return 'rounded-3xl';
    case 'md':
    default:
      return 'rounded-xl';
  }
}

/**
 * Maps spacing token to vertical section padding
 */
export function getSpacingClass(spacing?: string): string {
  switch (spacing) {
    case 'compact':
      return 'py-8 sm:py-12 lg:py-16';
    case 'spacious':
      return 'py-16 sm:py-24 lg:py-32';
    case 'comfortable':
    default:
      return 'py-12 sm:py-16 lg:py-20';
  }
}

/**
 * Resolves font family to CSS font-family string
 */
export function getFontFamilyCss(font?: string): string {
  switch (font) {
    case 'Outfit':
      return "'Outfit', sans-serif";
    case 'Manrope':
      return "'Manrope', sans-serif";
    case 'Bricolage Grotesque':
      return "'Bricolage Grotesque', sans-serif";
    case 'DM Sans':
      return "'DM Sans', sans-serif";
    case 'Public Sans':
      return "'Public Sans', sans-serif";
    case 'Plus Jakarta Sans':
    default:
      return "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
  }
}

/**
 * Computes complete theme styling context from a WebsiteDocument's GlobalTheme
 */
export function computeThemeStyles(theme?: Partial<GlobalTheme>): ThemeStyles {
  const isDark = theme?.mode === 'dark';

  const primary = theme?.primaryColor || (isDark ? '#38BDF8' : '#2563EB');
  const secondary = theme?.secondaryColor || (isDark ? '#0284C7' : '#1E40AF');
  const background = theme?.backgroundColor || (isDark ? '#0B0F19' : '#FFFFFF');
  const surface = theme?.surfaceColor || (isDark ? '#111827' : '#F8FAFC');
  const text = theme?.textColor || (isDark ? '#F9FAFB' : '#0F172A');
  const muted = theme?.mutedTextColor || (isDark ? '#9CA3AF' : '#64748B');
  const accent = theme?.accentColor || (isDark ? '#818CF8' : '#4F46E5');

  const headingFont = getFontFamilyCss(theme?.headingFont || theme?.fontFamily);
  const bodyFont = getFontFamilyCss(theme?.bodyFont || theme?.fontFamily);
  const radiusClass = getRadiusClass(theme?.borderRadius);
  const spacingClass = getSpacingClass(theme?.spacing);

  const containerStyle: React.CSSProperties = {
    backgroundColor: background,
    color: text,
    fontFamily: bodyFont,
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: surface,
    color: text,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
  };

  const cardClass = `border ${radiusClass} transition-all duration-200`;

  const buttonClass = (variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
    const base = 'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none text-sm px-4 py-2.5';
    let btnRadius = radiusClass;
    if (theme?.buttonStyle === 'pill') btnRadius = 'rounded-full';
    if (theme?.buttonStyle === 'square') btnRadius = 'rounded-none';
    if (theme?.buttonStyle === 'rounded') btnRadius = 'rounded-xl';

    return `${base} ${btnRadius}`;
  };

  const buttonInlineStyle = (variant: 'primary' | 'secondary' | 'outline' = 'primary'): React.CSSProperties => {
    if (variant === 'outline') {
      return {
        backgroundColor: 'transparent',
        borderColor: primary,
        borderWidth: '1.5px',
        borderStyle: 'solid',
        color: primary,
      };
    }

    if (variant === 'secondary') {
      return {
        backgroundColor: surface,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
        borderWidth: '1px',
        borderStyle: 'solid',
        color: text,
      };
    }

    // Primary
    return {
      backgroundColor: primary,
      color: getContrastTextColor(primary),
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    };
  };

  return {
    containerStyle,
    buttonClass,
    buttonInlineStyle,
    radiusClass,
    spacingClass,
    cardStyle,
    cardClass,
    isDark,
    colors: {
      primary,
      secondary,
      background,
      surface,
      text,
      muted,
      accent,
    },
  };
}
