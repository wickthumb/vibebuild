import React, { useState, useEffect, useCallback } from "react";
import theme from "../style/theme";
import { SnakeProps, Cell, Direction, GameState } from "./types";
import GameBoard from "./GameBoard";
import NeuralInfoPanel from "./NeuralInfoPanel";
import { useNeuralNetwork } from "./NeuralNetwork";

const Snake: React.FC<SnakeProps> = ({
  isActive,
  onClose,
  mode = "neural",
}) => {
  // Game board size
  const boardWidth = 20;
  const boardHeight = 20;
  const cellSize = 15;

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    snake: [
      { x: Math.floor(boardWidth / 2), y: Math.floor(boardHeight / 2) },
      { x: Math.floor(boardWidth / 2) - 1, y: Math.floor(boardHeight / 2) },
      { x: Math.floor(boardWidth / 2) - 2, y: Math.floor(boardHeight / 2) },
    ],
    food: { x: Math.floor(boardWidth / 2) + 5, y: Math.floor(boardHeight / 2) },
    direction: "RIGHT" as Direction,
    gameOver: false,
    score: 0,
    speed: 150,
    isPaused: false,
  });

  // Speed multiplier for training
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2 | 5 | 10 | 50>(
    10
  );

  // Neural Network hook
  const {
    neuralNetwork,
    isLearning,
    generation,
    bestScore,
    showNeuralInfo,
    gpuEnabled,
    trainingData,
    moves,
    initializeNeuralNetwork,
    updateNeuralNetwork,
    getNextDirection,
    toggleLearning,
    toggleInfo,
    incrementGeneration,
    updateBestScore,
  } = useNeuralNetwork(boardWidth, boardHeight);

  // Initialize Neural Network
  useEffect(() => {
    if (mode === "neural" && !neuralNetwork) {
      console.log("Initializing neural network with TensorFlow.js...");
      initializeNeuralNetwork()
        .then(() => {
          console.log("Neural network initialized successfully");
        })
        .catch((error) => {
          console.error("Failed to initialize neural network:", error);
        });
    }
  }, [mode, neuralNetwork, initializeNeuralNetwork]);

  // Generate random food position
  const generateFood = useCallback(
    (snake = gameState.snake) => {
      let newFood: Cell = {
        x: Math.floor(Math.random() * boardWidth),
        y: Math.floor(Math.random() * boardHeight),
      };
      let foodOnSnake = true;

      // Keep generating until we find a position not on the snake
      while (foodOnSnake) {
        newFood = {
          x: Math.floor(Math.random() * boardWidth),
          y: Math.floor(Math.random() * boardHeight),
        };

        foodOnSnake = snake.some(
          (segment) => segment.x === newFood.x && segment.y === newFood.y
        );
      }

      return newFood;
    },
    [gameState.snake, boardWidth, boardHeight]
  );

  // Calculate Manhattan distance between two points
  const manhattanDistance = (a: Cell, b: Cell): number => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  };

  // Reset game
  const resetGame = () => {
    setGameState({
      snake: [
        { x: Math.floor(boardWidth / 2), y: Math.floor(boardHeight / 2) },
        { x: Math.floor(boardWidth / 2) - 1, y: Math.floor(boardHeight / 2) },
        { x: Math.floor(boardWidth / 2) - 2, y: Math.floor(boardHeight / 2) },
      ],
      food: generateFood(),
      direction: "RIGHT",
      score: 0,
      gameOver: false,
      speed: 150,
      isPaused: false,
    });

    moves.current = 0;

    // Don't reset the neural network between games
    if (mode === "neural" && !neuralNetwork) {
      console.log("Initializing neural network during reset...");
      initializeNeuralNetwork()
        .then(() => {
          console.log("Neural network initialized successfully during reset");
        })
        .catch((error) => {
          console.error(
            "Failed to initialize neural network during reset:",
            error
          );
        });
    }
  };

  // Move the snake
  const moveSnake = useCallback(() => {
    if (gameState.gameOver || gameState.isPaused) return;

    setGameState((prevState) => {
      // Create a copy of the current snake
      const newSnake = [...prevState.snake];
      const head = { ...newSnake[0] };

      // Determine direction
      let newDirection = prevState.direction;

      // If in neural mode, get direction from neural network
      if (mode === "neural" && neuralNetwork) {
        // Get direction from neural network
        const aiDirection = getNextDirection(
          prevState.snake,
          prevState.food,
          prevState.direction,
          boardWidth,
          boardHeight
        );

        // Use the AI's direction if it's valid (not opposite of current direction)
        const oppositeDirections: Record<Direction, Direction> = {
          UP: "DOWN",
          DOWN: "UP",
          LEFT: "RIGHT",
          RIGHT: "LEFT",
        };

        if (aiDirection !== oppositeDirections[prevState.direction]) {
          newDirection = aiDirection;
          console.log(`AI chose direction: ${newDirection}`);
        } else {
          console.log(
            `AI tried to go backwards (${aiDirection}), keeping current direction: ${prevState.direction}`
          );
        }
      }

      // Move head in the current direction
      switch (newDirection) {
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

      // Check for collisions with walls
      if (
        head.x < 0 ||
        head.x >= boardWidth ||
        head.y < 0 ||
        head.y >= boardHeight
      ) {
        // Death penalty calculation
        if (mode === "neural") {
          // Base penalty for dying
          const deathPenalty = -15;

          // Additional penalty based on distance to food
          const distanceToFood = manhattanDistance(head, prevState.food);
          const distancePenalty = -distanceToFood / 5;

          // Additional penalty based on score (higher score = less penalty)
          const scorePenalty = Math.min(0, prevState.score / 2);

          // Additional penalty for dying early
          const movesPenalty = Math.min(0, moves.current / 50 - 2);

          // Final death reward
          const finalReward =
            deathPenalty + distancePenalty + scorePenalty + movesPenalty;

          console.log(
            `Death reward: ${finalReward.toFixed(2)} (wall collision)`
          );

          // Apply the reward
          updateNeuralNetwork(finalReward);

          // Update best score
          updateBestScore(prevState.score);

          // Auto-restart for training
          if (isLearning) {
            setTimeout(() => {
              incrementGeneration();
              resetGame();
            }, 500 / speedMultiplier); // Faster restart at higher speeds
          }
        }

        return {
          ...prevState,
          gameOver: true,
        };
      }

      // Check for collisions with self
      for (let i = 0; i < newSnake.length; i++) {
        if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
          // Death penalty calculation (same as wall collision)
          if (mode === "neural") {
            const deathPenalty = -15;
            const distanceToFood = manhattanDistance(head, prevState.food);
            const distancePenalty = -distanceToFood / 5;
            const scorePenalty = Math.min(0, prevState.score / 2);
            const movesPenalty = Math.min(0, moves.current / 50 - 2);
            const finalReward =
              deathPenalty + distancePenalty + scorePenalty + movesPenalty;

            console.log(
              `Death reward: ${finalReward.toFixed(2)} (self collision)`
            );

            updateNeuralNetwork(finalReward);
            updateBestScore(prevState.score);

            if (isLearning) {
              setTimeout(() => {
                incrementGeneration();
                resetGame();
              }, 500 / speedMultiplier);
            }
          }

          return {
            ...prevState,
            gameOver: true,
          };
        }
      }

      // Add new head to the beginning of the snake
      newSnake.unshift(head);

      // Check if snake ate food
      if (head.x === prevState.food.x && head.y === prevState.food.y) {
        // Food reward calculation
        if (mode === "neural") {
          // Base reward for eating food
          const foodReward = 15;

          // Additional reward based on snake length (encourages growth)
          const lengthBonus = Math.min(10, newSnake.length / 3);

          // Additional reward for efficiency (fewer moves is better)
          const moveEfficiencyBonus = Math.max(0, 10 - moves.current / 10);

          // Final food reward
          const finalReward = foodReward + lengthBonus + moveEfficiencyBonus;

          console.log(
            `Food reward: ${finalReward.toFixed(2)}, moves: ${
              moves.current
            }, length: ${newSnake.length}`
          );

          updateNeuralNetwork(finalReward);
          moves.current = 0; // Reset move counter after eating
        }

        // Generate new food
        const newFood = generateFood(newSnake);

        return {
          ...prevState,
          snake: newSnake,
          food: newFood,
          score: prevState.score + 1,
          direction: newDirection,
        };
      } else {
        // Remove tail
        newSnake.pop();

        // Movement reward calculation
        if (mode === "neural") {
          // Calculate distance to food before and after move
          const oldHead = prevState.snake[0];
          const oldDistance = manhattanDistance(oldHead, prevState.food);
          const newDistance = manhattanDistance(head, prevState.food);

          // Base reward for moving closer to food
          let moveReward = oldDistance > newDistance ? 0.2 : -0.2;

          // Penalty for being too close to walls
          if (
            head.x <= 1 ||
            head.x >= boardWidth - 2 ||
            head.y <= 1 ||
            head.y >= boardHeight - 2
          ) {
            moveReward -= 0.1;
          }

          // Penalty for moving in circles - increases with snake length and moves
          if (moves.current > 50) {
            const circlingPenalty =
              0.8 *
              (1 + Math.min(2, prevState.snake.length / 10)) *
              (1 + Math.min(3, moves.current / 100));
            moveReward -= circlingPenalty;

            console.log(
              `Circle penalty: -${circlingPenalty.toFixed(2)} after ${
                moves.current
              } moves`
            );
          }

          // Larger penalty for very long games with no progress
          if (moves.current > 150) {
            const stalePenalty =
              2.0 * (1 + Math.min(2, prevState.snake.length / 10));
            moveReward -= stalePenalty;

            console.log(
              `Stale game penalty: -${stalePenalty.toFixed(2)} after ${
                moves.current
              } moves`
            );
          }

          // Force game over if snake is clearly stuck in a loop
          if (moves.current > 300) {
            console.log(
              `Forcing game over after ${moves.current} moves without eating`
            );

            // Apply a severe penalty
            const timeoutPenalty = -20;
            updateNeuralNetwork(timeoutPenalty);
            updateBestScore(prevState.score);

            // Auto-restart for training
            if (isLearning) {
              setTimeout(() => {
                incrementGeneration();
                resetGame();
              }, 500 / speedMultiplier);
            }

            return {
              ...prevState,
              gameOver: true,
            };
          }

          // Apply the reward
          updateNeuralNetwork(moveReward);
        }

        return {
          ...prevState,
          snake: newSnake,
          direction: newDirection,
        };
      }
    });
  }, [
    gameState,
    generateFood,
    mode,
    neuralNetwork,
    getNextDirection,
    speedMultiplier,
    moves,
    boardWidth,
    boardHeight,
    isLearning,
    updateNeuralNetwork,
    updateBestScore,
    incrementGeneration,
    resetGame,
  ]);

  // Calculate penalty for being too close to walls
  const calculateWallProximityPenalty = (head: Cell) => {
    const distToTop = head.y;
    const distToBottom = boardHeight - 1 - head.y;
    const distToLeft = head.x;
    const distToRight = boardWidth - 1 - head.x;

    // Only penalize if very close to walls (within 2 cells)
    const topPenalty = distToTop <= 1 ? 2 - distToTop : 0;
    const bottomPenalty = distToBottom <= 1 ? 2 - distToBottom : 0;
    const leftPenalty = distToLeft <= 1 ? 2 - distToLeft : 0;
    const rightPenalty = distToRight <= 1 ? 2 - distToRight : 0;

    return topPenalty + bottomPenalty + leftPenalty + rightPenalty;
  };

  // Game loop
  useEffect(() => {
    if (!isActive) return;

    const gameInterval = setInterval(
      moveSnake,
      gameState.speed / speedMultiplier
    );

    return () => {
      clearInterval(gameInterval);
    };
  }, [isActive, moveSnake, gameState.speed, speedMultiplier]);

  // Handle keyboard input
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for arrow keys to avoid page scrolling
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
          e.key
        )
      ) {
        e.preventDefault();
      }

      if (gameState.gameOver) {
        if (e.key === "Enter") {
          resetGame();
        }
        return;
      }

      // Only allow manual control in normal mode or when not learning
      if (mode === "normal" || (mode === "neural" && !isLearning)) {
        switch (e.key) {
          case "ArrowUp":
            if (gameState.direction !== "DOWN") {
              setGameState((prev) => ({
                ...prev,
                direction: "UP",
              }));
            }
            break;
          case "ArrowDown":
            if (gameState.direction !== "UP") {
              setGameState((prev) => ({
                ...prev,
                direction: "DOWN",
              }));
            }
            break;
          case "ArrowLeft":
            if (gameState.direction !== "RIGHT") {
              setGameState((prev) => ({
                ...prev,
                direction: "LEFT",
              }));
            }
            break;
          case "ArrowRight":
            if (gameState.direction !== "LEFT") {
              setGameState((prev) => ({
                ...prev,
                direction: "RIGHT",
              }));
            }
            break;
        }
      }

      switch (e.key) {
        case "p":
          setGameState((prev) => ({
            ...prev,
            isPaused: !prev.isPaused,
          }));
          break;
        case "Escape":
          onClose();
          break;
        case "l":
          if (mode === "neural") {
            toggleLearning();
          }
          break;
        case "i":
          if (mode === "neural") {
            toggleInfo();
          }
          break;
        // Speed multiplier controls
        case "1":
          setSpeedMultiplier(1);
          break;
        case "2":
          setSpeedMultiplier(2);
          break;
        case "5":
          setSpeedMultiplier(5);
          break;
        case "0":
          setSpeedMultiplier(10); // Use 0 key for 10x speed
          break;
        case "9":
          setSpeedMultiplier(50); // Use 9 key for 50x speed
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isActive,
    gameState,
    onClose,
    mode,
    isLearning,
    toggleLearning,
    toggleInfo,
  ]);

  // Render neural info panel if enabled
  const renderNeuralInfoPanel = () => {
    if (!showNeuralInfo) return null;

    return (
      <NeuralInfoPanel
        generation={generation}
        bestScore={bestScore}
        currentScore={gameState.score}
        isLearning={isLearning}
        moves={moves.current}
        toggleLearning={toggleLearning}
        toggleInfo={toggleInfo}
        boardHeight={boardHeight}
        cellSize={cellSize}
        speedMultiplier={speedMultiplier}
        gpuEnabled={gpuEnabled}
      />
    );
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
          width: mode === "neural" ? "500px" : "360px",
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
            {mode === "neural"
              ? "SNAKE.EXE - NEURAL NETWORK MODE"
              : "SNAKE.EXE"}
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
            flexDirection: mode === "neural" ? "row" : "column",
            alignItems: "center",
            gap: theme.spacing.md,
          }}
        >
          <div
            style={{
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
              <p style={{ color: theme.colors.accent6 }}>
                Score: {gameState.score}
              </p>
              <div style={{ display: "flex", gap: theme.spacing.sm }}>
                {mode === "neural" && (
                  <p
                    style={{
                      color:
                        speedMultiplier === 50
                          ? theme.colors.accent1
                          : theme.colors.accent2,
                      fontWeight: speedMultiplier === 50 ? "bold" : "normal",
                      textShadow:
                        speedMultiplier === 50
                          ? theme.shadows.neon.pink
                          : "none",
                    }}
                  >
                    Speed: {speedMultiplier}x
                    {speedMultiplier === 50 && " (ULTRA)"}
                  </p>
                )}
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
            </div>

            <GameBoard
              gameState={gameState}
              cellSize={cellSize}
              boardWidth={boardWidth}
              boardHeight={boardHeight}
              isLearning={mode === "neural" && isLearning}
              resetGame={resetGame}
            />

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
              {mode === "neural" && (
                <>
                  <p>L : Toggle Learning</p>
                  <p>I : Toggle Info Panel</p>
                  <p>1, 2, 5, 0, 9 : Speed (1x, 2x, 5x, 10x default, 50x)</p>
                </>
              )}
              <p>ESC : Close</p>
            </div>

            <div className="game-info">
              <p>Score: {gameState.score}</p>
              <p
                style={{
                  color: speedMultiplier === 50 ? "#ff69b4" : "inherit",
                  fontWeight: speedMultiplier === 50 ? "bold" : "normal",
                  textShadow:
                    speedMultiplier === 50
                      ? "0 0 5px rgba(255, 105, 180, 0.7)"
                      : "none",
                }}
              >
                Speed: {speedMultiplier}x{speedMultiplier === 50 && " (ULTRA)"}
              </p>
              {mode === "neural" && (
                <p>
                  GPU:{" "}
                  <span style={{ color: gpuEnabled ? "#4CAF50" : "#f44336" }}>
                    {gpuEnabled ? "Enabled ✓" : "Disabled ✗"}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Neural Network Info Panel */}
          {renderNeuralInfoPanel()}
        </div>
      </div>
    </div>
  );
};

export default Snake;
