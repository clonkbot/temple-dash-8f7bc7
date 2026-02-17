import { useEffect, useState } from 'react';

interface StartScreenProps {
  onStart: () => void;
  highScore: number;
}

export default function StartScreen({ onStart, highScore }: StartScreenProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 relative">
      {/* Animated temple pillars background */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0 bg-gradient-to-t from-[#2d2a24] to-transparent"
            style={{
              left: `${i * 14}%`,
              width: '40px',
              height: `${40 + Math.random() * 40}%`,
              animation: `pillarGlow ${2 + i * 0.3}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#ffd700] rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Title */}
      <div
        className={`transition-all duration-1000 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
        }`}
      >
        <div className="relative">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] via-[#ff9500] to-[#ff6600] drop-shadow-2xl">
            TEMPLE
          </h1>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#00ffcc] via-[#00cc99] to-[#009966] -mt-2 md:-mt-4">
            DASH
          </h1>
          {/* Glow effect */}
          <div className="absolute inset-0 text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-[#ffd700] opacity-30 blur-lg -z-10">
            TEMPLE
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <p
        className={`mt-4 md:mt-6 text-[#8a8a7a] text-sm md:text-base tracking-[0.3em] uppercase transition-all duration-1000 delay-300 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        Endless Runner
      </p>

      {/* High Score */}
      {highScore > 0 && (
        <div
          className={`mt-6 md:mt-8 transition-all duration-1000 delay-500 ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <div className="bg-[#1a1a14] border border-[#3a3a2a] rounded-xl px-6 py-3">
            <p className="text-[#6a6a5a] text-xs tracking-wider uppercase">Best Run</p>
            <p className="text-[#ffd700] text-2xl md:text-3xl font-bold mt-1">{highScore.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={onStart}
        className={`mt-8 md:mt-12 group relative transition-all duration-1000 delay-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#ffd700] to-[#ff9500] rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
        <div className="relative bg-gradient-to-r from-[#ffd700] to-[#ff9500] text-[#0a0e0a] font-bold text-lg md:text-xl tracking-wider px-12 md:px-16 py-4 md:py-5 rounded-2xl transform group-hover:scale-105 group-active:scale-95 transition-transform">
          TAP TO RUN
        </div>
      </button>

      {/* Instructions */}
      <div
        className={`mt-8 md:mt-12 text-center transition-all duration-1000 delay-[900ms] ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        <p className="text-[#5a5a4a] text-xs md:text-sm tracking-wide">Swipe or use arrow keys</p>
        <div className="flex gap-6 md:gap-8 mt-4 justify-center">
          <div className="text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 border border-[#3a3a2a] rounded-lg flex items-center justify-center text-[#8a8a7a] text-lg">
              ←→
            </div>
            <p className="text-[#4a4a3a] text-[10px] md:text-xs mt-1">Move</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 border border-[#3a3a2a] rounded-lg flex items-center justify-center text-[#8a8a7a] text-lg">
              ↑
            </div>
            <p className="text-[#4a4a3a] text-[10px] md:text-xs mt-1">Jump</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 border border-[#3a3a2a] rounded-lg flex items-center justify-center text-[#8a8a7a] text-lg">
              ↓
            </div>
            <p className="text-[#4a4a3a] text-[10px] md:text-xs mt-1">Slide</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pillarGlow {
          0% { opacity: 0.1; }
          100% { opacity: 0.3; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
