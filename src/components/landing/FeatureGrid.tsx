import React from 'react';
import { Sparkles, Palette, Layers, Inbox, Download, ShieldCheck } from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  const features = [
    {
      number: '01',
      icon: Sparkles,
      title: 'Reliable AI Generation',
      badge: 'Active & Verified',
      category: 'Core AI',
      description:
        'Harnesses Gemini 3.8 Flash with automatic exponential backoff, jitter, and seamless fallback to Gemini 3.1 Flash-Lite during demand spikes.',
    },
    {
      number: '02',
      icon: Palette,
      title: 'Curated Design Systems',
      badge: 'Option 2 Active',
      category: 'Design Engine',
      description:
        'Switch between 6 curated luxury, tech, and corporate palettes (Minimalist, Editorial, Obsidian Dark, Enterprise, Nordic, Sunset) in 1 click.',
    },
    {
      number: '03',
      icon: Layers,
      title: 'Visual Outline & Dynamic CMS',
      badge: 'Option 3 Active',
      category: 'Content Controls',
      description:
        'Reorder, duplicate, delete, and insert new sections on any page with an intuitive visual outline and direct point-and-click text editing.',
    },
    {
      number: '04',
      icon: Inbox,
      title: 'Enterprise Lead Capture',
      badge: 'Option 4 Active',
      category: 'Commercialization',
      description:
        'Live contact forms capture real visitor queries into a dedicated leads dashboard with status filtering, email replies, and CSV export.',
    },
  ];

  return (
    <section className="py-16 md:py-24 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
            Production Platform Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
            Enterprise Website Architecture & Design Controls
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            SiteForge AI establishes distinct architectural subsystems so prompt generation, live
            simulation, theme customization, and client-lead workflows operate harmoniously.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.number}
                className="p-6 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-200 transition-all shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono">
                      {feat.badge}
                    </span>
                  </div>

                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    {feat.category}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {feat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Architecture</span>
                  <span className="text-slate-700 font-semibold">Ready</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
