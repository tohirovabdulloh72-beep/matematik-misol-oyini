import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Star, Trophy, RotateCcw, ArrowRight, Home, CheckCircle2, XCircle, ChevronDown, ChevronUp, Flame, Zap, Award } from 'lucide-react';
import { AnswerHistory, Difficulty, GameMode } from '../types';
import { playClick, playGameOver, playLevelUp } from '../utils/audio';

interface ResultModalProps {
  score: number;
  history: AnswerHistory[];
  maxStreak: number;
  timeSpentSeconds: number;
  mode: GameMode;
  difficulty: Difficulty;
  levelNumber?: number;
  targetScore?: number;
  onPlayAgain: () => void;
  onNextLevel?: () => void;
  onGoHome: () => void;
  onOpenShop?: () => void;
  hasNextLevel?: boolean;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  score,
  history,
  maxStreak,
  timeSpentSeconds,
  mode,
  difficulty,
  levelNumber,
  targetScore,
  onPlayAgain,
  onNextLevel,
  onGoHome,
  onOpenShop,
  hasNextLevel,
}) => {
  const [showReview, setShowReview] = useState(false);

  const totalAnswered = history.length;
  const correctCount = history.filter((h) => h.isCorrect).length;
  const wrongCount = totalAnswered - correctCount;
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  // Calculate stars for adventure or overall performance
  let stars = 0;
  if (accuracy >= 90 && score > 0) stars = 3;
  else if (accuracy >= 70 && score > 0) stars = 2;
  else if (accuracy >= 50 && score > 0) stars = 1;

  const isPassed = stars > 0;

  useEffect(() => {
    if (isPassed) {
      playLevelUp();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    } else {
      playGameOver();
    }
  }, [isPassed]);

  return (
    <div id="result-modal-container" className="w-full max-w-xl mx-auto px-4 py-6">
      <div className="bg-slate-800/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        {/* Header Badge */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 bg-slate-900 border border-slate-700 text-slate-300">
            {mode === 'adventure'
              ? `${levelNumber}-Bosqich Yakunlandi`
              : mode === 'timeAttack'
              ? 'Tezkor Vaqt Yakunlandi'
              : 'O\'yin Yakunlandi'}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {isPassed ? 'Ajoyib Natija! 🎉' : 'Mashqni Davom Ettiring! 💪'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isPassed
              ? "Barcha misollarni muvaffaqiyatli bajardingiz!"
              : "Yana bir bor urinib ko'ring va ballaringizni oshiring!"}
          </p>
        </div>

        {/* Stars */}
        <div className="flex items-center justify-center gap-3 py-2">
          {[1, 2, 3].map((starIndex) => (
            <div
              key={starIndex}
              className={`transition-all duration-300 transform ${
                starIndex <= stars
                  ? 'scale-110 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]'
                  : 'scale-90 text-slate-700'
              }`}
            >
              <Star className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
          ))}
        </div>

        {/* Total Score Highlight Card */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-slate-700/80 rounded-2xl p-5 shadow-inner">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            To'plangan Ball
          </span>
          <div className="text-4xl sm:text-5xl font-black text-amber-400 font-mono mt-1">
            +{score.toLocaleString()}
          </div>
          {targetScore && (
            <div className="text-xs text-slate-400 mt-1">
              Maqsad: {targetScore.toLocaleString()} ball
            </div>
          )}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3">
            <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-semibold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>To'g'ri</span>
            </div>
            <div className="text-xl font-bold text-white">
              {correctCount} <span className="text-xs text-slate-500 font-normal">/ {totalAnswered}</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3">
            <div className="flex items-center justify-center gap-1 text-cyan-400 text-xs font-semibold mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Aniqlik</span>
            </div>
            <div className="text-xl font-bold text-white">{accuracy}%</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3">
            <div className="flex items-center justify-center gap-1 text-orange-400 text-xs font-semibold mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Max Combo</span>
            </div>
            <div className="text-xl font-bold text-white">{maxStreak}x</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            id="btn-play-again"
            onClick={() => {
              playClick();
              onPlayAgain();
            }}
            className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-600 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Qayta o'ynash</span>
          </button>

          {hasNextLevel && isPassed && onNextLevel && (
            <button
              id="btn-next-level"
              onClick={() => {
                playClick();
                onNextLevel();
              }}
              className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <span>Keyingi Bosqich</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {onOpenShop && (
            <button
              id="btn-result-shop"
              onClick={() => {
                playClick();
                onOpenShop();
              }}
              className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>🎨 Do'kon</span>
            </button>
          )}

          <button
            id="btn-result-home"
            onClick={() => {
              playClick();
              onGoHome();
            }}
            className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Bosh sahifa</span>
          </button>
        </div>

        {/* Accordion: Detailed Answers Review */}
        {history.length > 0 && (
          <div className="pt-2 border-t border-slate-700/60 text-left">
            <button
              id="btn-toggle-review"
              onClick={() => {
                playClick();
                setShowReview(!showReview);
              }}
              className="w-full py-2 flex items-center justify-between text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span>Misollar tahlili va javoblar ({history.length} ta)</span>
              {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showReview && (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex flex-col gap-1 ${
                      item.isCorrect
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold text-sm">
                      <span className="text-white">
                        {idx + 1}. {item.problem.expression} = {item.problem.correctAnswer}
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        {item.isCorrect ? (
                          <span className="text-emerald-400 font-sans font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> +{item.pointsEarned} ball
                          </span>
                        ) : (
                          <span className="text-rose-400 font-sans font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Sizning javob: {item.userAnswer === -999999 ? 'Vaqt tugadi' : item.userAnswer}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">
                      {item.problem.explanation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
