import React, { useState } from 'react';
import { Play, Sparkles, Target, Zap, Heart, Check, Settings2, Plus, Minus, X, Divide } from 'lucide-react';
import { Difficulty, GameMode, InputMode, Operation } from '../types';
import { playClick } from '../utils/audio';

interface ClassicModeSelectorProps {
  onStartGame: (config: {
    mode: GameMode;
    difficulty: Difficulty;
    operations: Operation[];
    questionsCount: number;
    inputMode: InputMode;
  }) => void;
}

export const ClassicModeSelector: React.FC<ClassicModeSelectorProps> = ({ onStartGame }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [selectedOp, setSelectedOp] = useState<Operation>('all');
  const [questionsCount, setQuestionsCount] = useState<number>(10);
  const [inputMode, setInputMode] = useState<InputMode>('choice');

  const difficulties: {
    id: Difficulty;
    title: string;
    desc: string;
    points: string;
    color: string;
    border: string;
  }[] = [
    {
      id: 'easy',
      title: 'Oson (1-daraja)',
      desc: '1-20 oralig\'ida qo\'shish va ayirish',
      points: '+100 ball',
      color: 'text-emerald-400 bg-emerald-500/10',
      border: 'border-emerald-500/40',
    },
    {
      id: 'medium',
      title: 'O\'rtacha (2-daraja)',
      desc: '1-50 sonlar, karra jadvali va bo\'lish',
      points: '+150 ball',
      color: 'text-amber-400 bg-amber-500/10',
      border: 'border-amber-500/40',
    },
    {
      id: 'hard',
      title: 'Qiyin (3-daraja)',
      desc: '1-100 sonlar, qavslar va ketma-ket amallar',
      points: '+220 ball',
      color: 'text-orange-400 bg-orange-500/10',
      border: 'border-orange-500/40',
    },
    {
      id: 'expert',
      title: 'Ekspert (4-daraja)',
      desc: 'Kvadratlar, ko\'p bosqichli ifodalar',
      points: '+300 ball',
      color: 'text-purple-400 bg-purple-500/10',
      border: 'border-purple-500/40',
    },
    {
      id: 'master',
      title: 'Master (5-daraja)',
      desc: 'Tezkor hisoblash, chempionlar uchun',
      points: '+400 ball',
      color: 'text-rose-400 bg-rose-500/10',
      border: 'border-rose-500/40',
    },
  ];

  const modes: {
    id: GameMode;
    title: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'classic',
      title: 'Standart Rejim',
      desc: 'Belgilangan miqdordagi misollarni xotirjam yechish',
      icon: <Target className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'timeAttack',
      title: 'Tezkor Vaqt (60s)',
      desc: '60 soniya ichida eng ko\'p ball to\'plash',
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
    },
    {
      id: 'survival',
      title: 'Omon Qolish (3 Jon)',
      desc: '3 ta joningiz bor, xato qilmasdan uzoqroq boring',
      icon: <Heart className="w-5 h-5 text-rose-400" />,
    },
  ];

  const operations: { id: Operation; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Barcha Amallar', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
    { id: 'add', label: 'Faqat Qo\'shish (+)', icon: <Plus className="w-4 h-4 text-emerald-400" /> },
    { id: 'subtract', label: 'Faqat Ayirish (-)', icon: <Minus className="w-4 h-4 text-sky-400" /> },
    { id: 'multiply', label: 'Ko\'paytirish (×)', icon: <X className="w-4 h-4 text-amber-400" /> },
    { id: 'divide', label: 'Bo\'lish (÷)', icon: <Divide className="w-4 h-4 text-purple-400" /> },
  ];

  const handleStart = () => {
    playClick();
    onStartGame({
      mode: selectedMode,
      difficulty: selectedDifficulty,
      operations: selectedOp === 'all' ? ['all'] : [selectedOp],
      questionsCount: selectedMode === 'classic' ? questionsCount : 50,
      inputMode,
    });
  };

  return (
    <div id="classic-mode-selector" className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
        {/* Title */}
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Erkin O'yin va Mashq
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            O'yin Parametrlarini Tanlang
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Qiyinlik darajasi, amal turlari va o'yin rejimini o'zingizga moslang.
          </p>
        </div>

        {/* Section 1: Game Mode */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            1. O'yin Rejimi
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {modes.map((m) => {
              const isSelected = selectedMode === m.id;
              return (
                <button
                  key={m.id}
                  id={`mode-select-${m.id}`}
                  onClick={() => {
                    playClick();
                    setSelectedMode(m.id);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-700/80 border-amber-500 ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/60 border-slate-700/60 hover:bg-slate-700/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
                      {m.icon}
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">{m.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-snug">{m.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Difficulty Level */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            2. Qiyinlik Darajasi (Ball koeffitsiyenti)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {difficulties.map((d) => {
              const isSelected = selectedDifficulty === d.id;
              return (
                <button
                  key={d.id}
                  id={`diff-select-${d.id}`}
                  onClick={() => {
                    playClick();
                    setSelectedDifficulty(d.id);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? `bg-slate-700/90 border-amber-500 ring-2 ring-amber-500/30 ${d.border}`
                      : 'bg-slate-900/60 border-slate-700/60 hover:bg-slate-700/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${d.color}`}>
                      {d.points}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <h5 className="font-bold text-white text-sm">{d.title}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">{d.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Operations & Question Count */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Operations */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              3. Matematik Amal
            </label>
            <div className="grid grid-cols-2 gap-2">
              {operations.map((op) => {
                const isSelected = selectedOp === op.id;
                return (
                  <button
                    key={op.id}
                    id={`op-select-${op.id}`}
                    onClick={() => {
                      playClick();
                      setSelectedOp(op.id);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/80 shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-white'
                    } ${op.id === 'all' ? 'col-span-2' : ''}`}
                  >
                    {op.icon}
                    <span>{op.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Count & Input Mode */}
          <div className="space-y-5">
            {selectedMode === 'classic' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Misollar Soni
                </label>
                <div className="flex items-center gap-2">
                  {[10, 15, 20, 30].map((count) => (
                    <button
                      key={count}
                      id={`count-select-${count}`}
                      onClick={() => {
                        playClick();
                        setQuestionsCount(count);
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        questionsCount === count
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-white'
                      }`}
                    >
                      {count} ta
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Javob Kiritish Usuli
              </label>
              <div className="flex items-center gap-2">
                <button
                  id="input-mode-choice"
                  onClick={() => {
                    playClick();
                    setInputMode('choice');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                    inputMode === 'choice'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-white'
                  }`}
                >
                  <span>4 ta Variant</span>
                </button>
                <button
                  id="input-mode-numpad"
                  onClick={() => {
                    playClick();
                    setInputMode('numpad');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                    inputMode === 'numpad'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-white'
                  }`}
                >
                  <span>Raqamli Klaviatura</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Start Game Action Button */}
        <div className="pt-4 flex justify-center">
          <button
            id="btn-start-game"
            onClick={handleStart}
            className="w-full sm:w-auto min-w-[260px] py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-base sm:text-lg shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>O'yinni Boshlash!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
