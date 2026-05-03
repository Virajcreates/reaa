import { LogOut } from 'lucide-react';
import { Button, ReaaLogo } from '@/components/ui';
import config from '@/config';

interface HeaderProps {
  userName: string;
  onLogout: () => void;
  onLanguageChange?: (language: string) => void;
  selectedLanguage?: string;
  onMenuToggle?: () => void;
}

export function Header({
  userName,
  onLogout,
  onLanguageChange,
  selectedLanguage,
  onMenuToggle,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-900/90 backdrop-blur-xl border-b border-white/[0.06] shadow-glass">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            {onMenuToggle && (
              <button 
                onClick={onMenuToggle}
                className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <ReaaLogo size={38} />
            <div>
              <h1 className="text-xl font-bold text-white">
                {config.app.title}
              </h1>
              <p className="text-xs text-gray-400">{config.app.subtitle}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Language Selector - only show if props provided */}
            {onLanguageChange && selectedLanguage && (
              <select
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="px-4 py-2 rounded-xl border border-white/[0.1] bg-white/[0.05] text-sm font-medium text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all cursor-pointer hover:border-white/[0.2] backdrop-blur-sm"
              >
                {config.languages.map((lang) => (
                  <option key={lang} value={lang} className="bg-dark-800 text-gray-200">
                    {lang}
                  </option>
                ))}
              </select>
            )}

            {/* Welcome */}
            <span className="text-sm text-gray-400 hidden sm:inline">Hello, {userName}!</span>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
