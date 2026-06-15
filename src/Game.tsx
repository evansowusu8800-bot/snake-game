import { useSnake, LEVELS } from "./useSnake";

const CELL = 24;

interface GameProps {
  onGameOver: (score: number, time: number) => void;
  levelIdx: number;
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function Game({ onGameOver, levelIdx }: GameProps) {
  const { snake, food, score, elapsed, cols, rows, predator, obstacles, slowed } = useSnake(onGameOver, levelIdx);
  const lvl = LEVELS[levelIdx];

  const snakeSet = new Set(snake.map(s => `${s.x},${s.y}`));
  const obstacleSet = new Set(obstacles.map(o => `${o.x},${o.y}`));
  const isHead = (x: number, y: number) => snake[0].x === x && snake[0].y === y;
  const isPredator = (x: number, y: number) => predator.x === x && predator.y === y;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
      {/* HUD */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        width: cols * CELL, color: "#555", fontSize: "0.75rem", letterSpacing: "0.15em"
      }}>
        <span>SNAKE</span>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          {slowed && (
            <span style={{ color: "#ff9900", fontSize: "0.65rem", letterSpacing: "0.15em", animation: "blink 0.6s step-end infinite" }}>
              ⚠ SLOWED
            </span>
          )}
          <span style={{ color: "#444" }}>⏱ <span style={{ color: "#888" }}>{fmtTime(elapsed)}</span></span>
          <span style={{
            color: lvl.color,
            fontSize: "0.65rem",
            border: `1px solid ${lvl.color}44`,
            padding: "1px 6px",
            letterSpacing: "0.2em",
          }}>{lvl.label}</span>
          <span style={{ color: lvl.color }}>{score}</span>
        </div>
      </div>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${CELL}px)`,
          gridTemplateRows: `repeat(${rows}, ${CELL}px)`,
          border: `1px solid #1e1e1e`,
          gap: 0,
        }}
      >
        {Array.from({ length: rows }, (_, y) =>
          Array.from({ length: cols }, (_, x) => {
            const key = `${x},${y}`;
            const isSnake = snakeSet.has(key);
            const isFood = food.x === x && food.y === y;
            const head = isHead(x, y);
            const pred = isPredator(x, y);
            const isObstacle = obstacleSet.has(key);

            let bg = (x + y) % 2 === 0 ? "#111" : "#0f0f0f";
            if (isObstacle) bg = "#2a1a00";
            if (isSnake && !head) bg = lvl.color + "cc";
            if (head) bg = lvl.color;
            if (pred) bg = "#8b0000";

            return (
              <div
                key={key}
                style={{
                  width: CELL,
                  height: CELL,
                  background: isFood ? "transparent" : bg,
                  boxSizing: "border-box",
                  borderRadius: head ? 3 : pred ? 4 : 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: (isFood || isObstacle || pred) ? "13px" : undefined,
                  border: isObstacle && !isSnake && !pred ? "1px solid #3d2800" : undefined,
                }}
              >
                {isFood && !pred && "🍎"}
                {pred && "🐻"}
                {isObstacle && !isFood && !isSnake && !pred && "🪨"}
              </div>
            );
          })
        )}
      </div>

      <p style={{ color: "#2a2a2a", fontSize: "0.65rem", letterSpacing: "0.12em" }}>
        ARROW KEYS / WASD &nbsp;·&nbsp; 🐻 CHASES YOU &nbsp;·&nbsp; 🪨 SLOWS YOU DOWN
      </p>
    </div>
  );
}
