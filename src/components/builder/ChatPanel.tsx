import React, { useRef, useEffect } from 'react';
import { Project, ChatMessage } from '../../types';
import { ChatMessageItem } from './ChatMessageItem';
import { PromptComposer } from './PromptComposer';
import { Sparkles, Trash2, Cpu, Loader2, AlertCircle, RotateCcw } from 'lucide-react';

interface ChatPanelProps {
  project: Project;
  onSendMessage: (content: string) => void;
  onClearChat: () => void;
  isLoading?: boolean;
  onRetry?: () => void;
  onRevertVersion?: (versionId: string) => void;
  onOpenHistory?: () => void;
  className?: string;
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'assistant-welcome',
  sender: 'assistant',
  content:
    'Welcome to SiteForge AI! Describe the website you want to build—including its purpose, target audience, layout sections (such as a hero, services, testimonials, or contact form), and aesthetic preferences. I will use the Gemini API to structure and synthesize your website specification.',
  timestamp: new Date().toISOString(),
};

const SUGGESTED_EDITS = [
  'Change primary color to deep navy blue',
  'Make the hero section punchier with a high-converting CTA',
  'Add a testimonials section below features',
  'Make buttons rounded and use a modern font',
  'Add an FAQ section before the contact form',
  'Switch to dark mode with slate surface colors',
];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  project,
  onSendMessage,
  onClearChat,
  isLoading = false,
  onRetry,
  onRevertVersion,
  onOpenHistory,
  className = '',
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showVersions, setShowVersions] = React.useState(false);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [project.chatHistory, isLoading]);

  const activeDoc = project.document || project.specification;
  const hasDoc = Boolean(activeDoc);
  const historyList = project.documentHistory || [];

  const allMessages: ChatMessage[] = [
    DEFAULT_WELCOME_MESSAGE,
    ...project.chatHistory,
  ];

  return (
    <aside
      className={`flex flex-col h-full bg-white border-r border-slate-200 select-none ${className}`}
    >
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              {hasDoc ? 'Conversational Website Editor' : 'Build with AI'}
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
              <span>Gemini 3.8 Flash</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {historyList.length > 0 && (
            <button
              type="button"
              onClick={onOpenHistory || (() => setShowVersions(!showVersions))}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                showVersions
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
              }`}
              title="View revision history & restore"
              aria-label="View revision history"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] font-mono font-bold text-indigo-700">v{historyList.length}</span>
            </button>
          )}

          {project.chatHistory.length > 0 && !isLoading && (
            <button
              type="button"
              onClick={onClearChat}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Clear prompt history"
              aria-label="Clear prompt history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Revision History Flyout Bar if toggled */}
      {showVersions && historyList.length > 0 && (
        <div className="bg-indigo-50/80 border-b border-indigo-200/80 p-2.5 text-xs text-indigo-950 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-[11px] text-indigo-900 flex items-center gap-1">
              <RotateCcw className="w-3 h-3 text-indigo-600" />
              Document Revisions ({historyList.length})
            </span>
            <button
              type="button"
              onClick={() => setShowVersions(false)}
              className="text-[10px] text-indigo-700 hover:text-indigo-900 cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {historyList.map((ver, idx) => {
              const isCurrent = project.activeVersionId === ver.id || (idx === historyList.length - 1 && !project.activeVersionId);
              return (
                <div
                  key={ver.id}
                  className={`flex items-center justify-between p-1.5 rounded border text-[11px] ${
                    isCurrent
                      ? 'bg-white border-indigo-300 font-medium text-indigo-950 shadow-2xs'
                      : 'bg-white/60 border-indigo-100 text-slate-700 hover:bg-white'
                  }`}
                >
                  <div className="truncate mr-2">
                    <span className="font-mono text-[10px] text-indigo-600 mr-1.5">#{idx + 1}</span>
                    <span>{ver.label}</span>
                  </div>
                  {isCurrent ? (
                    <span className="text-[10px] text-emerald-600 font-semibold px-1.5 py-0.5 bg-emerald-50 rounded">
                      Current
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onRevertVersion?.(ver.id);
                        setShowVersions(false);
                      }}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline px-1"
                    >
                      Revert
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Status Banner */}
      <div className="bg-slate-50 border-b border-slate-200/80 px-3.5 py-2 flex items-center justify-between gap-2 text-xs text-slate-600 shrink-0">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Cpu className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>{hasDoc ? 'Conversational Editing Active' : 'Server-side GenAI proxy connected'}</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">
          {hasDoc ? 'Website Loaded' : 'Awaiting prompt'}
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-0 select-text">
        {allMessages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} onRetry={onRetry} isLoading={isLoading} />
        ))}

        {/* Live Generation Loading State Card */}
        {isLoading && (
          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-3 animate-pulse">
            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="font-semibold block text-indigo-900 mb-0.5">
                {hasDoc ? 'Applying Conversational Edits...' : 'Generating Website Specification...'}
              </span>
              <p className="text-[11px] text-indigo-800/80 leading-relaxed">
                {hasDoc
                  ? 'Updating the website document, preserving untouched sections, and validating with Gemini API...'
                  : 'Analyzing requirements, structuring pages, configuring themes, and synthesizing sections with Gemini API. (Automatic retry with backoff is enabled if model demand spikes).'}
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Edit Suggestions Pill Cloud when a website exists */}
      {hasDoc && !isLoading && (
        <div className="px-3 pt-2 bg-slate-50 border-t border-slate-200/70 shrink-0">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>Suggested quick edits:</span>
          </div>
          <div className="flex flex-wrap gap-1 pb-2 max-h-20 overflow-y-auto">
            {SUGGESTED_EDITS.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSendMessage(suggestion)}
                className="text-[11px] bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-700 text-slate-700 px-2 py-0.5 rounded-md transition-colors cursor-pointer shadow-2xs truncate max-w-full"
                title={suggestion}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Multiline Prompt Composer with Loading Protection */}
      <PromptComposer
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        placeholder={
          hasDoc
            ? 'Describe changes: e.g. "Change primary color to navy blue", "Add testimonials section", "Make buttons pill"...'
            : 'e.g. Create a modern website for a recruitment agency with a hero section, services, job listings, and a contact form...'
        }
      />
    </aside>
  );
};
