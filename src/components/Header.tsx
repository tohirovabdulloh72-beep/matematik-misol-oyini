import React from 'react';
import { Volume2, VolumeX, Trophy, Map, Calculator, Flame, Star, Sparkles } from 'lucide-react';
import { GameMode, PlayerStats } from '../types';
import { playClick } from '../utils/audio';

interface HeaderProps {
  stats: PlayerStats;
  currentView: 'game' | 'adventure' | 'selector' | 'leaderboard';
  gameMode: GameMode | null;
  isPlaying: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onNavigate: (view: 'adventure' | 'selector' | 'leaderboard') => void;
  onLogoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  currentView,
  isPlaying,
  isMuted,
  onToggleMute,
  onNavigate,
  onLogoClick,
}) => {
  return (
    <header id="main-header" className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo */}
        <button
          id="btn-logo-home"
          onClick={() => {
            playClick();
            onLogoClick();
          }}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <span className="font-extrabold text-slate-950 text-xl font-mono">∑x</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-lg sm:text-xl text-white tracking-tight leading-none group-hover:text-amber-400 transition-colors">
                Matematika<span className="text-amber-400">O'yini</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <span>{stats.rankTitle}</span>
            </p>
          </div>
        </button>

        {/* Center Navigation (when not actively in high-intensity question) */}
        {!isPlaying && (
          <nav className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              id="nav-adventure"
              onClick={() => {
                playClick();
                onNavigate('adventure');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentView === 'adventure'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Bosqichlar</span>
            </button>

            <button
              id="nav-classic"
              onClick={() => {
                playClick();
                onNavigate('selector');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentView === 'selector'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Erkin O'yin</span>
            </button>

            <button
              id="nav-leaderboard"
              onClick={() => {
                playClick();
                onNavigate('leaderboard');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentView === 'leaderboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Reyting</span>
            </button>
          </nav>
        )}

        {/* Right Stats & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Total Score Badge */}
          <div className="bg-slate-800/90 border border-slate-700/80 px-2.5 sm:px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">Umumiy Ball</span>
              <span className="font-extrabold text-sm sm:text-base text-amber-400 leading-tight">
                {stats.totalScore.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Stars Badge */}
          <div className="bg-slate-800/90 border border-slate-700/80 px-2.5 py-1.5 rounded-xl hidden sm:flex items-center gap-1.5">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-sm text-yellow-200">{stats.adventureStars}</span>
          </div>

          {/* Best Streak */}
          {stats.highestStreak > 0 && (
            <div className="bg-slate-800/90 border border-slate-700/80 px-2.5 py-1.5 rounded-xl hidden lg:flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-semibold text-slate-300">Rekord Combo:</span>
              <span className="font-bold text-sm text-orange-400">{stats.highestStreak}x</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            id="btn-sound-toggle"
            onClick={onToggleMute}
            aria-label={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
            title={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors focus:outline-none"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation tabs */}
      {!isPlaying && (
        <div className="flex md:hidden border-t border-slate-800/80 px-3 py-1.5 justify-around bg-slate-900/95">
          <button
            id="mobile-nav-adventure"
            onClick={() => {
              playClick();
              onNavigate('adventure');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              currentView === 'adventure' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Bosqichlar</span>
          </button>
          <button
            id="mobile-nav-classic"
            onClick={() => {
              playClick();
              onNavigate('selector');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              currentView === 'selector' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Erkin O'yin</span>
          </button>
          <button
            id="mobile-nav-leaderboard"
            onClick={() => {
              playClick();
              onNavigate('leaderboard');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              currentView === 'leaderboard' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Reyting</span>
          </button>
        </div>
      )}
    </header>
  );
};
