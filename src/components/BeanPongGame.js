"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const WIDTH = 720;
const HEIGHT = 420;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const BALL_SIZE = 12;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default function BeanPongGame() {
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const stateRef = useRef({
    leftY: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    rightY: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    ballX: WIDTH / 2,
    ballY: HEIGHT / 2,
    ballVX: 4,
    ballVY: 2.2,
  });

  const scoreLabel = useMemo(() => `${score} returns`, [score]);

  const resetRound = () => {
    const state = stateRef.current;
    state.leftY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    state.rightY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    state.ballX = WIDTH / 2;
    state.ballY = HEIGHT / 2;
    const dir = Math.random() > 0.5 ? 1 : -1;
    state.ballVX = dir * (3.6 + Math.random() * 1.2);
    state.ballVY = (Math.random() * 2 - 1) * 2.4;
  };

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    resetRound();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    let raf;
    const render = () => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = "#f7f5f0";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.strokeStyle = "rgba(15,31,22,0.1)";
      ctx.setLineDash([8, 10]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2, 0);
      ctx.lineTo(WIDTH / 2, HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      const { leftY, rightY, ballX, ballY } = stateRef.current;

      ctx.fillStyle = "#1f6f43";
      ctx.fillRect(28, leftY, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillRect(WIDTH - 28 - PADDLE_WIDTH, rightY, PADDLE_WIDTH, PADDLE_HEIGHT);

      const gradient = ctx.createRadialGradient(
        ballX - BALL_SIZE * 0.2,
        ballY - BALL_SIZE * 0.2,
        BALL_SIZE * 0.2,
        ballX,
        ballY,
        BALL_SIZE
      );
      gradient.addColorStop(0, "#f1c37b");
      gradient.addColorStop(1, "#9d5b2a");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(ballX, ballY, BALL_SIZE * 0.7, BALL_SIZE * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(60,30,18,0.4)";
      ctx.beginPath();
      ctx.moveTo(ballX, ballY - BALL_SIZE * 0.5);
      ctx.lineTo(ballX, ballY + BALL_SIZE * 0.5);
      ctx.stroke();

      raf = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!running) return;
    let animation;
    const tick = () => {
      const state = stateRef.current;

      state.ballX += state.ballVX;
      state.ballY += state.ballVY;

      // bounce top/bottom
      if (state.ballY <= 14 || state.ballY >= HEIGHT - 14) {
        state.ballVY *= -1;
      }

      // simple AI for right paddle
      const target = state.ballY - PADDLE_HEIGHT / 2;
      state.rightY += clamp(target - state.rightY, -4, 4);
      state.rightY = clamp(state.rightY, 8, HEIGHT - PADDLE_HEIGHT - 8);

      // left paddle controlled by mouse/touch
      state.leftY = clamp(state.leftY, 8, HEIGHT - PADDLE_HEIGHT - 8);

      // paddle collisions
      const leftX = 28 + PADDLE_WIDTH;
      if (
        state.ballX <= leftX + BALL_SIZE &&
        state.ballY >= state.leftY - 4 &&
        state.ballY <= state.leftY + PADDLE_HEIGHT + 4
      ) {
        state.ballVX = Math.abs(state.ballVX) + 0.2;
        state.ballVY += (state.ballY - (state.leftY + PADDLE_HEIGHT / 2)) * 0.03;
        setScore((prev) => prev + 1);
      }
      const rightX = WIDTH - 28 - PADDLE_WIDTH;
      if (
        state.ballX >= rightX - BALL_SIZE &&
        state.ballY >= state.rightY - 4 &&
        state.ballY <= state.rightY + PADDLE_HEIGHT + 4
      ) {
        state.ballVX = -Math.abs(state.ballVX) - 0.2;
        state.ballVY += (state.ballY - (state.rightY + PADDLE_HEIGHT / 2)) * 0.03;
      }

      if (state.ballX < 0) {
        setGameOver(true);
        setRunning(false);
      }

      if (state.ballX > WIDTH) {
        resetRound();
      }

      animation = requestAnimationFrame(tick);
    };

    animation = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animation);
  }, [running]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const y = (event.clientY || event.touches?.[0]?.clientY) - rect.top;
      stateRef.current.leftY = clamp(y - PADDLE_HEIGHT / 2, 8, HEIGHT - PADDLE_HEIGHT - 8);
    };
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("touchmove", handleMove, { passive: true });
    return () => {
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("touchmove", handleMove);
    };
  }, []);

  return (
    <div className="bean-game">
      <div className="bean-game-header">
        <div>
          <span className="pill">Bean Pong</span>
          <h1>Bean Pong</h1>
          <p className="muted">Beat the CPU in a bean‑powered pong match.</p>
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
              <h2>{gameOver ? "Round over" : "Ready to volley?"}</h2>
              <p className="muted">Move your mouse or touch to control the paddle.</p>
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
    </div>
  );
}
