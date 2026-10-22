import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Send, X, Palette } from 'lucide-react';
import { CURATED_THEME_PRESETS } from '../../services/themePresets';

interface PromptComposerProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const PromptComposer: React.FC<PromptComposerProps> = ({
  onSendMessage,
  isLoading = false,
  placeholder,
}) => {
  const [input, setInput] = useState('');

  const isBlank = !input.trim();

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleApplyThemePill = (themeName: string) => {
    if (isLoading) return;
    const styleInstruction = `Apply the ${themeName} design aesthetic with matching colors, typography, and borders.`;
    if (!input.trim()) {
      setInput(styleInstruction);
    } else {
      setInput(`${input.trim()} — ${styleInstruction}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 border-t border-slate-200 bg-white shrink-0"
    >
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 focus-within:border-slate-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 transition-all p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="builder-chat-composer"
            className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5"
          >
            <span>Instructions & Prompts</span>
          </label>
          {input && !isLoading && (
            <button
              type="button"
              onClick={() => setInput('')}
              className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-0.5 cursor-pointer"
              title="Clear input"
            >
              <X className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Quick Option 2 Theme Aesthetic Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-1 text-[10px] no-scrollbar">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1 mr-0.5">
            <Palette className="w-3 h-3 text-indigo-500" />
            <span>Styles:</span>
          </span>
          {CURATED_THEME_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleApplyThemePill(p.name)}
              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-600 hover:text-indigo-700 transition-colors shrink-0 cursor-pointer font-medium"
              title={`Click to add ${p.name} style to prompt`}
            >
              {p.name.split(' ')[0]}
            </button>
          ))}
        </div>

        <textarea
          id="builder-chat-composer"
          rows={3}
          value={input}
          disabled={isLoading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isLoading
              ? 'Processing request with Gemini...'
              : placeholder ||
                'e.g. Create a modern website for a luxury architecture studio with hero, projects, and contact form...'
          }
          className="w-full resize-none border-none bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none leading-relaxed disabled:opacity-50"
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 mt-1">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="hidden sm:inline">Press</span>
            <kbd className="hidden sm:inline-flex items-center px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-600">
              Enter
            </kbd>
            <span className="hidden sm:inline">to send</span>
            <span className="text-slate-400">· Shift+Enter newline</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            disabled={isBlank || isLoading}
            icon={<Send className="w-3 h-3" />}
            className="px-3 py-1 text-xs"
          >
            {isLoading ? 'Generating...' : 'Send'}
          </Button>
        </div>
      </div>
    </form>
  );
};
