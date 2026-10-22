/**
 * Curated Premium Theme Presets Engine
 *
 * Implements Option 2: Professional design system palettes crafted for distinct
 * industry verticals with harmonious color palettes, font pairings, and radius geometry.
 */

import { WebsiteTheme, FontPreset } from '../types/schema';

export interface ThemePresetOption {
  id: string;
  name: string;
  tagline: string;
  category: 'Modern' | 'Luxury' | 'Tech' | 'Corporate' | 'Organic' | 'Vibrant';
  theme: WebsiteTheme;
  previewColors: string[];
}

export const CURATED_THEME_PRESETS: ThemePresetOption[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimalist',
    tagline: 'Crisp editorial precision with slate neutrals and subtle border contrast.',
    category: 'Modern',
    theme: {
      primaryColor: '#0F172A',
      secondaryColor: '#334155',
      backgroundColor: '#FFFFFF',
      surfaceColor: '#F8FAFC',
      textColor: '#0F172A',
      mutedColor: '#64748B',
      accentColor: '#3B82F6',
      fontFamily: 'Plus Jakarta Sans',
      borderRadius: 'md',
      spacing: 'normal',
    },
    previewColors: ['#0F172A', '#334155', '#3B82F6', '#F8FAFC'],
  },
  {
    id: 'luxury-editorial',
    name: 'Luxury Editorial',
    tagline: 'Warm ivory surfaces, rich gold accents, and stately serif typography.',
    category: 'Luxury',
    theme: {
      primaryColor: '#1A1816',
      secondaryColor: '#8C7851',
      backgroundColor: '#FAF8F5',
      surfaceColor: '#F2EFE9',
      textColor: '#1A1816',
      mutedColor: '#78716C',
      accentColor: '#D4AF37',
      fontFamily: 'DM Sans',
      borderRadius: 'sm',
      spacing: 'spacious',
    },
    previewColors: ['#1A1816', '#8C7851', '#D4AF37', '#FAF8F5'],
  },
  {
    id: 'tech-cyberpunk',
    name: 'Obsidian Neon Glow',
    tagline: 'High-contrast dark mode with electric cyan and amethyst violet accents.',
    category: 'Tech',
    theme: {
      primaryColor: '#06B6D4',
      secondaryColor: '#8B5CF6',
      backgroundColor: '#090D16',
      surfaceColor: '#111827',
      textColor: '#F9FAFB',
      mutedColor: '#9CA3AF',
      accentColor: '#38BDF8',
      fontFamily: 'Outfit',
      borderRadius: 'lg',
      spacing: 'normal',
    },
    previewColors: ['#090D16', '#06B6D4', '#8B5CF6', '#F9FAFB'],
  },
  {
    id: 'warm-corporate',
    name: 'Enterprise Authority',
    tagline: 'Deep navy, vibrant sapphire accents, and approachable corporate polish.',
    category: 'Corporate',
    theme: {
      primaryColor: '#1E3A8A',
      secondaryColor: '#2563EB',
      backgroundColor: '#FFFFFF',
      surfaceColor: '#F0F9FF',
      textColor: '#0F172A',
      mutedColor: '#475569',
      accentColor: '#0284C7',
      fontFamily: 'Public Sans',
      borderRadius: 'md',
      spacing: 'normal',
    },
    previewColors: ['#1E3A8A', '#2563EB', '#0284C7', '#F0F9FF'],
  },
  {
    id: 'nordic-clean',
    name: 'Nordic Botanical',
    tagline: 'Calming sage green, warm stone, and breathable architectural spacing.',
    category: 'Organic',
    theme: {
      primaryColor: '#14532D',
      secondaryColor: '#15803D',
      backgroundColor: '#F7F6F2',
      surfaceColor: '#ECE9E2',
      textColor: '#1C1917',
      mutedColor: '#57534E',
      accentColor: '#22C55E',
      fontFamily: 'Manrope',
      borderRadius: 'lg',
      spacing: 'spacious',
    },
    previewColors: ['#14532D', '#15803D', '#22C55E', '#F7F6F2'],
  },
  {
    id: 'vibrant-playful',
    name: 'Creative Studio Sunset',
    tagline: 'Dynamic fuchsia gradients, deep violet, and bold high-energy vibes.',
    category: 'Vibrant',
    theme: {
      primaryColor: '#7C3AED',
      secondaryColor: '#DB2777',
      backgroundColor: '#FFFFFF',
      surfaceColor: '#FDF4FF',
      textColor: '#18181B',
      mutedColor: '#71717A',
      accentColor: '#F43F5E',
      fontFamily: 'Bricolage Grotesque',
      borderRadius: 'xl',
      spacing: 'normal',
    },
    previewColors: ['#7C3AED', '#DB2777', '#F43F5E', '#FDF4FF'],
  },
];
