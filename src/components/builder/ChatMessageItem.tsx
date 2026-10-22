import React from 'react';
import { ChatMessage } from '../../types';
import { User, Sparkles, Info, AlertTriangle, RotateCcw } from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
  onRetry?: (prompt?: string) => void;
  isLoading?: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, onRetry, isLoading }) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const isErrorNotice =
    message.isError ||
    message.content.includes('Notice:') ||
    message.content.includes('Error:') ||
    message.content.includes('high demand');

  if (isSystem) {
    return (
      <div
        role="status"
        className={`p-3 rounded-xl border text-xs leading-relaxed ${
          isErrorNotice
            ? 'bg-rose-50/90 border-rose-200 text-rose-950'
            : 'bg-amber-50/90 border-amber-200/80 text-amber-900'
        }`}
      >
        <div className="flex items-center gap-1.5 font-semibold text-[11px] mb-1">
          {isErrorNotice ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="text-rose-900 font-bold">Service Notice</span>
            </>
          ) : (
            <>
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-amber-800">System Status</span>
            </>
          )}
        </div>
        <p className="whitespace-pre-wrap break-words">{message.content}</p>

        {/* Retry Button if prompt is available and onRetry provided */}
        {isErrorNotice && onRetry && message.retryPrompt && (
          <div className="mt-2.5 pt-2 border-t border-rose-200/60 flex items-center justify-between">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onRetry(message.retryPrompt)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Retry Generation</span>
            </button>
            <span className="text-[10px] text-rose-700/80 italic">Auto-retry supported</span>
          </div>
        )}

        <span
          className={`block text-[10px] mt-1.5 font-mono ${
            isErrorNotice ? 'text-rose-700/70' : 'text-amber-700/70'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-2.5 items-start ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Sender Avatar */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs shadow-2xs ${
          isUser
            ? 'bg-slate-900 text-white'
            : 'bg-indigo-50 border border-indigo-200 text-indigo-700'
        }`}
        aria-hidden="true"
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
          isUser
            ? 'bg-slate-900 text-white'
            : 'bg-slate-50 border border-slate-200 text-slate-800'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <span
          className={`block text-[10px] mt-1.5 font-mono ${
            isUser ? 'text-slate-400' : 'text-slate-400'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
};
