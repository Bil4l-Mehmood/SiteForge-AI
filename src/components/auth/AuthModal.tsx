import React, { useState } from 'react';
import { AuthService, UserProfile } from '../../services/authService';
import { Button } from '../common/Button';
import { X, Mail, Lock, User, Building, Sparkles, Check, ArrowRight, ShieldCheck, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'signup';
  onAuthSuccess?: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'signin',
  onAuthSuccess,
}) => {
  const [tab, setTab] = useState<'signin' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = AuthService.signIn(email, password);
      setIsLoading(false);
      if (result.success && result.user) {
        onAuthSuccess?.(result.user);
        onClose();
      } else {
        setError(result.error || 'Failed to sign in.');
      }
    }, 300);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = AuthService.signUp({ name, email, organization, password });
      setIsLoading(false);
      if (result.success && result.user) {
        onAuthSuccess?.(result.user);
        onClose();
      } else {
        setError(result.error || 'Failed to create account.');
      }
    }, 300);
  };

  const handleQuickDemoLogin = (demoEmail: string, demoName: string) => {
    setError(null);
    const result = AuthService.signIn(demoEmail);
    if (result.success && result.user) {
      onAuthSuccess?.(result.user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              SiteForge AI Account
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            {tab === 'signin' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {tab === 'signin'
              ? 'Access your generated websites, revision history, and custom domains.'
              : 'Start synthesizing professional multi-page websites with AI.'}
          </p>

          {/* Tab Switcher */}
          <div className="flex bg-slate-800 p-1 rounded-lg mt-5 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setTab('signin');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                tab === 'signin'
                  ? 'bg-slate-700 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                tab === 'signup'
                  ? 'bg-slate-700 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Sign Up
            </button>
          </div>
        </div>

        {/* Content Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {tab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. bilal@pctsc.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <span className="text-[11px] text-indigo-600 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full justify-center"
              >
                Sign In to SiteForge
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bilal Ahmed"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. bilal@pctsc.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Organization (Optional)
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. PCTSC Global"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full justify-center"
              >
                Create Free Account
              </Button>
            </form>
          )}

          {/* Quick Demo Switcher */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Quick One-Click Sign In:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('bilal@pctsc.com', 'Bilal')}
                className="p-2 border border-slate-200 hover:border-indigo-300 rounded-lg text-left bg-slate-50 hover:bg-indigo-50/50 transition-colors cursor-pointer"
              >
                <div className="font-semibold text-xs text-slate-800">Bilal (PCTSC)</div>
                <div className="text-[10px] text-indigo-600 font-mono">Pro Account</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('creator@studio.design', 'Elena Vance')}
                className="p-2 border border-slate-200 hover:border-indigo-300 rounded-lg text-left bg-slate-50 hover:bg-indigo-50/50 transition-colors cursor-pointer"
              >
                <div className="font-semibold text-xs text-slate-800">Elena Vance</div>
                <div className="text-[10px] text-slate-500 font-mono">Agency Team</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Session • GDPR Ready</span>
          </div>
          <span className="text-slate-400 font-mono text-[10px]">SiteForge v2.4</span>
        </div>
      </div>
    </div>
  );
};
