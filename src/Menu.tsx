import { useState } from "react";
import { LEVELS } from "./useSnake";

interface MenuProps {
  lastScore: number;
  lastTime: number;
  isGameOver?: boolean;
  onPlay: (levelIdx: number) => void;
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function Menu({ lastScore, lastTime, isGameOver, onPlay }: MenuProps) {
  const [selected, setSelected] = useState(0);
  const lvl = LEVELS[selected];

  return (
    <div style={{ textAlign: "center", color: "#e0e0e0", minWidth: 280 }}>
      <h1 style={{ fontSize: "3rem", color: "#39ff14", letterSpacing: "0.2em", marginBottom: "0.25rem" }}>
        SNAKE
      </h1>
      <p style={{ color: "#333", fontSize: "0.75rem", letterSpacing: "0.3em", marginBottom: "2rem" }}>
        CLASSIC ARCADE
      </p>

      {isGameOver && (
        <div style={{ marginBottom: "1.75rem" }}>
          <p style={{ color: "#ff4444", fontSize: "1.1rem", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>GAME OVER</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "2rem" }}>
            <div>
              <p style={{ color: "#444", fontSize: "0.65rem", letterSpacing: "0.2em", marginBottom: "2px" }}>SCORE</p>
              <p style={{ color: lvl.color, fontSize: "1.4rem", fontWeight: "bold" }}>{lastScore}</p>
            </div>
            <div style={{ width: 1, background: "#222" }} />
            <div>
              <p style={{ color: "#444", fontSize: "0.65rem", letterSpacing: "0.2em", marginBottom: "2px" }}>TIME</p>
              <p style={{ color: "#888", fontSize: "1.4rem" }}>{fmtTime(lastTime)}</p>
            </div>
          </div>
        </div>
      )}

      {!isGameOver && lastScore > 0 && (
        <p style={{ color: "#555", marginBottom: "1.75rem", fontSize: "0.85rem" }}>
          Last: <span style={{ color: "#39ff14" }}>{lastScore}</span>
          <span style={{ color: "#333", margin: "0 0.5rem" }}>·</span>
          <span style={{ color: "#666" }}>{fmtTime(lastTime)}</span>
        </p>
      )}

      {/* Level selector */}
      <div style={{ marginBottom: "1.75rem" }}>
        <p style={{ color: "#333", fontSize: "0.65rem", letterSpacing: "0.25em", marginBottom: "0.75rem" }}>SELECT LEVEL</p>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
          {LEVELS.map((l, i) => (
            <button
              key={l.level}
              onClick={() => setSelected(i)}
              style={{
                background: selected === i ? l.color : "transparent",
                border: `1px solid ${selected === i ? l.color : "#2a2a2a"}`,
                color: selected === i ? "#0f0f0f" : "#444",
                padding: "0.35rem 0.65rem",
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                cursor: "pointer",
                transition: "all 0.12s",
                fontFamily: "inherit",
              }}
              onMouseEnter={e => {
                if (selected !== i) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = l.color;
                  (e.currentTarget as HTMLButtonElement).style.color = l.color;
                }
              }}
              onMouseLeave={e => {
                if (selected !== i) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2a2a";
                  (e.currentTarget as HTMLButtonElement).style.color = "#444";
                }
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onPlay(selected)}
        style={{
          background: "transparent",
          border: `2px solid ${lvl.color}`,
          color: lvl.color,
          padding: "0.75rem 2.5rem",
          fontSize: "1rem",
          letterSpacing: "0.2em",
          cursor: "pointer",
          transition: "all 0.15s",
          fontFamily: "inherit",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = lvl.color;
          (e.currentTarget as HTMLButtonElement).style.color = "#0f0f0f";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.color = lvl.color;
        }}
      >
        {isGameOver ? "PLAY AGAIN" : "PLAY"}
      </button>

      <p style={{ color: "#222", fontSize: "0.65rem", marginTop: "2rem", letterSpacing: "0.1em" }}>
        ARROW KEYS / WASD TO MOVE
      </p>
    </div>
  );
}
