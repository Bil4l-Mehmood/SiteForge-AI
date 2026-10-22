import React from 'react';
import { Button } from '../common/Button';
import {
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
  Globe2,
  Code2,
  ArrowRight,
  Cpu,
  CheckCircle2,
  Users,
  Award,
  Terminal,
} from 'lucide-react';

interface AboutPageProps {
  onStartBuilding: () => void;
  onNavigateToContact: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onStartBuilding,
  onNavigateToContact,
}) => {
  return (
    <div className="flex-1 bg-white text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-100 bg-linear-to-b from-slate-50/80 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-xs font-semibold text-indigo-700 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Next-Gen Generative Web Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-950 leading-[1.12] mb-6">
              Transforming Ideas into Production-Grade Websites with AI.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal mb-8 max-w-2xl mx-auto">
              SiteForge AI bridges the gap between natural language prompts and clean, clean-code web architectures.
              We synthesize structured schemas, responsive layouts, and zero-dependency React code in seconds.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={onStartBuilding}
              >
                Start Synthesizing Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onNavigateToContact}
              >
                Contact Our Team
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400 font-display">
                99.9%
              </div>
              <div className="text-xs uppercase tracking-wider text-slate-400 mt-1 font-semibold">
                Schema Reliability
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400 font-display">
                &lt; 1.2s
              </div>
              <div className="text-xs uppercase tracking-wider text-slate-400 mt-1 font-semibold">
                Synthesis Latency
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400 font-display">
                15+
              </div>
              <div className="text-xs uppercase tracking-wider text-slate-400 mt-1 font-semibold">
                Section Architectures
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400 font-display">
                100%
              </div>
              <div className="text-xs uppercase tracking-wider text-slate-400 mt-1 font-semibold">
                Vendor Lock-in Free
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Mission & Pillars */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
            Our Architectural Philosophy
          </h2>
          <h3 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
            Engineered for Precision, Not Hallucinations.
          </h3>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Most AI website builders generate unstructured HTML blobs that break on mobile and fail basic accessibility tests.
            SiteForge AI takes an enterprise-first compiler approach.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-sm">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Canonical Schema Contract</h4>
            <p className="text-xs leading-relaxed text-slate-600">
              Every generation adheres to a strict Zod schema contract (`WebsiteDocument`). Theme properties, layout variants, and navigation anchors are validated deterministically before rendering.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-sm">
              <Cpu className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Gemini 3.8 Flash Engine</h4>
            <p className="text-xs leading-relaxed text-slate-600">
              Harnessing Google's cutting-edge Gemini model with bounded exponential backoff, jitter, and automatic failover to Gemini 3.1 Flash-Lite, ensuring uninterrupted availability during global demand spikes.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-sm">
              <Code2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Native React & Vite Export</h4>
            <p className="text-xs leading-relaxed text-slate-600">
              Download your website as a standalone, production-ready React 19 + Vite bundle or clean static HTML/CSS. Host anywhere: Vercel, Netlify, Cloudflare, or your private AWS infrastructure.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Stack Grid */}
      <section className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h3 className="text-2xl font-bold font-display text-slate-900 mb-2">
              Enterprise Technology Stack
            </h3>
            <p className="text-xs text-slate-500">
              Built on battle-tested web standards and high-reliability frameworks.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Google Gemini', desc: 'GenAI SDK 3.8 Flash', tag: 'Core AI' },
              { name: 'React 19', desc: 'Modern UI Engine', tag: 'Frontend' },
              { name: 'TypeScript', desc: 'Strict Schema Typings', tag: 'Language' },
              { name: 'Tailwind CSS', desc: 'Utility Design System', tag: 'Styles' },
              { name: 'Vite 8', desc: 'Next-Gen Bundler', tag: 'Build' },
              { name: 'Zod Validator', desc: 'Runtime Schema Guard', tag: 'Safety' },
            ].map((tech) => (
              <div
                key={tech.name}
                className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-2xs"
              >
                <div className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider mb-1">
                  {tech.tag}
                </div>
                <div className="font-bold text-slate-900 text-sm">{tech.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Leadership / Contact CTA */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-linear-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-display font-bold mb-3">
            Ready to Build Your Next Website?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-8 leading-relaxed">
            Experience the world's most disciplined generative website builder. No coding required, full source code included.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={onStartBuilding}
            >
              Open Builder Workspace
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={onNavigateToContact}
            >
              Contact Sales & Support
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
