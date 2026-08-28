import React from 'react';
import { Star, Lock, Play, Award, Zap, CheckCircle2 } from 'lucide-react';
import { LevelConfig } from '../types';
import { playClick } from '../utils/audio';

interface AdventureMapProps {
  levels: LevelConfig[];
  onSelectLevel: (level: LevelConfig) => void;
}

export const AdventureMap: React.FC<AdventureMapProps> = ({ levels, onSelectLevel }) => {
  const totalStars = levels.reduce((sum, l) => sum + l.stars, 0);
  const maxPossibleStars = levels.length * 3;
  const completedCount = levels.filter((l) => l.stars > 0).length;
  const progressPercent = Math.round((completedCount / levels.length) * 100);

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">Oson</span>;
      case 'medium':
        return <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">O'rtacha</span>;
      case 'hard':
        return <span className="text-[11px] px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 font-semibold border border-orange-500/30">Qiyin</span>;
      case 'expert':
        return <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">Ekspert</span>;
      case 'master':
        return <span className="text-[11px] px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">Master</span>;
      default:
        return null;
    }
  };

  return (
    <div id="adventure-map-container" className="w-full max-w-5xl mx-auto px-4 py-6">
      {/* Banner / Overview */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-800 to-indigo-950/70 border border-slate-700/80 rounded-2xl p-5 sm:p-7 shadow-xl mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Bosqichli Sarguzasht
              </span>
              <span className="text-slate-400 text-xs font-medium">12 ta maxsus daraja</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Matematika Cho'qqisi Sari
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Har bir bosqichni to'liq yechib yulduzlar to'plang, yangi murakkab darajalarni oching va yuqori ballarga erishing!
            </p>
          </div>

          {/* Overall stars counter */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 sm:p-4 flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">To'plangan Yulduzlar</div>
                <div className="text-xl font-extrabold text-white">
                  {totalStars} <span className="text-slate-400 text-sm font-normal">/ {maxPossibleStars}</span>
                </div>
              </div>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <div className="text-xs text-slate-400 font-medium">O'tilgan</div>
              <div className="text-xl font-extrabold text-emerald-400">
                {progressPercent}%
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 w-full bg-slate-900/80 rounded-full h-2.5 overflow-hidden border border-slate-700/60">
          <div
            className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Grid of 12 Adventure Levels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {levels.map((lvl) => {
          const isUnlocked = lvl.unlocked;
          const isCompleted = lvl.stars > 0;

          return (
            <div
              key={lvl.level}
              id={`adventure-level-card-${lvl.level}`}
              className={`relative rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between p-5 ${
                isUnlocked
                  ? 'bg-slate-800/90 border-slate-700/80 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer group'
                  : 'bg-slate-900/60 border-slate-800/80 opacity-60'
              }`}
              onClick={() => {
                if (isUnlocked) {
                  playClick();
                  onSelectLevel(lvl);
                }
              }}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs ${
                        isUnlocked
                          ? isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {lvl.level}
                    </span>
                    {getDifficultyBadge(lvl.difficulty)}
                  </div>

                  {/* Stars / Lock */}
                  {isUnlocked ? (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((starIndex) => (
                        <Star
                          key={starIndex}
                          className={`w-4 h-4 ${
                            starIndex <= lvl.stars
                              ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Qulflangan</span>
                    </div>
                  )}
                </div>

                <h3
                  className={`text-base font-bold transition-colors ${
                    isUnlocked ? 'text-white group-hover:text-amber-400' : 'text-slate-400'
                  }`}
                >
                  {lvl.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {lvl.description}
                </p>
              </div>

              {/* Card Footer info */}
              <div className="mt-4 pt-3.5 border-t border-slate-700/50 flex items-center justify-between">
                <div className="text-xs">
                  {lvl.highScore > 0 ? (
                    <div className="flex items-center gap-1 text-amber-400 font-semibold">
                      <Award className="w-3.5 h-3.5" />
                      <span>Rekord: {lvl.highScore.toLocaleString()} ball</span>
                    </div>
                  ) : (
                    <span className="text-slate-400">
                      {lvl.questionsCount} ta misol • {lvl.timePerQuestion}s
                    </span>
                  )}
                </div>

                {isUnlocked && (
                  <button
                    id={`btn-play-level-${lvl.level}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      playClick();
                      onSelectLevel(lvl);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform"
                  >
                    <Play className="w-3 h-3 fill-slate-950" />
                    <span>{isCompleted ? 'Qayta' : "Boshlash"}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
