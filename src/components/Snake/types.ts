// Direction types
export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

// Cell type for snake and food
export interface Cell {
  x: number;
  y: number;
}

// Game state interface
export interface GameState {
  snake: Cell[];
  food: Cell;
  direction: Direction;
  gameOver: boolean;
  score: number;
  speed: number;
  isPaused: boolean;
}

// Props for the Snake component
export interface SnakeProps {
  isActive: boolean;
  onClose: () => void;
  mode?: "normal" | "neural";
}

// Props for the GameBoard component
export interface GameBoardProps {
  gameState: GameState;
  cellSize: number;
  boardWidth: number;
  boardHeight: number;
  isLearning?: boolean;
  resetGame: () => void;
}

// Props for the NeuralInfoPanel component
export interface NeuralInfoPanelProps {
  generation: number;
  bestScore: number;
  currentScore: number;
  isLearning: boolean;
  moves: number;
  toggleLearning: () => void;
  toggleInfo: () => void;
  boardHeight: number;
  cellSize: number;
  speedMultiplier: 1 | 2 | 5 | 10 | 50;
  gpuEnabled: boolean;
} 