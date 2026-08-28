import React, { useState } from 'react';
import { Trophy, Medal, Star, Flame, Award, CheckCircle2, User, Sparkles, Check } from 'lucide-react';
import { LeaderboardItem, PlayerStats } from '../types';
import { getSavedPlayerName, savePlayerName } from '../utils/storage';
import { playClick } from '../utils/audio';

interface LeaderboardViewProps {
  stats: PlayerStats;
  leaderboard: LeaderboardItem[];
  onPlayerNameUpdated: (name: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  stats,
  leaderboard,
  onPlayerNameUpdated,
}) => {
  const [playerName, setPlayerName] = useState(() => getSavedPlayerName());
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerName);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim().length > 0) {
      savePlayerName(tempName.trim());
      setPlayerName(tempName.trim());
      onPlayerNameUpdated(tempName.trim());
      setIsEditingName(false);
      playClick();
    }
  };

  const accuracy =
    stats.totalSolved > 0
      ? Math.round((stats.totalCorrect / stats.totalSolved) * 100)
      : 0;

  const ranksList = [
    { threshold: 0, title: 'Yosh Hisobchi 🌟', desc: "Boshlang'ich daraja" },
    { threshold: 1000, title: 'Matematika Shogirdi 📐', desc: '1,000 ball' },
    { threshold: 3000, title: 'Hisob-kitob Ustasi 🧠', desc: '3,000 ball' },
    { threshold: 6000, title: 'Aqliy Chempion ⚡', desc: '6,000 ball' },
    { threshold: 12000, title: 'Katta Matematik 🏆', desc: '12,000 ball' },
    { threshold: 20000, title: 'Professor 🎓', desc: '20,000 ball' },
    { threshold: 35000, title: 'Arximed Vorisi (Master) 👑', desc: '35,000 ball' },
  ];

  return (
    <div id="leaderboard-view" className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Player Profile & Stats Card */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-2xl font-mono">
              ∑
            </div>
            <div>
              {isEditingName ? (
                <form onSubmit={handleSaveName} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    maxLength={20}
                    className="bg-slate-900 border border-amber-500 rounded-xl px-3 py-1 text-sm font-bold text-white focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="p-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">{playerName}</h3>
                  <button
                    onClick={() => {
                      playClick();
                      setIsEditingName(true);
                    }}
                    className="text-xs text-amber-400 hover:underline font-semibold"
                  >
                    O'zgartirish
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {stats.rankTitle}
                </span>
                <span className="text-xs text-slate-400">
                  {stats.gamesPlayed} ta o'yin
                </span>
              </div>
            </div>
          </div>

          {/* Stars & Score pill */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-start">
            <div className="bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-700/80 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Jami Ball</span>
              <span className="text-lg font-black text-amber-400 font-mono">
                {stats.totalScore.toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-700/80 flex items-center gap-1.5">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Yulduzlar</span>
                <span className="text-base font-bold text-yellow-200">{stats.adventureStars}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lifetime Statistics Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
          <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
            <div className="text-xs text-slate-400 font-semibold">To'g'ri Javoblar</div>
            <div className="text-xl font-black text-white mt-0.5">
              {stats.totalCorrect}{' '}
              <span className="text-xs text-slate-500 font-normal">/ {stats.totalSolved}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 text-center">
            <Award className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
            <div className="text-xs text-slate-400 font-semibold">O'rtacha Aniqlik</div>
            <div className="text-xl font-black text-cyan-300 mt-0.5">{accuracy}%</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 text-center">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1.5" />
            <div className="text-xs text-slate-400 font-semibold">Eng Yuqori Combo</div>
            <div className="text-xl font-black text-orange-400 mt-0.5">{stats.highestStreak}x</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 text-center">
            <Sparkles className="w-5 h-5 text-purple-400 mx-auto mb-1.5" />
            <div className="text-xs text-slate-400 font-semibold">Ochilgan Bosqich</div>
            <div className="text-xl font-black text-purple-300 mt-0.5">{stats.unlockedLevel} / 12</div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">Eng Yuqori Natijalar (Reyting)</h3>
              <p className="text-xs text-slate-400">Eng ko'p ball to'plagan eng sara o'yinchilar</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">O'rin</th>
                <th className="py-3 px-3">O'yinchi</th>
                <th className="py-3 px-3 text-right">Ball</th>
                <th className="py-3 px-3 text-center">Rejim</th>
                <th className="py-3 px-3 text-center">Aniqlik</th>
                <th className="py-3 px-3 text-right">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-sm font-medium">
              {leaderboard.map((item, index) => {
                const isTop1 = index === 0;
                const isTop2 = index === 1;
                const isTop3 = index === 2;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-700/30 transition-colors ${
                      item.playerName === playerName ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {isTop1 ? (
                        <span className="w-7 h-7 rounded-lg bg-yellow-500/20 text-yellow-400 font-extrabold flex items-center justify-center border border-yellow-500/40">
                          🥇 1
                        </span>
                      ) : isTop2 ? (
                        <span className="w-7 h-7 rounded-lg bg-slate-300/20 text-slate-200 font-extrabold flex items-center justify-center border border-slate-300/40">
                          🥈 2
                        </span>
                      ) : isTop3 ? (
                        <span className="w-7 h-7 rounded-lg bg-amber-700/20 text-amber-500 font-extrabold flex items-center justify-center border border-amber-700/40">
                          🥉 3
                        </span>
                      ) : (
                        <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{item.playerName}</span>
                        {item.playerName === playerName && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                            Siz
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right font-black font-mono text-amber-400 text-base whitespace-nowrap">
                      {item.score.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {item.mode === 'adventure'
                          ? 'Bosqichlar'
                          : item.mode === 'timeAttack'
                          ? 'Tezkor Vaqt'
                          : 'Standart'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center text-emerald-400 font-bold whitespace-nowrap">
                      {item.accuracy}%
                    </td>

                    <td className="py-3.5 px-3 text-right text-xs text-slate-500 whitespace-nowrap font-mono">
                      {item.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
