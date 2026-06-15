import { useState } from "react";
import Game from "./Game";
import Menu from "./Menu";

export type Screen = "menu" | "game" | "gameover";

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [levelIdx, setLevelIdx] = useState(0);

  const handlePlay = (idx: number) => {
    setLevelIdx(idx);
    setScreen("game");
  };

  const handleGameOver = (s: number, t: number) => {
    setScore(s);
    setTime(t);
    setScreen("gameover");
  };

  return (
    <div style={{
      fontFamily: "'Courier New', monospace",
      background: "#0f0f0f",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {screen === "menu" && (
        <Menu lastScore={score} lastTime={time} onPlay={handlePlay} />
      )}
      {screen === "game" && (
        <Game onGameOver={handleGameOver} levelIdx={levelIdx} />
      )}
      {screen === "gameover" && (
        <Menu lastScore={score} lastTime={time} isGameOver onPlay={handlePlay} />
      )}
    </div>
  );
}
