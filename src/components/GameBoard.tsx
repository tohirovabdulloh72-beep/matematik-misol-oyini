import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Clock, Zap, Flame, Award, ArrowRight, Delete, X, AlertCircle } from 'lucide-react';
import { AnswerHistory, Difficulty, GameMode, InputMode, MathProblem } from '../types';
import { calculatePoints } from '../utils/mathGenerator';
import { playClick, playCombo, playCorrect, playTick, playWrong } from '../utils/audio';

interface GameBoardProps {
  mode: GameMode;
  difficulty: Difficulty;
  currentLevelNumber?: number;
  totalQuestions: number;
  inputMode: InputMode;
  onGameOver: (results: {
    score: number;
    history: AnswerHistory[];
    maxStreak: number;
    timeSpentSeconds: number;
  }) => void;
  onExit: () => void;
  generateNextProblem: (level?: number) => MathProblem;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  mode,
  difficulty,
  currentLevelNumber,
  totalQuestions,
  inputMode: initialInputMode,
  onGameOver,
  onExit,
  generateNextProblem,
}) => {
  // Game state
  const [currentProblem, setCurrentProblem] = useState<MathProblem>(() => generateNextProblem(currentLevelNumber));
  const [questionIndex, setQuestionIndex] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [inputMode, setInputMode] = useState<InputMode>(initialInputMode);

  // Time management
  const [timeRemaining, setTimeRemaining] = useState(currentProblem.timeLimit);
  const [timeAttackTotalSeconds, setTimeAttackTotalSeconds] = useState(60);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);

  // Answer interaction state
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [numpadInput, setNumpadInput] = useState<string>('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    pointsEarned: number;
    streakBonus: number;
  } | null>(null);

  const historyRef = useRef<AnswerHistory[]>([]);
  const questionStartTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<number | null>(null);
  const hasFinishedRef = useRef(false);

  // Finish game callback
  const finishGame = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    onGameOver({
      score,
      history: historyRef.current,
      maxStreak,
      timeSpentSeconds: totalElapsedTime,
    });
  }, [score, maxStreak, totalElapsedTime, onGameOver]);

  // Handle answer submission
  const handleAnswer = useCallback((answer: number) => {
    if (isAnswered || hasFinishedRef.current) return;

    setIsAnswered(true);
    setSelectedAnswer(answer);

    const isCorrect = answer === currentProblem.correctAnswer;
    const timeTaken = (Date.now() - questionStartTimeRef.current) / 1000;
    const timeFractionRemaining = Math.max(0, timeRemaining / currentProblem.timeLimit);

    let points = 0;
    let streakBonus = 0;
    let newStreak = streak;

    if (isCorrect) {
      newStreak = streak + 1;
      const ptsCalc = calculatePoints(difficulty, timeFractionRemaining, newStreak);
      points = ptsCalc.total;
      streakBonus = ptsCalc.streakBonus;

      setStreak(newStreak);
      setMaxStreak((prev) => Math.max(prev, newStreak));
      setScore((prev) => prev + points);

      if (newStreak >= 3) {
        playCombo(newStreak);
      } else {
        playCorrect();
      }
    } else {
      newStreak = 0;
      setStreak(0);
      playWrong();

      if (mode === 'survival') {
        setLives((prev) => {
          const updated = prev - 1;
          if (updated <= 0) {
            setTimeout(() => finishGame(), 700);
          }
          return updated;
        });
      }
    }

    setFeedback({
      isCorrect,
      pointsEarned: points,
      streakBonus,
    });

    historyRef.current.push({
      problem: currentProblem,
      userAnswer: answer,
      isCorrect,
      timeTaken,
      pointsEarned: points,
    });

    // Advance to next problem or finish
    const timer = setTimeout(() => {
      if (hasFinishedRef.current) return;

      if (mode === 'classic' || mode === 'adventure') {
        if (questionIndex >= totalQuestions) {
          finishGame();
          return;
        }
      }

      // Generate next question
      const nextProblem = generateNextProblem(currentLevelNumber);
      setCurrentProblem(nextProblem);
      setQuestionIndex((prev) => prev + 1);
      setTimeRemaining(nextProblem.timeLimit);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setNumpadInput('');
      setFeedback(null);
      questionStartTimeRef.current = Date.now();
    }, 700);

    return () => clearTimeout(timer);
  }, [
    isAnswered,
    currentProblem,
    timeRemaining,
    streak,
    difficulty,
    mode,
    questionIndex,
    totalQuestions,
    finishGame,
    generateNextProblem,
    currentLevelNumber,
  ]);

  // Main countdown timer effect
  useEffect(() => {
    timerIntervalRef.current = window.setInterval(() => {
      setTotalElapsedTime((prev) => prev + 1);

      if (mode === 'timeAttack') {
        setTimeAttackTotalSeconds((prev) => {
          if (prev <= 1) {
            finishGame();
            return 0;
          }
          if (prev <= 5) playTick();
          return prev - 1;
        });
      }

      setTimeRemaining((prev) => {
        if (isAnswered) return prev;
        if (prev <= 1) {
          // Time expired for this question
          handleAnswer(-999999); // Treat as wrong answer
          return 0;
        }
        if (prev <= 4) {
          playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [mode, isAnswered, finishGame, handleAnswer]);

  // Keyboard shortcut listener for fast answering
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered) return;

      // Multiple choice shortcuts (1, 2, 3, 4) or (A, B, C, D)
      if (inputMode === 'choice') {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const index = parseInt(e.key, 10) - 1;
          if (currentProblem.options[index] !== undefined) {
            handleAnswer(currentProblem.options[index]);
          }
        } else if (['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(e.key)) {
          const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
          const index = map[e.key.toLowerCase()];
          if (currentProblem.options[index] !== undefined) {
            handleAnswer(currentProblem.options[index]);
          }
        }
      }

      // Numpad input shortcuts
      if (inputMode === 'numpad') {
        if (/^[0-9]$/.test(e.key)) {
          setNumpadInput((prev) => (prev.length < 6 ? prev + e.key : prev));
        } else if (e.key === 'Backspace') {
          setNumpadInput((prev) => prev.slice(0, -1));
        } else if (e.key === 'Enter') {
          if (numpadInput.trim().length > 0) {
            handleAnswer(parseInt(numpadInput, 10));
          }
        } else if (e.key === '-') {
          setNumpadInput((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, inputMode, currentProblem, numpadInput, handleAnswer]);

  // Timer percentage for question
  const timePercent = Math.max(0, (timeRemaining / currentProblem.timeLimit) * 100);

  return (
    <div id="game-board-container" className="w-full max-w-2xl mx-auto px-4 py-4 sm:py-6">
      {/* Top HUD Card */}
      <div className="bg-slate-800/95 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 shadow-xl mb-4">
        <div className="flex items-center justify-between gap-2">
          {/* Question Counter or Mode Badge */}
          <div className="flex items-center gap-2">
            <button
              id="btn-exit-game"
              onClick={() => {
                playClick();
                onExit();
              }}
              title="Chiqish"
              className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {mode === 'adventure'
                  ? `${currentLevelNumber}-Bosqich`
                  : mode === 'timeAttack'
                  ? 'Tezkor Vaqt'
                  : mode === 'survival'
                  ? 'Omon Qolish'
                  : 'Misol'}
              </span>
              <span className="text-sm font-extrabold text-white">
                {mode === 'timeAttack'
                  ? `${questionIndex}-misol`
                  : `${questionIndex} / ${totalQuestions}`}
              </span>
            </div>
          </div>

          {/* Center: Lives or Timer indicator */}
          <div className="flex items-center gap-2">
            {mode === 'survival' && (
              <div className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-700">
                {[1, 2, 3].map((heartIndex) => (
                  <Heart
                    key={heartIndex}
                    className={`w-4 h-4 ${
                      heartIndex <= lives
                        ? 'text-rose-500 fill-rose-500 animate-pulse'
                        : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
            )}

            {mode === 'timeAttack' && (
              <div className="flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-500/40 px-3 py-1 rounded-xl">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="font-mono font-black text-base text-cyan-300">
                  {timeAttackTotalSeconds}s
                </span>
              </div>
            )}

            {/* Streak Combo Badge */}
            {streak >= 2 && (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-xl shadow-lg shadow-orange-500/25 animate-bounce">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>{streak}x Combo!</span>
              </div>
            )}
          </div>

          {/* Right: Current Score */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">
                Joriy Ball
              </span>
              <span className="text-lg sm:text-xl font-black text-amber-400 leading-tight">
                {score.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Question Time Progress Bar */}
        <div className="mt-3 w-full bg-slate-900/90 rounded-full h-2 overflow-hidden border border-slate-700/60">
          <div
            className={`h-full transition-all duration-300 ease-linear rounded-full ${
              timePercent > 50
                ? 'bg-emerald-500'
                : timePercent > 25
                ? 'bg-amber-500'
                : 'bg-rose-500 animate-pulse'
            }`}
            style={{ width: `${timePercent}%` }}
          />
        </div>
      </div>

      {/* Main Math Card */}
      <div
        id="problem-display-card"
        className={`relative rounded-3xl p-6 sm:p-10 border text-center transition-all duration-200 shadow-2xl overflow-hidden ${
          feedback
            ? feedback.isCorrect
              ? 'bg-emerald-950/40 border-emerald-500/80 shadow-emerald-500/10 ring-4 ring-emerald-500/20'
              : 'bg-rose-950/40 border-rose-500/80 shadow-rose-500/10 ring-4 ring-rose-500/20 animate-shake'
            : streak >= 3
            ? 'bg-slate-800/95 border-amber-500/60 shadow-amber-500/10'
            : 'bg-slate-800/90 border-slate-700/80'
        }`}
      >
        {/* Floating feedback score */}
        {feedback && (
          <div
            className={`absolute top-3 right-4 sm:top-4 sm:right-6 text-sm sm:text-base font-extrabold px-3 py-1 rounded-xl shadow-lg animate-fade-in ${
              feedback.isCorrect
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-rose-500 text-white'
            }`}
          >
            {feedback.isCorrect ? (
              <span>+{feedback.pointsEarned} Ball! {feedback.streakBonus > 0 && `(+${feedback.streakBonus} Combo)`}</span>
            ) : (
              <span>Xato! To'g'ri javob: {currentProblem.correctAnswer}</span>
            )}
          </div>
        )}

        {/* Expression */}
        <div className="py-4 sm:py-6">
          <div className="text-4xl sm:text-6xl font-black text-white font-mono tracking-wider drop-shadow-md select-none">
            {currentProblem.expression} = <span className="text-amber-400">?</span>
          </div>

          {/* Hint / Explanation when answered incorrectly */}
          {feedback && !feedback.isCorrect && (
            <div className="mt-4 p-3 bg-rose-950/70 border border-rose-800/80 rounded-xl text-rose-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Tushuntirish: {currentProblem.explanation}</span>
            </div>
          )}
        </div>

        {/* Toggle input mode helper (small switch) */}
        <div className="flex justify-end pt-2">
          <button
            id="toggle-input-mode-btn"
            onClick={() => {
              playClick();
              setInputMode(inputMode === 'choice' ? 'numpad' : 'choice');
            }}
            className="text-[11px] text-slate-400 hover:text-amber-400 underline font-medium transition-colors"
          >
            {inputMode === 'choice' ? "⌨️ Klaviatura rejimiga o'tish" : "🔘 Variantlar rejimiga o'tish"}
          </button>
        </div>
      </div>

      {/* Answer Area */}
      <div className="mt-5">
        {inputMode === 'choice' ? (
          /* 4 Multiple Choice Buttons */
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {currentProblem.options.map((option, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isChosen = selectedAnswer === option;
              const isCorrectAnswer = option === currentProblem.correctAnswer;

              let buttonStyle = 'bg-slate-800/90 border-slate-700/80 text-white hover:border-amber-500/60 hover:bg-slate-700/60';

              if (isAnswered) {
                if (isCorrectAnswer) {
                  buttonStyle = 'bg-emerald-600 border-emerald-400 text-white ring-4 ring-emerald-500/30';
                } else if (isChosen && !isCorrectAnswer) {
                  buttonStyle = 'bg-rose-600 border-rose-400 text-white';
                } else {
                  buttonStyle = 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-50';
                }
              }

              return (
                <button
                  key={`${currentProblem.id}_opt_${idx}`}
                  id={`choice-btn-${idx}`}
                  disabled={isAnswered}
                  onClick={() => handleAnswer(option)}
                  className={`p-4 sm:p-5 rounded-2xl border text-xl sm:text-2xl font-black font-mono transition-all duration-150 flex items-center justify-between active:scale-[0.97] shadow-lg ${buttonStyle}`}
                >
                  <span className="w-7 h-7 rounded-lg bg-slate-900/60 border border-slate-700 text-xs font-bold font-sans text-slate-400 flex items-center justify-center">
                    {letter}
                  </span>
                  <span className="flex-1 text-center">{option}</span>
                </button>
              );
            })}
          </div>
        ) : (
          /* Numpad Input */
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl">
            {/* Input Display */}
            <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3.5 mb-3 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Javobingiz:</span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400 tracking-wider">
                {numpadInput || '0'}
              </span>
            </div>

            {/* Keys */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <button
                  key={digit}
                  id={`numpad-btn-${digit}`}
                  disabled={isAnswered}
                  onClick={() => {
                    playClick();
                    setNumpadInput((prev) => (prev.length < 6 ? prev + digit : prev));
                  }}
                  className="py-3.5 rounded-xl bg-slate-700/70 hover:bg-slate-700 border border-slate-600/60 text-white font-bold text-xl active:scale-95 transition-all"
                >
                  {digit}
                </button>
              ))}

              {/* Backspace */}
              <button
                id="numpad-btn-backspace"
                disabled={isAnswered}
                onClick={() => {
                  playClick();
                  setNumpadInput((prev) => prev.slice(0, -1));
                }}
                className="py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 font-bold flex items-center justify-center active:scale-95 transition-all"
              >
                <Delete className="w-5 h-5" />
              </button>

              {/* Zero */}
              <button
                id="numpad-btn-0"
                disabled={isAnswered}
                onClick={() => {
                  playClick();
                  setNumpadInput((prev) => (prev.length < 6 ? prev + '0' : prev));
                }}
                className="py-3.5 rounded-xl bg-slate-700/70 hover:bg-slate-700 border border-slate-600/60 text-white font-bold text-xl active:scale-95 transition-all"
              >
                0
              </button>

              {/* Submit Enter Button */}
              <button
                id="numpad-btn-submit"
                disabled={isAnswered || numpadInput.trim().length === 0}
                onClick={() => {
                  if (numpadInput.trim().length > 0) {
                    handleAnswer(parseInt(numpadInput, 10));
                  }
                }}
                className="py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed border border-amber-400 text-slate-950 font-black flex items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
