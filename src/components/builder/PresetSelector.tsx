import React from 'react';
import { GENERATION_PRESETS, GenerationPreset } from '../../types/presets';
import { Sparkles, Check, Briefcase, User, LayoutTemplate, Building2, ShoppingBag } from 'lucide-react';

interface PresetSelectorProps {
  selectedPresetId?: string;
  onSelectPreset: (presetId?: string) => void;
  disabled?: boolean;
}

const PRESET_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  business: Briefcase,
  portfolio: User,
  saas: LayoutTemplate,
  agency: Building2,
  ecommerce: ShoppingBag,
};

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  selectedPresetId,
  onSelectPreset,
  disabled = false,
}) => {
  const presets = Object.values(GENERATION_PRESETS);

  return (
    <div className="p-3 bg-slate-50 border-b border-slate-200 select-none">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Generation Preset (Optional)</span>
        </span>
        {selectedPresetId && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelectPreset(undefined)}
            className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            Clear preset
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {presets.map((preset) => {
          const Icon = PRESET_ICONS[preset.id] || Sparkles;
          const isSelected = selectedPresetId === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectPreset(isSelected ? undefined : preset.id)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left text-xs font-medium transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={preset.description}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-300' : 'text-slate-500'}`} />
              <span className="truncate flex-1">{preset.name}</span>
              {isSelected && <Check className="w-3 h-3 shrink-0 text-emerald-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
