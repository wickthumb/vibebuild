import React, { useState, useEffect, useCallback } from "react";
import theme from "./style/theme";

interface SnakeProps {
  isActive: boolean;
  onClose: () => void;
}

// Direction types
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

// Cell type for snake and food
interface Cell {
  x: number;
  y: number;
}

const Snake: React.FC<SnakeProps> = ({ isActive, onClose }) => {
  // Game board size
  const boardWidth = 20;
  const boardHeight = 20;
  const cellSize = 15;

  // Game state
  const [snake, setSnake] = useState<Cell[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const [food, setFood] = useState<Cell>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(150);
  const [isPaused, setIsPaused] = useState(false);

  // Generate random food position
  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * boardWidth),
      y: Math.floor(Math.random() * boardHeight),
    };

    // Make sure food doesn't spawn on snake
    const isOnSnake = snake.some(
      (segment) => segment.x === newFood.x && segment.y === newFood.y
    );

    if (isOnSnake) {
      return generateFood();
    }

    return newFood;
  }, [snake, boardWidth, boardHeight]);

  // Check for collisions
  const checkCollision = useCallback(
    (head: Cell) => {
      // Check wall collision
      if (
        head.x < 0 ||
        head.x >= boardWidth ||
        head.y < 0 ||
        head.y >= boardHeight
      ) {
        return true;
      }

      // Check self collision (skip the last segment as it will be removed)
      for (let i = 0; i < snake.length - 1; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
          return true;
        }
      }

      return false;
    },
    [snake, boardWidth, boardHeight]
  );

  // Move the snake
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    // Calculate new head position based on direction
    switch (direction) {
      case "UP":
        head.y -= 1;
        break;
      case "DOWN":
        head.y += 1;
        break;
      case "LEFT":
        head.x -= 1;
        break;
      case "RIGHT":
        head.x += 1;
        break;
    }

    // Check for collision
    if (checkCollision(head)) {
      setGameOver(true);
      return;
    }

    // Add new head to snake
    newSnake.unshift(head);

    // Check if snake ate food
    if (head.x === food.x && head.y === food.y) {
      // Generate new food
      setFood(generateFood());
      // Increase score
      setScore((prev) => prev + 10);
      // Increase speed slightly
      setSpeed((prev) => Math.max(prev - 5, 50));
    } else {
      // Remove tail if no food was eaten
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [
    snake,
    direction,
    food,
    gameOver,
    isPaused,
    checkCollision,
    generateFood,
  ]);

  // Game loop
  useEffect(() => {
    if (!isActive) return;

    const gameInterval = setInterval(moveSnake, speed);

    return () => {
      clearInterval(gameInterval);
    };
  }, [isActive, moveSnake, speed]);

  // Handle keyboard input
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for arrow keys to avoid page scrolling
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.key)) {
        e.preventDefault();
      }

      if (gameOver) {
        if (e.key === "Enter") {
          resetGame();
        }
        return;
      }

      switch (e.key) {
        case "ArrowUp":
          if (direction !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
          if (direction !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
          if (direction !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
          if (direction !== "LEFT") setDirection("RIGHT");
          break;
        case "p":
          setIsPaused((prev) => !prev);
          break;
        case "Escape":
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, direction, gameOver, onClose]);

  // Reset game
  const resetGame = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ]);
    setDirection("RIGHT");
    setFood(generateFood());
    setGameOver(false);
    setScore(0);
    setSpeed(150);
    setIsPaused(false);
  };

  if (!isActive) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: theme.colors.backgroundDark,
          border: `${theme.borders.width.medium} ${theme.borders.style.solid} ${theme.colors.accent1}`,
          borderRadius: theme.borders.radius.md,
          padding: theme.spacing.lg,
          boxShadow: theme.shadows.neon.pink,
          position: "relative",
          width: "360px",
        }}
      >
        <div
          style={{
            backgroundColor: theme.colors.accent1,
            padding: theme.spacing.xs,
            marginBottom: theme.spacing.md,
            borderTopLeftRadius: theme.borders.radius.sm,
            borderTopRightRadius: theme.borders.radius.sm,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              color: theme.textColors.inverse,
              fontSize: theme.fonts.size.sm,
              textAlign: "center",
              flex: 1,
            }}
          >
            SNAKE.EXE
          </p>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: theme.textColors.inverse,
              cursor: "pointer",
              fontSize: theme.fonts.size.md,
              padding: "0 5px",
            }}
          >
            X
          </button>
        </div>

        <div
          style={{
            marginTop: theme.spacing.xl,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: theme.spacing.md,
            }}
          >
            <p style={{ color: theme.colors.accent6 }}>Score: {score}</p>
            <button
              onClick={resetGame}
              style={{
                backgroundColor: theme.colors.accent1,
                color: theme.textColors.inverse,
                border: "none",
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                borderRadius: theme.borders.radius.sm,
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          </div>

          <div
            style={{
              position: "relative",
              width: `${boardWidth * cellSize}px`,
              height: `${boardHeight * cellSize}px`,
              border: `${theme.borders.width.medium} ${theme.borders.style.solid} ${theme.colors.accent1}`,
              backgroundColor: theme.colors.backgroundDark,
              overflow: "hidden",
            }}
          >
            {/* Render snake */}
            {snake.map((segment, index) => (
              <div
                key={`snake-${index}`}
                style={{
                  position: "absolute",
                  top: `${segment.y * cellSize}px`,
                  left: `${segment.x * cellSize}px`,
                  width: `${cellSize - 2}px`,
                  height: `${cellSize - 2}px`,
                  backgroundColor:
                    index === 0 ? theme.colors.accent1 : theme.colors.accent5,
                  border: `1px solid ${theme.colors.backgroundDark}`,
                  boxShadow: `0 0 5px ${
                    index === 0 ? theme.colors.accent1 : theme.colors.accent5
                  }`,
                  borderRadius: index === 0 ? "3px" : "0",
                }}
              />
            ))}

            {/* Render food */}
            <div
              style={{
                position: "absolute",
                top: `${food.y * cellSize}px`,
                left: `${food.x * cellSize}px`,
                width: `${cellSize - 2}px`,
                height: `${cellSize - 2}px`,
                backgroundColor: theme.colors.accent6,
                border: `1px solid ${theme.colors.backgroundDark}`,
                boxShadow: `0 0 5px ${theme.colors.accent6}`,
                borderRadius: "50%",
              }}
            />

            {/* Game over overlay */}
            {gameOver && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  color: theme.colors.accent1,
                  textShadow: theme.shadows.neon.pink,
                }}
              >
                <p
                  style={{
                    fontSize: theme.fonts.size.lg,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  GAME OVER
                </p>
                <p
                  style={{
                    fontSize: theme.fonts.size.md,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  Score: {score}
                </p>
                <button
                  onClick={resetGame}
                  style={{
                    backgroundColor: theme.colors.accent1,
                    color: theme.textColors.inverse,
                    border: "none",
                    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                    borderRadius: theme.borders.radius.sm,
                    cursor: "pointer",
                  }}
                >
                  Play Again
                </button>
              </div>
            )}

            {/* Pause overlay */}
            {isPaused && !gameOver && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: theme.colors.accent1,
                  textShadow: theme.shadows.neon.pink,
                }}
              >
                <p style={{ fontSize: theme.fonts.size.lg }}>PAUSED</p>
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: theme.spacing.md,
              color: theme.textColors.secondary,
              fontSize: theme.fonts.size.sm,
              textAlign: "center",
            }}
          >
            <p>Controls:</p>
            <p>← → ↑ ↓ : Move</p>
            <p>P : Pause</p>
            <p>ESC : Close</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Snake;
