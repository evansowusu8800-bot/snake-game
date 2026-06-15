import { useState, useEffect, useCallback, useRef } from "react";

export type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type Pos = { x: number; y: number };

export const LEVELS = [
  { level: 1, label: "EASY",   tick: 160, color: "#39ff14" },
  { level: 2, label: "NORMAL", tick: 120, color: "#00e5ff" },
  { level: 3, label: "HARD",   tick: 80,  color: "#ff6b00" },
  { level: 4, label: "INSANE", tick: 45,  color: "#ff003c" },
];

export const COLS = 20;
export const ROWS = 20;

export const NUM_OBSTACLES = 6;

function randomPos(excluded: Pos[]): Pos {
  let pos: Pos;
  do {
    pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (excluded.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

function generateObstacles(snake: Pos[], food: Pos): Pos[] {
  const obstacles: Pos[] = [];
  for (let i = 0; i < NUM_OBSTACLES; i++) {
    obstacles.push(randomPos([...snake, food, ...obstacles]));
  }
  return obstacles;
}

// Simple BFS-based chaser: move predator one step toward snake head
function chaseStep(predator: Pos, target: Pos, obstacles: Pos[], snake: Pos[]): Pos {
  const blocked = new Set([
    ...obstacles.map(o => `${o.x},${o.y}`),
    ...snake.slice(1).map(s => `${s.x},${s.y}`),
  ]);

  const dirs: Pos[] = [
    { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 },
  ];

  // BFS
  type Node = { pos: Pos; path: Pos[] };
  const queue: Node[] = [{ pos: predator, path: [] }];
  const visited = new Set<string>();
  visited.add(`${predator.x},${predator.y}`);

  while (queue.length > 0) {
    const { pos, path } = queue.shift()!;
    for (const d of dirs) {
      const nx = pos.x + d.x;
      const ny = pos.y + d.y;
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) continue;
      const key = `${nx},${ny}`;
      if (visited.has(key) || blocked.has(key)) continue;
      visited.add(key);
      const newPath = [...path, { x: nx, y: ny }];
      if (nx === target.x && ny === target.y) {
        return newPath[0] ?? predator;
      }
      queue.push({ pos: { x: nx, y: ny }, path: newPath });
    }
  }

  // fallback: move toward target naively
  const best = dirs
    .map(d => ({ x: predator.x + d.x, y: predator.y + d.y }))
    .filter(p => p.x >= 0 && p.x < COLS && p.y >= 0 && p.y < ROWS && !blocked.has(`${p.x},${p.y}`))
    .sort((a, b) =>
      Math.abs(a.x - target.x) + Math.abs(a.y - target.y) -
      (Math.abs(b.x - target.x) + Math.abs(b.y - target.y))
    );
  return best[0] ?? predator;
}

export function useSnake(onGameOver: (score: number, time: number) => void, levelIdx: number) {
  const tick = LEVELS[levelIdx].tick;
  const initSnake: Pos[] = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  const initFood = randomPos(initSnake);
  const initObstacles = generateObstacles(initSnake, initFood);
  const initPredator: Pos = { x: 0, y: 0 };

  const [snake, setSnake] = useState<Pos[]>(initSnake);
  const [food, setFood] = useState<Pos>(initFood);
  const [obstacles, setObstacles] = useState<Pos[]>(initObstacles);
  const [predator, setPredator] = useState<Pos>(initPredator);
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [slowed, setSlowed] = useState(false);

  const dirRef = useRef<Dir>("RIGHT");
  const pendingDir = useRef<Dir>("RIGHT");
  const alive = useRef(true);
  const startTime = useRef(Date.now());
  const elapsedRef = useRef(0);
  const slowedRef = useRef(false);
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // refs for use inside callbacks
  const snakeRef = useRef(initSnake);
  const foodRef = useRef(initFood);
  const obstaclesRef = useRef(initObstacles);
  const predatorRef = useRef(initPredator);
  const scoreRef = useRef(0);

  // Timer
  useEffect(() => {
    const id = setInterval(() => {
      if (!alive.current) return;
      const t = Math.floor((Date.now() - startTime.current) / 1000);
      elapsedRef.current = t;
      setElapsed(t);
    }, 500);
    return () => clearInterval(id);
  }, []);

  const triggerGameOver = useCallback(() => {
    alive.current = false;
    setTimeout(() => onGameOver(scoreRef.current, elapsedRef.current), 0);
  }, [onGameOver]);

  const step = useCallback(() => {
    if (!alive.current) return;
    dirRef.current = pendingDir.current;
    const dir = dirRef.current;

    const prev = snakeRef.current;
    const head = prev[0];
    const next: Pos = {
      x: head.x + (dir === "LEFT" ? -1 : dir === "RIGHT" ? 1 : 0),
      y: head.y + (dir === "UP" ? -1 : dir === "DOWN" ? 1 : 0),
    };

    // Wall collision
    if (next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS) {
      triggerGameOver(); return;
    }
    // Self collision
    if (prev.some(s => s.x === next.x && s.y === next.y)) {
      triggerGameOver(); return;
    }

    // Obstacle collision → slow down
    const obs = obstaclesRef.current;
    if (obs.some(o => o.x === next.x && o.y === next.y)) {
      if (!slowedRef.current) {
        slowedRef.current = true;
        setSlowed(true);
        if (slowTimer.current) clearTimeout(slowTimer.current);
        slowTimer.current = setTimeout(() => {
          slowedRef.current = false;
          setSlowed(false);
        }, 2000);
      }
    }

    // Food collision
    let newSnake: Pos[];
    const f = foodRef.current;
    if (f.x === next.x && f.y === next.y) {
      const grown = [next, ...prev];
      newSnake = grown;
      scoreRef.current += 10;
      setScore(scoreRef.current);
      const newFood = randomPos([...grown, ...obs]);
      foodRef.current = newFood;
      setFood(newFood);
      // Refresh obstacles on each food eat
      const newObs = generateObstacles(grown, newFood);
      obstaclesRef.current = newObs;
      setObstacles(newObs);
    } else {
      newSnake = [next, ...prev.slice(0, -1)];
    }

    snakeRef.current = newSnake;
    setSnake(newSnake);

    // Move predator (same tick as snake, every step)
    const pred = predatorRef.current;
    const newPred = chaseStep(pred, next, obstaclesRef.current, newSnake);
    predatorRef.current = newPred;
    setPredator(newPred);

    // Predator catches snake head
    if (newPred.x === next.x && newPred.y === next.y) {
      triggerGameOver(); return;
    }
  }, [triggerGameOver]);

  // Separate intervals for normal and slowed speed
  useEffect(() => {
    const effectiveTick = slowed ? Math.min(tick * 2.5, 400) : tick;
    const id = setInterval(step, effectiveTick);
    return () => clearInterval(id);
  }, [step, tick, slowed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: "UP", w: "UP", W: "UP",
        ArrowDown: "DOWN", s: "DOWN", S: "DOWN",
        ArrowLeft: "LEFT", a: "LEFT", A: "LEFT",
        ArrowRight: "RIGHT", d: "RIGHT", D: "RIGHT",
      };
      const d = map[e.key];
      if (!d) return;
      e.preventDefault();
      const opp: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
      if (d !== opp[dirRef.current]) pendingDir.current = d;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { snake, food, score, elapsed, cols: COLS, rows: ROWS, predator, obstacles, slowed };
}
