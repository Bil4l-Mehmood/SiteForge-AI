import React from 'react';
import { LayoutTemplate, Sparkles, AlertTriangle, RotateCcw, Palette, ArrowRight } from 'lucide-react';
import { CURATED_THEME_PRESETS, ThemePresetOption } from '../../services/themePresets';

interface EmptyPreviewStateProps {
  onSelectPromptSuggestion?: (prompt: string) => void;
  initialPrompt?: string;
  status?: string;
  errorMessage?: string;
  onRetry?: () => void;
  isLoading?: boolean;
}

export const EmptyPreviewState: React.FC<EmptyPreviewStateProps> = ({
  onSelectPromptSuggestion,
  initialPrompt,
  status,
  errorMessage,
  onRetry,
  isLoading,
}) => {
  const isError = status === 'error';

  return (
    <div className="flex-1 bg-white p-6 sm:p-10 flex flex-col items-center justify-start overflow-y-auto text-center select-none">
      <div className="max-w-xl mx-auto space-y-6 w-full py-4">
        {/* Layout / Website Icon */}
        <div
          className={`w-14 h-14 rounded-2xl border shadow-2xs flex items-center justify-center mx-auto ${
            isError ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          {isError ? (
            <AlertTriangle className="w-7 h-7 text-rose-600" />
          ) : (
            <LayoutTemplate className="w-7 h-7 text-indigo-600" />
          )}
        </div>

        {/* Heading */}
        <div>
          <h3 className="text-xl font-bold font-display text-slate-900 tracking-tight">
            {isError ? 'Website Generation Paused' : 'Your Website Canvas'}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            {isError
              ? errorMessage ||
                'The AI model experienced temporary high demand or a transient service interruption. Your project was preserved.'
              : 'Enter a prompt in the left panel to synthesize a full website, or pick one of our curated design aesthetics below to start instantly.'}
          </p>
        </div>

        {/* Retry Button in Error State */}
        {isError && onRetry && (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Retry Generation</span>
            </button>
          </div>
        )}

        {/* Option 2: Curated Design Presets Showcase on Canvas */}
        {!isError && (
          <div className="pt-2 text-left bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-600" />
                <span>Curated Designer Theme Palettes</span>
              </span>
              <span className="text-[10px] font-mono uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold">
                Option 2 Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3.5 leading-relaxed">
              Click any aesthetic preset below to compose a website with harmonious colors, typography, and geometry:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CURATED_THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() =>
                    onSelectPromptSuggestion?.(
                      `Build a professional website styled in the ${preset.name} aesthetic (${preset.tagline}) with hero, features, services, testimonials, pricing, and contact form.`
                    )
                  }
                  className="p-2.5 bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 rounded-xl text-left transition-all cursor-pointer shadow-2xs group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 mb-1.5">
                      {preset.previewColors.slice(0, 3).map((hex, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 truncate">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                      {preset.tagline}
                    </div>
                  </div>
                  <div className="text-[10px] text-indigo-600 font-semibold mt-2 flex items-center gap-1">
                    <span>Use Style</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Queued Prompt Display if Handed off */}
        {initialPrompt && (
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-left">
            <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider block mb-1">
              Active Initial Prompt
            </span>
            <p className="text-xs text-indigo-950 italic line-clamp-3 leading-relaxed">
              "{initialPrompt}"
            </p>
          </div>
        )}

        {/* Suggested Quick Starters */}
        {onSelectPromptSuggestion && (
          <div className="text-left">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              Popular Quick Starters
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  onSelectPromptSuggestion(
                    'Create a modern website for a recruitment agency with a hero section, services, job listings, and a contact form.'
                  )
                }
                className="text-left text-xs p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer text-slate-700 shadow-2xs"
              >
                <span className="font-semibold block text-slate-900">Recruitment Agency</span>
                <span className="text-[11px] text-slate-500">
                  Hero, services, talent tiers & contact form
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onSelectPromptSuggestion(
                    'Build a luxury architectural studio website with project showcases, awards, testimonials, and inquiry form.'
                  )
                }
                className="text-left text-xs p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer text-slate-700 shadow-2xs"
              >
                <span className="font-semibold block text-slate-900">Architecture Studio</span>
                <span className="text-[11px] text-slate-500">
                  Luxury editorial layout with project gallery
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
