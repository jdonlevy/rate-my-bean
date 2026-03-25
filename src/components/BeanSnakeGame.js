"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const GRID_SIZE = 20;
const COLS = 24;
const ROWS = 24;
const TICK_MS = 110;

function randomCell(exclude) {
  while (true) {
    const cell = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
    if (!exclude.some((part) => part.x === cell.x && part.y === cell.y)) {
      return cell;
    }
  }
}

export default function BeanSnakeGame() {
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const snakeRef = useRef([
    { x: 10, y: 12 },
    { x: 9, y: 12 },
    { x: 8, y: 12 },
  ]);
  const foodRef = useRef({ x: 15, y: 12 });
  const dirRef = useRef({ x: 1, y: 0 });
  const nextDirRef = useRef({ x: 1, y: 0 });
  const tickRef = useRef(null);

  const scoreLabel = useMemo(() => (score ? `${score} beans` : "0 beans"), [score]);

  const resetGame = useCallback(() => {
    snakeRef.current = [
      { x: 10, y: 12 },
      { x: 9, y: 12 },
      { x: 8, y: 12 },
    ];
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    foodRef.current = randomCell(snakeRef.current);
    setScore(0);
    setGameOver(false);
    setSaved(false);
  }, []);

  const setDirection = useCallback((x, y) => {
    const current = dirRef.current;
    if (current.x === -x && current.y === -y) return;
    nextDirRef.current = { x, y };
  }, []);

  const handleKey = useCallback(
    (event) => {
      switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
          setDirection(0, -1);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          setDirection(0, 1);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          setDirection(-1, 0);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          setDirection(1, 0);
          break;
        default:
          break;
      }
    },
    [setDirection]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  useEffect(() => {
    if (!running) {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }

    tickRef.current = setInterval(() => {
      const snake = snakeRef.current;
      const direction = nextDirRef.current;
      dirRef.current = direction;

      const head = snake[0];
      const next = { x: head.x + direction.x, y: head.y + direction.y };

      if (next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS) {
        setRunning(false);
        setGameOver(true);
        return;
      }
      if (snake.some((part) => part.x === next.x && part.y === next.y)) {
        setRunning(false);
        setGameOver(true);
        return;
      }

      snake.unshift(next);
      if (next.x === foodRef.current.x && next.y === foodRef.current.y) {
        setScore((prev) => prev + 1);
        foodRef.current = randomCell(snake);
      } else {
        snake.pop();
      }
    }, TICK_MS);

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [running]);

  useEffect(() => {
    fetch("/api/bean-snake/leaderboard")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.leaderboard) setLeaderboard(data.leaderboard);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = COLS * GRID_SIZE;
    const height = ROWS * GRID_SIZE;
    canvas.width = width;
    canvas.height = height;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#f7f5f0";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(15,31,22,0.05)";
      for (let x = 0; x <= COLS; x += 1) {
        ctx.beginPath();
        ctx.moveTo(x * GRID_SIZE, 0);
        ctx.lineTo(x * GRID_SIZE, height);
        ctx.stroke();
      }
      for (let y = 0; y <= ROWS; y += 1) {
        ctx.beginPath();
        ctx.moveTo(0, y * GRID_SIZE);
        ctx.lineTo(width, y * GRID_SIZE);
        ctx.stroke();
      }

      const drawBean = (cell, accent = false) => {
        const x = cell.x * GRID_SIZE + GRID_SIZE / 2;
        const y = cell.y * GRID_SIZE + GRID_SIZE / 2;
        const radiusX = GRID_SIZE * 0.45;
        const radiusY = GRID_SIZE * 0.32;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(accent ? 0.6 : 0.25);
        const gradient = ctx.createRadialGradient(
          -radiusX * 0.3,
          -radiusY * 0.3,
          radiusY * 0.2,
          0,
          0,
          radiusX
        );
        gradient.addColorStop(0, accent ? "#f1c37b" : "#c08b5a");
        gradient.addColorStop(1, accent ? "#9d5b2a" : "#7d4b2a");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(60, 30, 18, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -radiusY * 0.9);
        ctx.lineTo(0, radiusY * 0.9);
        ctx.stroke();
        ctx.restore();
      };

      snakeRef.current.forEach((cell, index) => drawBean(cell, index === 0));
      drawBean(foodRef.current, true);

      requestAnimationFrame(render);
    };

    render();
  }, []);

  return (
    <div className="bean-game">
      <div className="bean-game-header">
        <div>
          <span className="pill">Bean Snake</span>
          <h1>Bean Snake</h1>
          <p className="muted">Collect beans, grow longer, don’t crash.</p>
        </div>
        <div className="bean-game-score">
          <span className="muted">Score</span>
          <strong>{scoreLabel}</strong>
        </div>
      </div>

      <div className="bean-game-board">
        <canvas ref={canvasRef} className="bean-game-canvas" />
        {!running && (
          <div className="bean-game-overlay">
            <div className="bean-game-panel">
              <h2>{gameOver ? "Game over" : "Ready to play?"}</h2>
              <p className="muted">
                Use arrow keys or WASD. Tap the controls below on mobile.
              </p>
              {gameOver ? (
                <div className="bean-game-submit">
                  <label className="muted" htmlFor="beanGameName">
                    Name for the leaderboard
                  </label>
                  <input
                    id="beanGameName"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                  />
                  <button
                    className="button"
                    type="button"
                    disabled={saving || !name.trim() || saved}
                    onClick={async () => {
                      if (!name.trim()) return;
                      setSaving(true);
                      try {
                        const res = await fetch("/api/bean-snake/score", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ score, displayName: name.trim() }),
                        });
                        if (res.ok) {
                          const data = await res.json();
                          setLeaderboard(data.leaderboard || []);
                          setSaved(true);
                        }
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    {saved ? "Score saved" : saving ? "Saving..." : "Save score"}
                  </button>
                </div>
              ) : null}
              <button
                className="button"
                type="button"
                onClick={() => {
                  if (gameOver) resetGame();
                  setRunning(true);
                }}
              >
                {gameOver ? "Play again" : "Start"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bean-game-leaderboard">
        <h3>Top bean snakes</h3>
        {leaderboard.length ? (
          <ol>
            {leaderboard.map((entry, index) => (
              <li key={`${entry.display_name}-${entry.created_at}-${index}`}>
                <span>{entry.display_name}</span>
                <strong>{entry.score}</strong>
              </li>
            ))}
          </ol>
        ) : (
          <p className="muted">No scores yet. Be the first.</p>
        )}
      </div>

      <div className="bean-game-controls">
        <button className="button secondary" onClick={() => setDirection(0, -1)}>
          ↑
        </button>
        <div className="bean-game-controls-row">
          <button className="button secondary" onClick={() => setDirection(-1, 0)}>
            ←
          </button>
          <button className="button secondary" onClick={() => setDirection(0, 1)}>
            ↓
          </button>
          <button className="button secondary" onClick={() => setDirection(1, 0)}>
            →
          </button>
        </div>
      </div>
    </div>
  );
}
