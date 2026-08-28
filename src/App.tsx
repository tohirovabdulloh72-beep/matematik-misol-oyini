import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AdventureMap } from './components/AdventureMap';
import { ClassicModeSelector } from './components/ClassicModeSelector';
import { GameBoard } from './components/GameBoard';
import { ResultModal } from './components/ResultModal';
import { LeaderboardView } from './components/LeaderboardView';
import { SkinShopView } from './components/SkinShopView';
import { AnswerHistory, Difficulty, GameMode, InputMode, LevelConfig, Operation } from './types';
import {
  addLeaderboardScore,
  getAdventureLevels,
  getLeaderboard,
  getPlayerSkins,
  getPlayerStats,
  getSavedPlayerName,
  saveAdventureLevelResult,
  updatePlayerStats,
} from './utils/storage';
import { generateProblem } from './utils/mathGenerator';
import { getMuted, playClick, setMuted } from './utils/audio';
import { getEquippedSkins } from './utils/skinsData';

export default function App() {
  // Navigation & Screen View
  const [currentView, setCurrentView] = useState<'adventure' | 'selector' | 'game' | 'result' | 'leaderboard' | 'shop'>('adventure');

  // Stored state
  const [stats, setStats] = useState(() => getPlayerStats());
  const [skinsConfig, setSkinsConfig] = useState(() => getPlayerSkins());
  const [levels, setLevels] = useState(() => getAdventureLevels());
  const [leaderboard, setLeaderboard] = useState(() => getLeaderboard());
  const [isMutedState, setIsMutedState] = useState(() => getMuted());

  const equipped = getEquippedSkins(skinsConfig);

  // Active game settings
  const [activeGameConfig, setActiveGameConfig] = useState<{
    mode: GameMode;
    difficulty: Difficulty;
    operations: Operation[];
    questionsCount: number;
    inputMode: InputMode;
    currentLevelNumber?: number;
    targetScore?: number;
  }>({
    mode: 'adventure',
    difficulty: 'easy',
    operations: ['all'],
    questionsCount: 10,
    inputMode: 'choice',
  });

  // Game result for ResultModal
  const [gameResult, setGameResult] = useState<{
    score: number;
    history: AnswerHistory[];
    maxStreak: number;
    timeSpentSeconds: number;
    levelNumber?: number;
    targetScore?: number;
  } | null>(null);

  // Sync mute
  const handleToggleMute = () => {
    const nextMuted = !isMutedState;
    setIsMutedState(nextMuted);
    setMuted(nextMuted);
  };

  // Launch level from Adventure Map
  const handleSelectAdventureLevel = (level: LevelConfig) => {
    setActiveGameConfig({
      mode: 'adventure',
      difficulty: level.difficulty,
      operations: level.operations,
      questionsCount: level.questionsCount,
      inputMode: 'choice',
      currentLevelNumber: level.level,
      targetScore: level.targetScore,
    });
    setCurrentView('game');
  };

  // Launch game from Free Mode / Selector
  const handleStartClassicGame = (config: {
    mode: GameMode;
    difficulty: Difficulty;
    operations: Operation[];
    questionsCount: number;
    inputMode: InputMode;
  }) => {
    setActiveGameConfig({
      ...config,
      currentLevelNumber: undefined,
    });
    setCurrentView('game');
  };

  // Handle Game Over
  const handleGameOver = (results: {
    score: number;
    history: AnswerHistory[];
    maxStreak: number;
    timeSpentSeconds: number;
  }) => {
    const totalSolved = results.history.length;
    const totalCorrect = results.history.filter((h) => h.isCorrect).length;
    const accuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;

    // Update global player stats
    const updatedStats = updatePlayerStats(
      results.score,
      totalSolved,
      totalCorrect,
      results.maxStreak
    );
    setStats(updatedStats);

    // If adventure mode, update levels
    if (activeGameConfig.mode === 'adventure' && activeGameConfig.currentLevelNumber) {
      let stars = 0;
      if (accuracy >= 90 && results.score > 0) stars = 3;
      else if (accuracy >= 70 && results.score > 0) stars = 2;
      else if (accuracy >= 50 && results.score > 0) stars = 1;

      const { levels: updatedLevels } = saveAdventureLevelResult(
        activeGameConfig.currentLevelNumber,
        results.score,
        stars
      );
      setLevels(updatedLevels);
      setStats(getPlayerStats());
    }

    // Add to leaderboard if score > 0
    if (results.score > 0) {
      const playerName = getSavedPlayerName();
      const updatedLeaderboard = addLeaderboardScore({
        playerName,
        score: results.score,
        mode: activeGameConfig.mode,
        difficulty: activeGameConfig.difficulty,
        accuracy,
      });
      setLeaderboard(updatedLeaderboard);
    }

    setGameResult({
      ...results,
      levelNumber: activeGameConfig.currentLevelNumber,
      targetScore: activeGameConfig.targetScore,
    });
    setCurrentView('result');
  };

  // Helper generator for GameBoard
  const problemGenerator = (levelNum?: number) => {
    return generateProblem(
      activeGameConfig.difficulty,
      activeGameConfig.operations,
      levelNum || 1
    );
  };

  // Next level handler
  const handleNextLevel = () => {
    if (activeGameConfig.currentLevelNumber) {
      const nextLvlNum = activeGameConfig.currentLevelNumber + 1;
      const nextLevel = levels.find((l) => l.level === nextLvlNum);
      if (nextLevel && nextLevel.unlocked) {
        handleSelectAdventureLevel(nextLevel);
        return;
      }
    }
    setCurrentView('adventure');
  };

  const hasNextLevel =
    activeGameConfig.mode === 'adventure' &&
    activeGameConfig.currentLevelNumber !== undefined &&
    activeGameConfig.currentLevelNumber < levels.length;

  return (
    <div
      className={`min-h-screen ${
        equipped.theme.themeStyles?.appBackground || 'bg-slate-950'
      } text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-500`}
    >
      {/* Header */}
      <Header
        stats={stats}
        skinsConfig={skinsConfig}
        currentView={currentView}
        gameMode={activeGameConfig.mode}
        isPlaying={currentView === 'game'}
        isMuted={isMutedState}
        onToggleMute={handleToggleMute}
        onNavigate={(view) => setCurrentView(view)}
        onLogoClick={() => setCurrentView('adventure')}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-start items-center pb-12">
        {currentView === 'adventure' && (
          <AdventureMap
            levels={levels}
            onSelectLevel={handleSelectAdventureLevel}
            onOpenShop={() => setCurrentView('shop')}
          />
        )}

        {currentView === 'selector' && (
          <ClassicModeSelector onStartGame={handleStartClassicGame} />
        )}

        {currentView === 'shop' && (
          <SkinShopView
            stats={stats}
            skinsConfig={skinsConfig}
            onStatsUpdated={(newStats) => setStats(newStats)}
            onSkinsUpdated={(newSkins) => setSkinsConfig(newSkins)}
            onPlayGame={() => setCurrentView('adventure')}
          />
        )}

        {currentView === 'game' && (
          <GameBoard
            key={`game_${activeGameConfig.mode}_${activeGameConfig.currentLevelNumber || 0}_${Date.now()}`}
            mode={activeGameConfig.mode}
            difficulty={activeGameConfig.difficulty}
            currentLevelNumber={activeGameConfig.currentLevelNumber}
            totalQuestions={activeGameConfig.questionsCount}
            inputMode={activeGameConfig.inputMode}
            skinsConfig={skinsConfig}
            onGameOver={handleGameOver}
            onExit={() => {
              playClick();
              setCurrentView(activeGameConfig.mode === 'adventure' ? 'adventure' : 'selector');
            }}
            generateNextProblem={problemGenerator}
          />
        )}

        {currentView === 'result' && gameResult && (
          <ResultModal
            score={gameResult.score}
            history={gameResult.history}
            maxStreak={gameResult.maxStreak}
            timeSpentSeconds={gameResult.timeSpentSeconds}
            mode={activeGameConfig.mode}
            difficulty={activeGameConfig.difficulty}
            levelNumber={gameResult.levelNumber}
            targetScore={gameResult.targetScore}
            onPlayAgain={() => setCurrentView('game')}
            onNextLevel={handleNextLevel}
            onGoHome={() => setCurrentView('adventure')}
            onOpenShop={() => setCurrentView('shop')}
            hasNextLevel={hasNextLevel}
          />
        )}

        {currentView === 'leaderboard' && (
          <LeaderboardView
            stats={stats}
            leaderboard={leaderboard}
            onPlayerNameUpdated={() => {
              setStats(getPlayerStats());
              setLeaderboard(getLeaderboard());
            }}
          />
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 border-t border-slate-900/80">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Matematika O'yini — Aqliy hisob va xotira mashqi</span>
          <button
            onClick={() => {
              playClick();
              setCurrentView('shop');
            }}
            className="hover:text-amber-400 underline transition-colors"
          >
            🎨 Skinlar va Uslublar Do'koni
          </button>
        </div>
      </footer>
    </div>
  );
}

