import React, { useState, useEffect, useRef } from 'react';
import { AppView } from '../../types';
import { AuthService, UserProfile } from '../../services/authService';
import { Button } from '../common/Button';
import {
  Menu,
  X,
  Sparkles,
  FolderCode,
  Compass,
  Plus,
  Info,
  User,
  LogOut,
  UserCheck,
  ChevronDown,
  Mail,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onCreateWebsite: () => void;
  onOpenArchitecture: () => void;
  onOpenAuth: (tab?: 'signin' | 'signup') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onCreateWebsite,
  onOpenArchitecture,
  onOpenAuth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => AuthService.getCurrentUser());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsub = AuthService.subscribe((user) => {
      setCurrentUser(user);
    });
    return unsub;
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  const handleNav = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    AuthService.signOut();
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand title wordmark */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-2.5 text-slate-900 hover:opacity-90 transition-opacity text-left cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            SiteForge AI
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-600">
          <button
            onClick={() => handleNav('home')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 ${
              currentView === 'home'
                ? 'text-slate-900 border-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('projects')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 ${
              currentView === 'projects'
                ? 'text-slate-900 border-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            My Projects
          </button>
          <button
            onClick={() => handleNav('builder')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 ${
              currentView === 'builder'
                ? 'text-slate-900 border-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Builder
          </button>
          <button
            onClick={() => handleNav('about')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 ${
              currentView === 'about'
                ? 'text-slate-900 border-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            About
          </button>
          <button
            onClick={() => handleNav('contact')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 ${
              currentView === 'contact'
                ? 'text-slate-900 border-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Contact Us
          </button>
        </nav>

        {/* Zone 3: Authentication & Primary Action */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {currentUser ? (
            /* User profile avatar & dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                title="Account menu"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-800 pr-1 max-w-[90px] truncate">
                  {currentUser.name}
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono">
                  {currentUser.plan}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="font-bold text-xs text-slate-900">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">{currentUser.email}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{currentUser.organization || 'PCTSC Global'} • {currentUser.plan} Tier</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAuth('signin');
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Switch Account</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenAuth('signin')}
              >
                Sign In
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenAuth('signup')}
              >
                Sign Up
              </Button>
            </div>
          )}

          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={onCreateWebsite}
          >
            Start Building
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          {currentUser && (
            <button
              onClick={() => onOpenAuth('signin')}
              className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
            >
              {currentUser.name.charAt(0)}
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => handleNav('home')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'home'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Compass className="w-4 h-4 text-slate-500" />
              <span>Home</span>
            </button>
            <button
              onClick={() => handleNav('projects')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'projects'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FolderCode className="w-4 h-4 text-slate-500" />
              <span>My Projects</span>
            </button>
            <button
              onClick={() => handleNav('builder')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'builder'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-slate-500" />
              <span>Builder</span>
            </button>
            <button
              onClick={() => handleNav('about')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'about'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Info className="w-4 h-4 text-slate-500" />
              <span>About Us</span>
            </button>
            <button
              onClick={() => handleNav('contact')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'contact'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Mail className="w-4 h-4 text-slate-500" />
              <span>Contact Us</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {!currentUser ? (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signin');
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signup');
                  }}
                >
                  Sign Up
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('signin');
                }}
                className="w-full text-left p-2.5 bg-slate-50 rounded-lg flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900">{currentUser.name}</div>
                  <div className="text-slate-400 font-mono text-[10px]">{currentUser.email}</div>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                  {currentUser.plan}
                </span>
              </button>
            )}

            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setMobileMenuOpen(false);
                onCreateWebsite();
              }}
            >
              Start Building
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
