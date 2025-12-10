'use client';

import { useEffect, useState, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE_SPEED = 150;

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export default function PacManGame() {
  const [pacman, setPacman] = useState<Position>({ x: 10, y: 10 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
  const [dots, setDots] = useState<Position[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [ghosts, setGhosts] = useState<Position[]>([
    { x: 5, y: 5 },
    { x: 15, y: 5 },
    { x: 5, y: 15 },
    { x: 15, y: 15 }
  ]);

  // Initialize dots
  useEffect(() => {
    const initialDots: Position[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (Math.random() > 0.3) {
          initialDots.push({ x, y });
        }
      }
    }
    setDots(initialDots);
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (direction !== 'DOWN') setNextDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
          if (direction !== 'UP') setNextDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
          if (direction !== 'RIGHT') setNextDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
          if (direction !== 'LEFT') setNextDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameOver]);

  // Move ghosts
  useEffect(() => {
    if (gameOver) return;

    const ghostInterval = setInterval(() => {
      setGhosts(prevGhosts =>
        prevGhosts.map(ghost => {
          const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
          const randomDir = directions[Math.floor(Math.random() * directions.length)];
          
          let newX = ghost.x;
          let newY = ghost.y;

          switch (randomDir) {
            case 'UP':
              newY = Math.max(0, ghost.y - 1);
              break;
            case 'DOWN':
              newY = Math.min(GRID_SIZE - 1, ghost.y + 1);
              break;
            case 'LEFT':
              newX = Math.max(0, ghost.x - 1);
              break;
            case 'RIGHT':
              newX = Math.min(GRID_SIZE - 1, ghost.x + 1);
              break;
          }

          return { x: newX, y: newY };
        })
      );
    }, 300);

    return () => clearInterval(ghostInterval);
  }, [gameOver]);

  // Game loop
  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      setDirection(nextDirection);

      setPacman(prev => {
        let newX = prev.x;
        let newY = prev.y;

        switch (nextDirection) {
          case 'UP':
            newY = prev.y - 1;
            break;
          case 'DOWN':
            newY = prev.y + 1;
            break;
          case 'LEFT':
            newX = prev.x - 1;
            break;
          case 'RIGHT':
            newX = prev.x + 1;
            break;
        }

        // Wrap around edges
        if (newX < 0) newX = GRID_SIZE - 1;
        if (newX >= GRID_SIZE) newX = 0;
        if (newY < 0) newY = GRID_SIZE - 1;
        if (newY >= GRID_SIZE) newY = 0;

        // Check collision with ghosts
        const hitGhost = ghosts.some(ghost => ghost.x === newX && ghost.y === newY);
        if (hitGhost) {
          setGameOver(true);
        }

        // Check if eating a dot
        const dotIndex = dots.findIndex(dot => dot.x === newX && dot.y === newY);
        if (dotIndex !== -1) {
          setDots(prev => prev.filter((_, i) => i !== dotIndex));
          setScore(prev => prev + 10);
        }

        return { x: newX, y: newY };
      });
    }, INITIAL_SNAKE_SPEED);

    return () => clearInterval(gameLoop);
  }, [nextDirection, gameOver, dots, ghosts]);

  const resetGame = () => {
    setPacman({ x: 10, y: 10 });
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setScore(0);
    setGameOver(false);
    setGhosts([
      { x: 5, y: 5 },
      { x: 15, y: 5 },
      { x: 5, y: 15 },
      { x: 15, y: 15 }
    ]);
    
    const initialDots: Position[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (Math.random() > 0.3) {
          initialDots.push({ x, y });
        }
      }
    }
    setDots(initialDots);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="mb-4 text-center">
        <h1 className="text-4xl font-bold text-yellow-400 mb-2">PAC-MAN</h1>
        <div className="text-white text-xl">Score: {score}</div>
        {dots.length === 0 && !gameOver && (
          <div className="text-green-400 text-2xl mt-2">YOU WIN! 🎉</div>
        )}
      </div>

      <div
        className="relative bg-blue-900 border-4 border-blue-600"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
        }}
      >
        {/* Dots */}
        {dots.map((dot, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              left: dot.x * CELL_SIZE + CELL_SIZE / 2 - 2,
              top: dot.y * CELL_SIZE + CELL_SIZE / 2 - 2,
              width: 4,
              height: 4,
            }}
          />
        ))}

        {/* Pac-Man */}
        <div
          className="absolute bg-yellow-400 rounded-full transition-all duration-100"
          style={{
            left: pacman.x * CELL_SIZE,
            top: pacman.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
          }}
        />

        {/* Ghosts */}
        {ghosts.map((ghost, i) => (
          <div
            key={i}
            className="absolute rounded-t-full transition-all duration-100"
            style={{
              left: ghost.x * CELL_SIZE,
              top: ghost.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: ['#FF0000', '#FFB8FF', '#00FFFF', '#FFB852'][i],
            }}
          />
        ))}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center">
            <div className="text-red-500 text-3xl font-bold mb-4">GAME OVER</div>
            <div className="text-white text-xl mb-4">Final Score: {score}</div>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 transition-colors"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-white text-center">
        <div className="text-sm">Use Arrow Keys or WASD to move</div>
        <div className="text-xs text-gray-400 mt-2">Eat all dots and avoid the ghosts!</div>
      </div>
    </div>
  );
}

