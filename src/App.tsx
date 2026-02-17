import { useState, useEffect, useCallback, useRef } from 'react';
import Game from './components/Game';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';

export type GameState = 'start' | 'playing' | 'gameOver';

function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('templeRunHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [coins, setCoins] = useState(0);

  const handleStart = useCallback(() => {
    setScore(0);
    setCoins(0);
    setGameState('playing');
  }, []);

  const handleGameOver = useCallback((finalScore: number, collectedCoins: number) => {
    setScore(finalScore);
    setCoins(collectedCoins);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('templeRunHighScore', finalScore.toString());
    }
    setGameState('gameOver');
  }, [highScore]);

  const handleRestart = useCallback(() => {
    handleStart();
  }, [handleStart]);

  const handleMenu = useCallback(() => {
    setGameState('start');
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#0a0e0a] overflow-hidden relative flex flex-col">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00ffcc] opacity-5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#ffd700] opacity-5 blur-[120px] rounded-full" />
      </div>

      <main className="flex-1 relative z-10">
        {gameState === 'start' && (
          <StartScreen onStart={handleStart} highScore={highScore} />
        )}
        {gameState === 'playing' && (
          <Game onGameOver={handleGameOver} />
        )}
        {gameState === 'gameOver' && (
          <GameOverScreen
            score={score}
            highScore={highScore}
            coins={coins}
            onRestart={handleRestart}
            onMenu={handleMenu}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-3 text-center">
        <p className="text-[10px] md:text-xs text-[#4a4a3a] tracking-wider font-light">
          Requested by <span className="text-[#5a5a4a]">@plantingtoearn</span> · Built by <span className="text-[#5a5a4a]">@clonkbot</span>
        </p>
      </footer>
    </div>
  );
}

export default App;
