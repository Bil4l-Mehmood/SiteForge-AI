import React from 'react';
import { CURATED_THEME_PRESETS, ThemePresetOption } from '../../services/themePresets';
import { WebsiteTheme, WebsiteDocument } from '../../types/schema';
import { Button } from '../common/Button';
import { X, Sparkles, Check, Palette, ArrowRight } from 'lucide-react';

interface ThemePresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: WebsiteTheme;
  onApplyTheme: (newTheme: WebsiteTheme, presetName: string) => void;
}

export const ThemePresetsModal: React.FC<ThemePresetsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onApplyTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Palette className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
              Premium Design Engine
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            Curated Designer Themes & Palettes
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Switch your entire website styling with a single click. Every preset harmonizes typography, border curvature, background depth, and CTA accents.
          </p>
        </div>

        {/* Presets Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {CURATED_THEME_PRESETS.map((preset) => {
            const isCurrentlyActive =
              currentTheme.primaryColor.toLowerCase() === preset.theme.primaryColor.toLowerCase() &&
              currentTheme.backgroundColor.toLowerCase() === preset.theme.backgroundColor.toLowerCase();

            return (
              <div
                key={preset.id}
                className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between ${
                  isCurrentlyActive
                    ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {preset.category}
                    </span>
                    {isCurrentlyActive && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
                        <Check className="w-3.5 h-3.5" />
                        Active Theme
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mb-1">{preset.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {preset.tagline}
                  </p>

                  {/* Swatches Preview Bar */}
                  <div className="flex items-center gap-1.5 mb-4">
                    {preset.previewColors.map((hex, idx) => (
                      <div
                        key={idx}
                        className="w-7 h-7 rounded-lg border border-black/10 shadow-2xs shrink-0"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                    <div className="ml-auto text-[11px] font-mono text-slate-400">
                      {preset.theme.fontFamily} • {preset.theme.borderRadius}
                    </div>
                  </div>
                </div>

                <Button
                  variant={isCurrentlyActive ? 'secondary' : 'outline'}
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => {
                    onApplyTheme(preset.theme, preset.name);
                    onClose();
                  }}
                >
                  {isCurrentlyActive ? 'Current Theme' : `Apply ${preset.name}`}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Applying a theme records a new version in your revision history.</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
