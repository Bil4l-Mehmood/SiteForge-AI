import React from 'react';
import { AppView } from '../../types';
import { Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: AppView) => void;
  onOpenArchitecture: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenArchitecture }) => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center text-white">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <span className="font-display font-bold text-sm text-slate-900">
                SiteForge AI
              </span>
            </div>
            <span className="hidden sm:inline text-slate-300">·</span>
            <p className="text-xs text-slate-500 max-w-sm">
              An AI-powered website builder transforming natural language ideas into responsive web experiences.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-600">
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('projects')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              My Projects
            </button>
            <button
              onClick={() => onNavigate('builder')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Builder
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              About Us
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Contact Us
            </button>
            <button
              onClick={onOpenArchitecture}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Architecture
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            © {new Date().getFullYear()} SiteForge AI. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
