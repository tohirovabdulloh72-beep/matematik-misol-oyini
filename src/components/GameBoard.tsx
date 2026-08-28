import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Clock, Zap, Flame, Award, ArrowRight, Delete, X, AlertCircle, Music, Volume2, Sparkles, Frown } from 'lucide-react';
import { AnswerHistory, Difficulty, GameMode, InputMode, MathProblem, PlayerSkinsConfig } from '../types';
import { calculatePoints } from '../utils/mathGenerator';
import { playClick, playCombo, playNextVictorySong, playTick, playWrong, stopCurrentSong, SongInfo } from '../utils/audio';
import { getEquippedSkins } from '../utils/skinsData';

interface GameBoardProps {
  mode: GameMode;
  difficulty: Difficulty;
  currentLevelNumber?: number;
  totalQuestions: number;
  inputMode: InputMode;
  skinsConfig: PlayerSkinsConfig;
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
  skinsConfig,
  onGameOver,
  onExit,
  generateNextProblem,
}) => {
  // Active equipped skins
  const equipped = getEquippedSkins(skinsConfig);

  // Game state
  const [currentProblem, setCurrentProblem] = useState<MathProblem>(() => generateNextProblem(currentLevelNumber));
  const [questionIndex, setQuestionIndex] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [inputMode, setInputMode] = useState<InputMode>(initialInputMode);

  // Active playing 5s song state
  const [activeSong, setActiveSong] = useState<SongInfo | null>(null);
  const [songProgressKey, setSongProgressKey] = useState<number>(0);

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

  // 2-second penalty popup state for wrong answers
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);

  const historyRef = useRef<AnswerHistory[]>([]);
  const questionStartTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<number | null>(null);
  const hasFinishedRef = useRef(false);
  const songTimeoutRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCurrentSong();
      if (songTimeoutRef.current) clearTimeout(songTimeoutRef.current);
    };
  }, []);

  // Finish game callback
  const finishGame = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    stopCurrentSong();
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

      // Play 5-second celebratory rotating song
      const songInfo = playNextVictorySong();
      if (songInfo) {
        setActiveSong(songInfo);
        setSongProgressKey((k) => k + 1);
        if (songTimeoutRef.current) clearTimeout(songTimeoutRef.current);
        songTimeoutRef.current = window.setTimeout(() => {
          setActiveSong(null);
        }, 5000);
      }

      setFeedback({
        isCorrect: true,
        pointsEarned: points,
        streakBonus,
      });

      historyRef.current.push({
        problem: currentProblem,
        userAnswer: answer,
        isCorrect: true,
        timeTaken,
        pointsEarned: points,
      });

      // Smooth transition to next problem after 1.1s so player sees the answer
      // and the 5-second song continues playing smoothly in background!
      const timer = setTimeout(() => {
        if (hasFinishedRef.current) return;

        if (mode === 'classic' || mode === 'adventure') {
          if (questionIndex >= totalQuestions) {
            finishGame();
            return;
          }
        }

        const nextProblem = generateNextProblem(currentLevelNumber);
        setCurrentProblem(nextProblem);
        setQuestionIndex((prev) => prev + 1);
        setTimeRemaining(nextProblem.timeLimit);
        setIsAnswered(false);
        setSelectedAnswer(null);
        setNumpadInput('');
        setFeedback(null);
        questionStartTimeRef.current = Date.now();
      }, 1100);

      return () => clearTimeout(timer);
    } else {
      // WRONG ANSWER:
      // Deduct 1 ball and show "-1 ball ayrildi!" on screen for 2 full seconds!
      newStreak = 0;
      setStreak(0);
      setScore((prev) => Math.max(0, prev - 1));
      playWrong();

      setFeedback({
        isCorrect: false,
        pointsEarned: -1,
        streakBonus: 0,
      });

      setShowPenaltyModal(true);

      historyRef.current.push({
        problem: currentProblem,
        userAnswer: answer,
        isCorrect: false,
        timeTaken,
        pointsEarned: -1,
      });

      let livesDepleted = false;
      if (mode === 'survival') {
        setLives((prev) => {
          const updated = prev - 1;
          if (updated <= 0) {
            livesDepleted = true;
          }
          return updated;
        });
      }

      // Show the penalty for exactly 2 seconds (2000 ms) before proceeding
      const timer = setTimeout(() => {
        setShowPenaltyModal(false);
        if (hasFinishedRef.current) return;

        if (livesDepleted) {
          finishGame();
          return;
        }

        if (mode === 'classic' || mode === 'adventure') {
          if (questionIndex >= totalQuestions) {
            finishGame();
            return;
          }
        }

        const nextProblem = generateNextProblem(currentLevelNumber);
        setCurrentProblem(nextProblem);
        setQuestionIndex((prev) => prev + 1);
        setTimeRemaining(nextProblem.timeLimit);
        setIsAnswered(false);
        setSelectedAnswer(null);
        setNumpadInput('');
        setFeedback(null);
        questionStartTimeRef.current = Date.now();
      }, 2000);

      return () => clearTimeout(timer);
    }
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
        if (isAnswered || showPenaltyModal) return prev;
        if (prev <= 1) {
          // Time expired for this question: trigger wrong answer penalty
          handleAnswer(-999999);
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
  }, [mode, isAnswered, showPenaltyModal, finishGame, handleAnswer]);

  // Keyboard shortcut listener for fast answering
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered || showPenaltyModal) return;

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
  }, [isAnswered, showPenaltyModal, inputMode, currentProblem, numpadInput, handleAnswer]);

  // Timer percentage for question
  const timePercent = Math.max(0, (timeRemaining / currentProblem.timeLimit) * 100);

  return (
    <div id="game-board-container" className="w-full max-w-2xl mx-auto px-4 py-4 sm:py-6 relative">
      {/* 2-Second Penalty Overlay Banner for Wrong Answers */}
      {showPenaltyModal && (
        <div
          id="penalty-alert-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl shadow-rose-950/80 animate-shake relative overflow-hidden">
            {/* Top 2-second countdown timer bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800">
              <div className="h-full bg-rose-500 animate-penalty-bar" />
            </div>

            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-rose-500/20 border-2 border-rose-500/60 flex items-center justify-center text-rose-400">
              <Frown className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>

            <div className="inline-block px-4 py-1.5 rounded-xl bg-rose-500 text-white font-black text-lg sm:text-xl shadow-lg mb-3 animate-bounce">
              -1 BALL AYRILDI!
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
              Javob Noto'g'ri!
            </h3>

            <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-slate-800 mb-3 text-left">
              <div className="text-xs text-slate-400 font-semibold mb-1">To'g'ri hisob:</div>
              <div className="text-lg font-mono font-black text-emerald-400">
                {currentProblem.expression} = {currentProblem.correctAnswer}
              </div>
              <div className="text-xs text-slate-300 mt-1">
                {currentProblem.explanation}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-rose-300/80">
              <Clock className="w-3.5 h-3.5" />
              <span>2 soniyadan keyin keyingi misol...</span>
            </div>
          </div>
        </div>
      )}

      {/* Top HUD Card */}
      <div
        className={`${
          equipped.theme.themeStyles?.hudBackground || 'bg-slate-800/95'
        } ${
          equipped.theme.themeStyles?.hudBorder || 'border-slate-700/80'
        } border rounded-2xl p-3.5 sm:p-4 shadow-xl mb-3`}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Question Counter or Mode Badge + Equipped Avatar */}
          <div className="flex items-center gap-2.5">
            <button
              id="btn-exit-game"
              onClick={() => {
                playClick();
                stopCurrentSong();
                onExit();
              }}
              title="Chiqish"
              className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Avatar Badge */}
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl">{equipped.avatar.avatarData?.emoji || '🤖'}</span>
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

      {/* 5-Second Alternating Song Banner (Active when answered correctly) */}
      {activeSong && (
        <div
          id="active-song-banner"
          className="mb-3 bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-amber-900/80 border border-purple-500/50 rounded-2xl p-2.5 sm:p-3 shadow-lg shadow-purple-950/40 relative overflow-hidden animate-fade-in"
        >
          {/* 5s progress line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-purple-950">
            <div
              key={songProgressKey}
              className="h-full bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400 animate-song-bar"
            />
          </div>

          <div className="flex items-center justify-between gap-2 mt-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0 animate-bounce">{activeSong.emoji}</span>
              <div className="truncate">
                <div className="text-[10px] uppercase font-bold tracking-wider text-purple-300 flex items-center gap-1">
                  <Music className="w-3 h-3 text-amber-400" />
                  <span>5 soniyalik g'alaba qo'shig'i (#{activeSong.index}/5)</span>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-white truncate">
                  {activeSong.name}
                </div>
              </div>
            </div>

            {/* Moving Equalizer Bars */}
            <div className="flex items-end gap-1 h-5 shrink-0 px-2">
              <div className="w-1 bg-amber-400 rounded-full animate-eq-1" />
              <div className="w-1 bg-pink-400 rounded-full animate-eq-2" />
              <div className="w-1 bg-purple-400 rounded-full animate-eq-3" />
              <div className="w-1 bg-emerald-400 rounded-full animate-eq-4" />
            </div>
          </div>
        </div>
      )}

      {/* Main Math Card with Equipped Card Frame */}
      <div
        id="problem-display-card"
        className={`relative rounded-3xl p-6 sm:p-10 text-center transition-all duration-200 overflow-hidden ${
          feedback
            ? feedback.isCorrect
              ? 'bg-emerald-950/40 border-2 border-emerald-500/80 shadow-emerald-500/20 ring-4 ring-emerald-500/20'
              : 'bg-rose-950/40 border-2 border-rose-500/80 shadow-rose-500/20 ring-4 ring-rose-500/20 animate-shake'
            : `${equipped.cardFrame.cardStyles?.borderClass || 'border border-slate-700/80'} ${
                equipped.cardFrame.cardStyles?.glowShadowClass || 'shadow-2xl'
              } ${equipped.cardFrame.cardStyles?.innerCardBg || 'bg-slate-800/90'}`
        }`}
      >
        {/* Floating feedback score */}
        {feedback && (
          <div
            className={`absolute top-3 right-4 sm:top-4 sm:right-6 text-sm sm:text-base font-extrabold px-3.5 py-1.5 rounded-xl shadow-lg animate-fade-in ${
              feedback.isCorrect
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-rose-500 text-white'
            }`}
          >
            {feedback.isCorrect ? (
              <span>+{feedback.pointsEarned} Ball! {feedback.streakBonus > 0 && `(+${feedback.streakBonus} Combo)`}</span>
            ) : (
              <span>-1 Ball ayrildi!</span>
            )}
          </div>
        )}

        {/* Expression */}
        <div className="py-4 sm:py-6">
          <div className="text-4xl sm:text-6xl font-black text-white font-mono tracking-wider drop-shadow-md select-none">
            {currentProblem.expression} = <span className={equipped.cardFrame.cardStyles?.accentText || 'text-amber-400'}>?</span>
          </div>

          {/* Hint / Explanation when answered incorrectly */}
          {feedback && !feedback.isCorrect && (
            <div className="mt-4 p-3 bg-rose-950/70 border border-rose-800/80 rounded-xl text-rose-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>To'g'ri javob: {currentProblem.correctAnswer} — {currentProblem.explanation}</span>
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
          /* 4 Multiple Choice Buttons styled by equipped Button Skin */
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {currentProblem.options.map((option, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isChosen = selectedAnswer === option;
              const isCorrectAnswer = option === currentProblem.correctAnswer;

              let buttonClass = equipped.buttonStyle.buttonStyles?.baseClass || 'bg-slate-800/90 border-slate-700/80 text-white hover:border-amber-500/60 hover:bg-slate-700/60';

              if (isAnswered) {
                if (isCorrectAnswer) {
                  buttonClass = equipped.buttonStyle.buttonStyles?.correctClass || 'bg-emerald-600 border-emerald-400 text-white ring-4 ring-emerald-500/30';
                } else if (isChosen && !isCorrectAnswer) {
                  buttonClass = equipped.buttonStyle.buttonStyles?.wrongClass || 'bg-rose-600 border-rose-400 text-white';
                } else {
                  buttonClass = 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-40';
                }
              }

              return (
                <button
                  key={`${currentProblem.id}_opt_${idx}`}
                  id={`choice-btn-${idx}`}
                  disabled={isAnswered}
                  onClick={() => handleAnswer(option)}
                  className={`p-4 sm:p-5 rounded-2xl text-xl sm:text-2xl font-black font-mono transition-all duration-150 flex items-center justify-between shadow-lg ${buttonClass}`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg text-xs font-bold font-sans flex items-center justify-center ${
                      equipped.buttonStyle.buttonStyles?.indicatorClass || 'bg-slate-900/60 border border-slate-700 text-slate-400'
                    }`}
                  >
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


