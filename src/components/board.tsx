import { CSSProperties, useEffect, useState } from "react";


interface Blast {
  dx: number;
  dy: number;
  rot: number;
  delay: number;
}

interface ConfettiPiece {
  id: number;
  dx: number;
  dy: number;
  rot: number;
  color: string;
  size: number;
  shape: string;
  delay: number;
  duration: number;
}

interface SquareProps {
  value: String | null;
  onSquareClick: () => void;
  blast: Blast | null | undefined;
}

// Extend CSSProperties to allow the custom CSS variables we set inline.
interface BlastStyle extends CSSProperties {
  "--dx"?: string;
  "--dy"?: string;
  "--rot"?: string;
}

interface ConfettiStyle extends CSSProperties {
  "--dx"?: string;
  "--dy"?: string;
  "--rot"?: string;
  "--dur"?: string;
}

export function Square({ value, onSquareClick, blast }: SquareProps) {
  const style: BlastStyle | undefined = blast
    ? {
        "--dx": `${blast.dx}px`,
        "--dy": `${blast.dy}px`,
        "--rot": `${blast.rot}deg`,
        animationDelay: `${blast.delay}s`,
      }
    : undefined;

  return (
    <button
      className={`square${blast ? " blasting" : ""}${value ? ` filled-${value}` : ""}`}
      style={style}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

export function makeConfetti(): ConfettiPiece[] {
  const colors = ["#000000", "#fb5607", "#ff006e", "#8338ec", "#3a86ff", "#06d6a0"];
  return Array.from({ length: 60 }).map((_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 160 + Math.random() * 220;
    return {
      id: i,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - 60,
      rot: Math.random() * 900 - 450,
      color: colors[i % colors.length],
      size: 5 + Math.random() * 9,
      shape: Math.random() > 0.5 ? "50%" : "2px",
      delay: Math.random() * 0.15,
      duration: 0.9 + Math.random() * 0.6,
    };
  });
}

export default function Board() {
  const [squares, setSquares] = useState<String[]>(Array(9).fill(null));
  const [exploding, setExploding] = useState<boolean>(false);
  const [useConfetti, setUseConfetti] = useState<boolean>(false);
  const [blasts, setBlasts] = useState<Blast[]>([]);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  const isFull = squares.every((s) => s !== null);

  let status: string;
  


  function makeSquareBlasts(): Blast[] {
    // one outward vector per board cell (index 0-8), based on its position
    // relative to the center cell, so the board reads as shattering apart.
    return Array.from({ length: 9 }).map((_, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const baseDx = (col - 1) * (140 + Math.random() * 60);
      const baseDy = (row - 1) * (140 + Math.random() * 60);
      return {
        dx: baseDx + (Math.random() * 40 - 20),
        dy: baseDy + (Math.random() * 40 - 20),
        rot: Math.random() * 480 - 240,
        delay: Math.random() * 0.1,
      };
    });
  }

  useEffect(() => {
    if (exploding) {
      setBlasts(makeSquareBlasts());
      setConfetti(makeConfetti());
      setExploding(true);
    }
  }, [exploding]);

  function handleClick(i: number) {
    if (squares[i] ) return;
    const next = squares.slice();
    next[i] = "X"
    setSquares(next);
  }

  function handleReset() {
    setSquares(Array(9).fill(null));
    setExploding(false);
    setUseConfetti(false)
    setBlasts([]);
    setConfetti([]);
  }
  function handleExplode() {
    setBlasts(makeSquareBlasts());
      setConfetti(makeConfetti());
      setExploding(true);
      setUseConfetti(true)
  }

  function handleConfetti() {
      //setBlasts(makeSquareBlasts());
      setConfetti(makeConfetti());
      setUseConfetti(true)
      //setExploding(true);
  }

  return (
    <div className="game">
      <div className="board-panel">
        <div className={`status`}>You Win</div>
         <div className={`status-win`}>You Win</div>

        <div className={`board-wrap${exploding ? " exploding" : ""}`}>
          {[0, 1, 2].map((row) => (
            <div className="board-row" key={row}>
              {[0, 1, 2].map((col) => {
                const i = row * 3 + col;
                return (
                  <Square
                    key={i}
                    value={squares[i]}
                    onSquareClick={() => handleClick(i)}
                    blast={exploding ? blasts[i] : null}
                  />
                );
              })}
            </div>
          ))}

          {useConfetti && (
            <div className="confetti-field">
              {confetti.map((p) => {
                const confettiStyle: ConfettiStyle = {
                  "--dx": `${p.dx}px`,
                  "--dy": `${p.dy}px`,
                  "--rot": `${p.rot}deg`,
                  "--dur": `${p.duration}s`,
                  background: p.color,
                  width: p.size,
                  height: p.size,
                  borderRadius: p.shape,
                  animationDelay: `${p.delay}s`,
                };
                return (
                  <span key={p.id} className="confetti" style={confettiStyle} />
                );
              })}
            </div>
          )}
        </div>

        <button className="reset-button" onClick={handleReset}>
          Reset
        </button>
        <button className="reset-button" onClick={handleExplode}>
          Explode
        </button>
        <button className="reset-button" onClick={handleConfetti}>
          Confetti
        </button>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .game {
          display: flex;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: radial-gradient(circle at 30% 20%, #1e2749 0%, #10142b 70%);
          padding: 48px 40px;
          border-radius: 20px;
        }

        .board-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .status {
          font-size: 20px;
          font-weight: 700;
          color: #e8eaf6;
          letter-spacing: 0.02em;
          transition: color 0.2s ease;
        }

        .status-win {
          color: #ffd166;
          animation: status-pulse 0.6s ease infinite alternate;
        }

        @keyframes status-pulse {
          from { transform: scale(1); text-shadow: 0 0 8px rgba(255, 209, 102, 0.4); }
          to { transform: scale(1.06); text-shadow: 0 0 20px rgba(255, 209, 102, 0.9); }
        }

        .board-wrap {
          position: relative;
          padding: 10px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 16px;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
        }

        .board-row {
          display: flex;
        }

        .square {
          background: linear-gradient(160deg, #ffffff 0%, #f1f3fb 100%);
          border: none;
          border-radius: 10px;
          margin: 4px;
          font-size: 36px;
          font-weight: 800;
          height: 76px;
          width: 76px;
          padding: 0;
          text-align: center;
          cursor: pointer;
          box-shadow: 0 2px 0 rgba(16, 20, 43, 0.25), 0 6px 14px rgba(16, 20, 43, 0.25);
          transition: transform 0.12s ease, box-shadow 0.12s ease;
          position: relative;
        }

        .square:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 0 rgba(16, 20, 43, 0.25), 0 10px 18px rgba(16, 20, 43, 0.3);
        }

        .square:active {
          transform: translateY(1px) scale(0.97);
        }

        .square:focus-visible {
          outline: 3px solid #ffd166;
          outline-offset: 2px;
        }

        .square.filled-X {
          color: #3a86ff;
        }

        .square.filled-O {
          color: #fb5607;
        }

        .board-wrap.exploding .board-row {
          pointer-events: none;
        }

        .square.blasting {
          animation: square-blast 0.8s cubic-bezier(0.25, 0.8, 0.4, 1) forwards;
          z-index: 2;
        }

        @keyframes square-blast {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 1;
          }
          15% {
            transform: translate(0, 0) rotate(0deg) scale(1.1);
          }
          100% {
            transform: translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(0.4);
            opacity: 0;
          }
        }

        .confetti-field {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          pointer-events: none;
        }

        .confetti {
          position: absolute;
          top: 0;
          left: 0;
          opacity: 1;
          animation: confetti-burst var(--dur) ease-out forwards;
        }

        @keyframes confetti-burst {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy)))
              rotate(var(--rot)) scale(0.6);
            opacity: 0;
          }
        }

        .reset-button {
          background: linear-gradient(160deg, #3a86ff, #2563eb);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 22px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.02em;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(58, 134, 255, 0.35);
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }

        .reset-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(58, 134, 255, 0.45);
        }

        .reset-button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

