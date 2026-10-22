import React from 'react';
import {
  Sparkles,
  Layers,
  Shield,
  Zap,
  Star,
  CheckCircle2,
  Rocket,
  Compass,
  Heart,
  Globe,
  Award,
  Clock,
  TrendingUp,
  Cpu,
  BarChart,
  Target,
  Smile,
  LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  layers: Layers,
  shield: Shield,
  zap: Zap,
  star: Star,
  check: CheckCircle2,
  rocket: Rocket,
  compass: Compass,
  heart: Heart,
  globe: Globe,
  award: Award,
  clock: Clock,
  trending: TrendingUp,
  cpu: Cpu,
  barchart: BarChart,
  target: Target,
  smile: Smile,
};

export function getSectionIcon(name?: string): LucideIcon {
  if (!name || typeof name !== 'string') return CheckCircle2;
  const normalized = name.toLowerCase().replace(/[^a-z]/g, '');
  return ICON_MAP[normalized] || CheckCircle2;
}
