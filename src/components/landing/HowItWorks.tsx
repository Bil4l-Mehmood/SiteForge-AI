import React from 'react';
import { PenLine, MonitorPlay, SlidersHorizontal } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '1',
      icon: PenLine,
      title: 'Describe your idea.',
      description:
        'Type your vision into the prompt composer—from industry specifics to custom sections and aesthetic preferences.',
    },
    {
      number: '2',
      icon: MonitorPlay,
      title: 'Generate and preview your website.',
      description:
        'Inspect your website on an interactive multi-device canvas equipped with desktop, tablet, and mobile viewport controls.',
    },
    {
      number: '3',
      icon: SlidersHorizontal,
      title: 'Refine and export your website.',
      description:
        'Request adjustments through conversational follow-ups in the chat panel, then prepare production code for deployment.',
    },
  ];

  return (
    <section className="py-16 md:py-20 border-t border-slate-200 bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center mb-12">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Workflow Overview
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How SiteForge AI Works
          </h2>
          <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
            A three-step approach taking you from an initial concept to a refined website.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
                      <Icon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="text-sm font-mono font-bold text-slate-400">
                      Step {step.number}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
