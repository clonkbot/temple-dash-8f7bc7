import { useEffect, useState } from 'react';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  coins: number;
  onRestart: () => void;
  onMenu: () => void;
}

export default function GameOverScreen({
  score,
  highScore,
  coins,
  onRestart,
  onMenu,
}: GameOverScreenProps) {
  const [mounted, setMounted] = useState(false);
  const isNewHighScore = score === highScore && score > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 relative">
      {/* Blood red vignette for dramatic effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#ff3366]/20 pointer-events-none" />

      {/* Shattered effect particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#ff3366]"
            style={{
              left: `${40 + Math.random() * 20}%`,
              top: `${30 + Math.random() * 20}%`,
              opacity: mounted ? 0 : 0.8,
              transform: mounted
                ? `translate(${(Math.random() - 0.5) * 200}px, ${(Math.random() - 0.5) * 200}px) rotate(${Math.random() * 360}deg)`
                : 'translate(0, 0)',
              transition: `all ${0.5 + Math.random() * 0.5}s ease-out`,
            }}
          />
        ))}
      </div>

      {/* Game Over Title */}
      <div
        className={`transition-all duration-700 ${
          mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-150'
        }`}
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#ff3366] to-[#cc1144]">
          GAME OVER
        </h1>
        {/* Glow */}
        <div className="absolute inset-0 text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-[#ff3366] opacity-30 blur-lg -z-10">
          GAME OVER
        </div>
      </div>

      {/* New High Score Badge */}
      {isNewHighScore && (
        <div
          className={`mt-4 transition-all duration-700 delay-300 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
          }`}
        >
          <div className="bg-gradient-to-r from-[#ffd700] to-[#ff9500] text-[#0a0e0a] font-bold text-sm tracking-wider px-4 py-1 rounded-full animate-pulse">
            NEW HIGH SCORE!
          </div>
        </div>
      )}

      {/* Stats */}
      <div
        className={`mt-8 md:mt-12 grid grid-cols-2 gap-4 md:gap-6 transition-all duration-700 delay-500 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Score */}
        <div className="bg-[#1a1a14] border border-[#3a3a2a] rounded-2xl px-6 py-4 text-center">
          <p className="text-[#6a6a5a] text-xs tracking-wider uppercase">Score</p>
          <p className="text-[#00ffcc] text-3xl md:text-4xl font-bold mt-1">{score.toLocaleString()}</p>
        </div>

        {/* Best */}
        <div className="bg-[#1a1a14] border border-[#3a3a2a] rounded-2xl px-6 py-4 text-center">
          <p className="text-[#6a6a5a] text-xs tracking-wider uppercase">Best</p>
          <p className="text-[#ffd700] text-3xl md:text-4xl font-bold mt-1">{highScore.toLocaleString()}</p>
        </div>

        {/* Coins collected */}
        <div className="col-span-2 bg-[#1a1a14] border border-[#3a3a2a] rounded-2xl px-6 py-4 flex items-center justify-center gap-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffd700] to-[#daa520] border-2 border-[#b8860b] flex-shrink-0" />
          <div className="text-center">
            <p className="text-[#6a6a5a] text-xs tracking-wider uppercase">Coins Collected</p>
            <p className="text-[#ffd700] text-2xl font-bold">{coins}</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div
        className={`mt-8 md:mt-12 flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Restart */}
        <button
          onClick={onRestart}
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#00ffcc] to-[#00cc99] rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
          <div className="relative bg-gradient-to-r from-[#00ffcc] to-[#00cc99] text-[#0a0e0a] font-bold text-base md:text-lg tracking-wider px-8 md:px-12 py-3 md:py-4 rounded-xl transform group-hover:scale-105 group-active:scale-95 transition-transform">
            PLAY AGAIN
          </div>
        </button>

        {/* Menu */}
        <button
          onClick={onMenu}
          className="group relative"
        >
          <div className="relative bg-transparent border-2 border-[#4a4a3a] text-[#8a8a7a] font-bold text-base md:text-lg tracking-wider px-8 md:px-12 py-3 md:py-4 rounded-xl transform group-hover:scale-105 group-hover:border-[#6a6a5a] group-hover:text-[#aaa99a] group-active:scale-95 transition-all">
            MENU
          </div>
        </button>
      </div>

      {/* Tip */}
      <p
        className={`mt-8 text-[#4a4a3a] text-xs md:text-sm text-center max-w-xs transition-all duration-700 delay-[900ms] ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Tip: Jump over barriers and pits, slide under low obstacles!
      </p>

      <style>{`
        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}
