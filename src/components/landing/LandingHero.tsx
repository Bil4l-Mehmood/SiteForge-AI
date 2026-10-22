import React, { useState } from 'react';
import { Button } from '../common/Button';
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  User,
  LayoutTemplate,
  ShoppingBag,
  AlertCircle,
  X,
} from 'lucide-react';

interface LandingHeroProps {
  onGenerateWithPrompt: (prompt: string) => void;
  onExploreBuilder: () => void;
}

export interface ExamplePromptItem {
  id: string;
  category: string;
  title: string;
  description: string;
  prompt: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const EXAMPLE_PROMPTS: ExamplePromptItem[] = [
  {
    id: 'business-website',
    category: 'Business',
    title: 'Business Website',
    description: 'Services, company information, and client inquiry form',
    prompt:
      'Create a professional website for a recruitment agency with services, company information, and a contact form.',
    icon: Briefcase,
  },
  {
    id: 'portfolio',
    category: 'Design',
    title: 'Portfolio',
    description: 'Creative project case studies, design skills, and contact',
    prompt:
      'Build a modern portfolio website for a UI/UX designer with projects, skills, and a contact section.',
    icon: User,
  },
  {
    id: 'saas-landing',
    category: 'SaaS',
    title: 'SaaS Landing Page',
    description: 'Hero, feature breakdown, tiered pricing, and testimonials',
    prompt:
      'Create a SaaS landing page with a hero section, product features, pricing cards, and customer testimonials.',
    icon: LayoutTemplate,
  },
  {
    id: 'online-store',
    category: 'E-Commerce',
    title: 'Online Store',
    description: 'Product catalog, category filters, and cart interface',
    prompt:
      'Build a clean ecommerce storefront with product cards, category filters, and a shopping cart interface.',
    icon: ShoppingBag,
  },
];

export const LandingHero: React.FC<LandingHeroProps> = ({
  onGenerateWithPrompt,
  onExploreBuilder,
}) => {
  const [promptText, setPromptText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [activeExampleId, setActiveExampleId] = useState<string | null>(null);

  const isPromptEmpty = !promptText.trim();

  const handleSelectExample = (example: ExamplePromptItem) => {
    setPromptText(example.prompt);
    setActiveExampleId(example.id);
    setValidationError(null);
  };

  const handleClearPrompt = () => {
    setPromptText('');
    setActiveExampleId(null);
    setValidationError(null);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = promptText.trim();
    if (!trimmed) {
      setValidationError('Please describe the website you want to build before generating.');
      return;
    }
    setValidationError(null);
    onGenerateWithPrompt(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section className="pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
      {/* Editorial Kicker */}
      <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500 mb-4">
        <span>SiteForge AI</span>
        <span aria-hidden="true">·</span>
        <span>AI Website Builder</span>
        <span aria-hidden="true">·</span>
        <span>App Shell</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] text-balance max-w-4xl mx-auto">
        Turn Your Ideas Into Websites With AI
      </h1>

      {/* Supporting Copy */}
      <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Describe the website you imagine. SiteForge AI helps transform your ideas into beautiful,
        responsive websites.
      </p>

      {/* Primary Prompt Composer Box */}
      <div className="mt-10 max-w-3xl mx-auto text-left">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/10 transition-all p-3.5 sm:p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="landing-prompt-composer"
              className="text-xs font-semibold text-slate-700 tracking-wide"
            >
              Prompt Composer
            </label>

            {promptText && (
              <button
                type="button"
                onClick={handleClearPrompt}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title="Clear prompt text"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <textarea
            id="landing-prompt-composer"
            rows={4}
            value={promptText}
            onChange={(e) => {
              setPromptText(e.target.value);
              if (validationError) setValidationError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Describe the website you want to build..."
            className="w-full resize-none border-none bg-transparent p-1 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none whitespace-pre-wrap leading-relaxed"
          />

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 border-t border-slate-100 mt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="hidden sm:inline">Press</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono text-slate-600">
                ⌘ Enter
              </kbd>
              <span className="hidden sm:inline">or click generate</span>
              <span className="text-slate-400 font-mono text-[11px]">
                ({promptText.length} chars)
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onExploreBuilder}
                className="text-slate-600 hover:text-slate-900"
              >
                Open Builder
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isPromptEmpty}
                icon={<Sparkles className="w-4 h-4 text-indigo-400" />}
              >
                Generate Website
              </Button>
            </div>
          </div>
        </form>

        {/* Validation Error Message */}
        {validationError && (
          <div
            role="alert"
            className="mt-3 flex items-center gap-2 text-xs font-medium text-rose-600 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg animate-in fade-in duration-150"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Short Supporting Line */}
        <p className="mt-3 text-center text-xs text-slate-500 font-medium">
          Start with an idea. Refine it with AI.
        </p>
      </div>

      {/* Example Prompts Section */}
      <div className="mt-12 max-w-3xl mx-auto text-left">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold text-slate-700 tracking-wide">
            Example Prompts
          </span>
          <span className="text-xs text-slate-400">Click to load into composer</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXAMPLE_PROMPTS.map((ex) => {
            const Icon = ex.icon;
            const isSelected = activeExampleId === ex.id;
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => handleSelectExample(ex)}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-full group ${
                  isSelected
                    ? 'border-slate-900 bg-slate-50/80 shadow-xs ring-1 ring-slate-900/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-900">{ex.title}</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">
                      {ex.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-2 leading-snug">
                    {ex.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors">
                  <span className="line-clamp-1 italic text-slate-500">"{ex.prompt}"</span>
                  <ArrowRight className="w-3 h-3 shrink-0 ml-2 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
