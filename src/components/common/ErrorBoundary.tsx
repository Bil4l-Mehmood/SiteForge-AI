import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log sanitized error without leaking sensitive tokens
    console.error('[SiteForge ErrorBoundary] Caught render error:', error.message, errorInfo.componentStack?.slice(0, 300));
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 my-4 mx-auto max-w-xl rounded-2xl bg-slate-50 border border-slate-200 text-center select-none shadow-xs">
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {this.props.fallbackTitle || 'Unable to display section'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            {this.props.fallbackMessage || 'An unexpected rendering error occurred. Your website project data remains safe and preserved.'}
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Retry Render</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
