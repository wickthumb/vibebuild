import React from "react";
import theme from "../style/theme";
import { GameBoardProps, Cell, Direction } from "./types";

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  cellSize,
  boardWidth,
  boardHeight,
  isLearning = false,
  resetGame,
}) => {
  const { snake, food, gameOver, score, isPaused, direction } = gameState;

  // Create a grid representation for visualization
  const createGridRepresentation = () => {
    // Initialize empty grid
    const grid = Array(boardHeight)
      .fill(null)
      .map(() => Array(boardWidth).fill("empty"));

    // Mark snake positions
    snake.forEach((segment, index) => {
      if (segment.x >= 0 && segment.x < boardWidth && segment.y >= 0 && segment.y < boardHeight) {
        grid[segment.y][segment.x] = index === 0 ? "head" : "body";
      }
    });

    // Mark food position
    if (food.x >= 0 && food.x < boardWidth && food.y >= 0 && food.y < boardHeight) {
      grid[food.y][food.x] = "food";
    }

    return grid;
  };

  // Get the grid representation
  const grid = createGridRepresentation();

  // Calculate vision rays for visualization
  const getVisionRays = () => {
    if (!isLearning || snake.length === 0) return [];
    
    const head = snake[0];
    const rays = [];
    
    // 8 directions: up, up-right, right, down-right, down, down-left, left, up-left
    const directions = [
      [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]
    ];
    
    // Look in all 8 directions
    for (const [dirX, dirY] of directions) {
      const rayPoints = [];
      let distance = 1;
      let hitWall = false;
      let hitBody = false;
      let hitFood = false;
      
      // Look up to 8 cells in this direction
      while (distance <= 8 && !hitWall && !hitBody) {
        const x = head.x + dirX * distance;
        const y = head.y + dirY * distance;
        
        // Check if we hit a wall
        if (x < 0 || x >= boardWidth || y < 0 || y >= boardHeight) {
          hitWall = true;
          break;
        }
        
        rayPoints.push({ x, y });
        
        // Check if we hit food
        if (x === food.x && y === food.y) {
          hitFood = true;
        }
        
        // Check if we hit snake body
        for (let i = 1; i < snake.length; i++) {
          if (x === snake[i].x && y === snake[i].y) {
            hitBody = true;
            break;
          }
        }
        
        distance++;
      }
      
      rays.push({
        points: rayPoints,
        hitWall,
        hitBody,
        hitFood
      });
    }
    
    return rays;
  };

  const visionRays = getVisionRays();

  return (
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
      {/* Grid overlay for visualization */}
      {isLearning && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`grid-${y}-${x}`}
                style={{
                  position: "absolute",
                  top: `${y * cellSize}px`,
                  left: `${x * cellSize}px`,
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  border: "1px dashed rgba(255, 255, 255, 0.1)",
                  backgroundColor: "transparent",
                }}
              />
            ))
          )}
        </div>
      )}

      {/* Vision rays visualization */}
      {isLearning && visionRays.map((ray, index) => (
        <React.Fragment key={`ray-${index}`}>
          {ray.points.map((point, pointIndex) => (
            <div
              key={`ray-${index}-point-${pointIndex}`}
              style={{
                position: "absolute",
                top: `${point.y * cellSize + cellSize / 2 - 2}px`,
                left: `${point.x * cellSize + cellSize / 2 - 2}px`,
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                backgroundColor: ray.hitFood 
                  ? "rgba(255, 215, 0, 0.5)" // Gold for food
                  : ray.hitBody 
                    ? "rgba(255, 0, 0, 0.5)" // Red for body
                    : ray.hitWall 
                      ? "rgba(255, 255, 255, 0.5)" // White for wall
                      : "rgba(0, 255, 255, 0.3)", // Cyan for empty space
                zIndex: 1,
              }}
            />
          ))}
        </React.Fragment>
      ))}

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
            zIndex: 2,
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
          zIndex: 2,
        }}
      />

      {/* Game over overlay */}
      {gameOver && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <h2
            style={{
              color: theme.colors.accent1,
              textShadow: theme.shadows.neon.pink,
              margin: 0,
              marginBottom: theme.spacing.md,
            }}
          >
            GAME OVER
          </h2>
          <p
            style={{
              color: theme.textColors.primary,
              margin: 0,
              marginBottom: theme.spacing.md,
            }}
          >
            Score: {score}
          </p>
          {!isLearning && (
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
          )}
        </div>
      )}

      {/* Paused overlay */}
      {isPaused && !gameOver && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <h2
            style={{
              color: theme.colors.accent2,
              textShadow: theme.shadows.neon.blue,
              margin: 0,
            }}
          >
            PAUSED
          </h2>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
