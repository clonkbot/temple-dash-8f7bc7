import { useState, useEffect, useCallback, useRef } from 'react';

interface GameProps {
  onGameOver: (score: number, coins: number) => void;
}

type Lane = -1 | 0 | 1;
type PlayerState = 'running' | 'jumping' | 'sliding';

interface Obstacle {
  id: number;
  lane: Lane;
  type: 'barrier' | 'low' | 'pit';
  z: number;
}

interface Coin {
  id: number;
  lane: Lane;
  z: number;
  collected: boolean;
}

const LANE_WIDTH = 80;
const TRACK_LENGTH = 2000;
const OBSTACLE_SPAWN_DISTANCE = 1800;
const SPAWN_INTERVAL = 800;

export default function Game({ onGameOver }: GameProps) {
  const [lane, setLane] = useState<Lane>(0);
  const [playerState, setPlayerState] = useState<PlayerState>('running');
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [speed, setSpeed] = useState(12);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [coinItems, setCoinItems] = useState<Coin[]>([]);
  const [distance, setDistance] = useState(0);
  const [isGameActive, setIsGameActive] = useState(true);

  const gameRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const obstacleIdRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGameActive) return;

      switch (e.key) {
        case 'ArrowLeft':
          setLane(l => Math.max(-1, l - 1) as Lane);
          break;
        case 'ArrowRight':
          setLane(l => Math.min(1, l + 1) as Lane);
          break;
        case 'ArrowUp':
          if (playerState === 'running') {
            setPlayerState('jumping');
            setTimeout(() => setPlayerState('running'), 600);
          }
          break;
        case 'ArrowDown':
          if (playerState === 'running') {
            setPlayerState('sliding');
            setTimeout(() => setPlayerState('running'), 500);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameActive, playerState]);

  // Handle touch input
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || !isGameActive) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const minSwipe = 30;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > minSwipe) {
        setLane(l => Math.min(1, l + 1) as Lane);
      } else if (deltaX < -minSwipe) {
        setLane(l => Math.max(-1, l - 1) as Lane);
      }
    } else {
      // Vertical swipe
      if (deltaY < -minSwipe && playerState === 'running') {
        setPlayerState('jumping');
        setTimeout(() => setPlayerState('running'), 600);
      } else if (deltaY > minSwipe && playerState === 'running') {
        setPlayerState('sliding');
        setTimeout(() => setPlayerState('running'), 500);
      }
    }

    touchStartRef.current = null;
  }, [isGameActive, playerState]);

  // Spawn obstacles and coins
  const spawnObjects = useCallback(() => {
    const now = Date.now();
    if (now - lastSpawnRef.current < SPAWN_INTERVAL) return;
    lastSpawnRef.current = now;

    // Spawn obstacle
    if (Math.random() < 0.7) {
      const obstacleTypes: Array<'barrier' | 'low' | 'pit'> = ['barrier', 'low', 'pit'];
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const obstacleLane = (Math.floor(Math.random() * 3) - 1) as Lane;

      setObstacles(prev => [...prev, {
        id: obstacleIdRef.current++,
        lane: obstacleLane,
        type,
        z: OBSTACLE_SPAWN_DISTANCE,
      }]);
    }

    // Spawn coins
    if (Math.random() < 0.6) {
      const coinLane = (Math.floor(Math.random() * 3) - 1) as Lane;
      setCoinItems(prev => [...prev, {
        id: obstacleIdRef.current++,
        lane: coinLane,
        z: OBSTACLE_SPAWN_DISTANCE,
        collected: false,
      }]);
    }
  }, []);

  // Game loop
  useEffect(() => {
    if (!isGameActive) return;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = Math.min((timestamp - lastTimeRef.current) / 16, 2);
      lastTimeRef.current = timestamp;

      // Update distance and score
      setDistance(d => d + speed * deltaTime);
      setScore(s => s + Math.floor(speed * deltaTime * 0.1));

      // Gradually increase speed
      setSpeed(s => Math.min(25, s + 0.001 * deltaTime));

      // Spawn new objects
      spawnObjects();

      // Update obstacles
      setObstacles(prev => {
        const updated = prev
          .map(obs => ({ ...obs, z: obs.z - speed * deltaTime * 2 }))
          .filter(obs => obs.z > -100);

        // Check collisions
        for (const obs of updated) {
          if (obs.z < 80 && obs.z > 20 && obs.lane === lane) {
            // Check if player can avoid
            if (obs.type === 'barrier' && playerState !== 'jumping') {
              setIsGameActive(false);
              return updated;
            }
            if (obs.type === 'low' && playerState !== 'sliding' && playerState !== 'jumping') {
              setIsGameActive(false);
              return updated;
            }
            if (obs.type === 'pit' && playerState !== 'jumping') {
              setIsGameActive(false);
              return updated;
            }
          }
        }

        return updated;
      });

      // Update coins
      setCoinItems(prev => {
        return prev
          .map(coin => {
            const updated = { ...coin, z: coin.z - speed * deltaTime * 2 };
            // Check collection
            if (!coin.collected && updated.z < 100 && updated.z > 20 && coin.lane === lane) {
              setCoins(c => c + 1);
              return { ...updated, collected: true };
            }
            return updated;
          })
          .filter(coin => coin.z > -100 && !coin.collected);
      });

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isGameActive, lane, playerState, speed, spawnObjects]);

  // Handle game over
  useEffect(() => {
    if (!isGameActive) {
      setTimeout(() => onGameOver(score, coins), 500);
    }
  }, [isGameActive, score, coins, onGameOver]);

  const getLaneX = (l: Lane) => l * LANE_WIDTH;

  return (
    <div
      ref={gameRef}
      className="h-[100dvh] w-full overflow-hidden relative select-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1a0a] via-[#0a0e0a] to-[#1a1a0a]" />

      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 50}%`,
              opacity: 0.3 + Math.random() * 0.5,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Track perspective container */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[70%]"
        style={{
          perspective: '800px',
          perspectiveOrigin: '50% 30%',
        }}
      >
        {/* Track */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 origin-bottom"
          style={{
            width: `${LANE_WIDTH * 3 + 40}px`,
            height: '200%',
            transform: 'rotateX(70deg)',
            background: `
              linear-gradient(90deg,
                transparent 0%,
                rgba(45,42,36,0.8) 10%,
                rgba(45,42,36,1) 20%,
                rgba(45,42,36,1) 80%,
                rgba(45,42,36,0.8) 90%,
                transparent 100%
              )
            `,
          }}
        >
          {/* Lane dividers */}
          <div className="absolute inset-0 flex justify-center">
            <div className="w-px h-full bg-[#4a4a3a] opacity-50" style={{ marginRight: `${LANE_WIDTH - 1}px` }} />
            <div className="w-px h-full bg-[#4a4a3a] opacity-50" style={{ marginLeft: `${LANE_WIDTH - 1}px` }} />
          </div>

          {/* Animated track lines */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 50px,
                rgba(255,215,0,0.1) 50px,
                rgba(255,215,0,0.1) 52px
              )`,
              animation: 'trackMove 0.3s linear infinite',
            }}
          />
        </div>

        {/* Obstacles */}
        {obstacles.map(obs => (
          <div
            key={obs.id}
            className="absolute left-1/2 bottom-[15%]"
            style={{
              transform: `
                translateX(calc(-50% + ${getLaneX(obs.lane)}px))
                translateZ(${obs.z}px)
                scale(${Math.max(0.1, 1 - obs.z / TRACK_LENGTH)})
              `,
              opacity: Math.max(0, Math.min(1, (TRACK_LENGTH - obs.z) / 500)),
            }}
          >
            {obs.type === 'barrier' && (
              <div className="w-16 h-20 bg-gradient-to-t from-[#8b4513] to-[#a0522d] rounded-t-lg border-2 border-[#654321] shadow-lg relative">
                <div className="absolute inset-2 bg-[#654321] opacity-50 rounded" />
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#ff3366] rounded-full animate-pulse" />
              </div>
            )}
            {obs.type === 'low' && (
              <div className="w-20 h-8 bg-gradient-to-r from-[#4a3728] via-[#5c4033] to-[#4a3728] rounded border-2 border-[#3a2718] relative">
                <div className="absolute inset-0 flex justify-around items-center">
                  <div className="w-1 h-full bg-[#2a1708]" />
                  <div className="w-1 h-full bg-[#2a1708]" />
                  <div className="w-1 h-full bg-[#2a1708]" />
                </div>
              </div>
            )}
            {obs.type === 'pit' && (
              <div className="w-16 h-4 bg-black rounded-full shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a0a] to-black" />
                <div className="absolute inset-1 bg-[#ff3366] opacity-20 blur-sm animate-pulse" />
              </div>
            )}
          </div>
        ))}

        {/* Coins */}
        {coinItems.map(coin => (
          <div
            key={coin.id}
            className="absolute left-1/2 bottom-[20%]"
            style={{
              transform: `
                translateX(calc(-50% + ${getLaneX(coin.lane)}px))
                translateZ(${coin.z}px)
                scale(${Math.max(0.1, 1 - coin.z / TRACK_LENGTH)})
              `,
              opacity: coin.collected ? 0 : Math.max(0, Math.min(1, (TRACK_LENGTH - coin.z) / 500)),
              transition: coin.collected ? 'opacity 0.2s' : 'none',
            }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffd700] via-[#ffec8b] to-[#daa520] border-2 border-[#b8860b] shadow-lg animate-spin-slow relative">
              <div className="absolute inset-1 rounded-full bg-gradient-to-tl from-transparent to-white opacity-30" />
            </div>
          </div>
        ))}

        {/* Player */}
        <div
          className="absolute left-1/2 bottom-[12%] transition-all duration-150 ease-out"
          style={{
            transform: `translateX(calc(-50% + ${getLaneX(lane)}px))`,
          }}
        >
          <div
            className={`relative transition-transform duration-200 ${
              playerState === 'jumping' ? '-translate-y-20 scale-90' : ''
            } ${
              playerState === 'sliding' ? 'scale-y-50 translate-y-4' : ''
            }`}
          >
            {/* Player glow */}
            <div className="absolute -inset-4 bg-[#00ffcc] rounded-full blur-xl opacity-30" />

            {/* Player body */}
            <div className="relative w-12 h-16 md:w-14 md:h-20">
              {/* Torso */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-10 bg-gradient-to-b from-[#2d4a2d] to-[#1a2e1a] rounded-t-lg" />

              {/* Head */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-b from-[#d4a574] to-[#b8956e] rounded-full">
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-[#1a1a1a] rounded-full" />
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#1a1a1a] rounded-full" />
              </div>

              {/* Legs animation */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1">
                <div
                  className="w-2 h-5 bg-[#1a2e1a] rounded-b origin-top"
                  style={{ animation: playerState === 'running' ? 'runLeft 0.3s ease-in-out infinite' : 'none' }}
                />
                <div
                  className="w-2 h-5 bg-[#1a2e1a] rounded-b origin-top"
                  style={{ animation: playerState === 'running' ? 'runRight 0.3s ease-in-out infinite' : 'none' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10">
        {/* Score */}
        <div className="bg-[#0a0e0a]/80 backdrop-blur-sm border border-[#3a3a2a] rounded-xl px-4 py-2">
          <p className="text-[#6a6a5a] text-[10px] tracking-wider uppercase">Score</p>
          <p className="text-[#00ffcc] text-xl md:text-2xl font-bold tabular-nums">{score.toLocaleString()}</p>
        </div>

        {/* Coins */}
        <div className="bg-[#0a0e0a]/80 backdrop-blur-sm border border-[#3a3a2a] rounded-xl px-4 py-2 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#ffd700] to-[#daa520] border border-[#b8860b]" />
          <p className="text-[#ffd700] text-xl md:text-2xl font-bold tabular-nums">{coins}</p>
        </div>
      </div>

      {/* Speed indicator */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-[#0a0e0a]/60 backdrop-blur-sm border border-[#3a3a2a] rounded-lg px-3 py-1">
          <p className="text-[#ff9500] text-xs font-mono">{Math.floor(speed * 10)} km/h</p>
        </div>
      </div>

      <style>{`
        @keyframes trackMove {
          0% { background-position: 0 0; }
          100% { background-position: 0 52px; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        @keyframes runLeft {
          0%, 100% { transform: rotateX(30deg); }
          50% { transform: rotateX(-30deg); }
        }
        @keyframes runRight {
          0%, 100% { transform: rotateX(-30deg); }
          50% { transform: rotateX(30deg); }
        }
        .animate-spin-slow {
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}
