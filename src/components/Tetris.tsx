import React, { useState, useEffect, useCallback } from "react";
import theme from "./style/theme";

// Tetris piece shapes
const TETROMINOS = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: theme.colors.accent2,
  },
  J: {
    shape: [
      [0, 0, 0],
      [2, 2, 2],
      [0, 0, 2],
    ],
    color: theme.colors.accent3,
  },
  L: {
    shape: [
      [0, 0, 0],
      [3, 3, 3],
      [3, 0, 0],
    ],
    color: theme.colors.accent7,
  },
  O: {
    shape: [
      [4, 4],
      [4, 4],
    ],
    color: theme.colors.accent1,
  },
  S: {
    shape: [
      [0, 0, 0],
      [0, 5, 5],
      [5, 5, 0],
    ],
    color: theme.colors.accent6,
  },
  T: {
    shape: [
      [0, 0, 0],
      [6, 6, 6],
      [0, 6, 0],
    ],
    color: theme.colors.primary,
  },
  Z: {
    shape: [
      [0, 0, 0],
      [7, 7, 0],
      [0, 7, 7],
    ],
    color: theme.colors.accent4,
  },
};

// Random tetromino generator
const randomTetromino = () => {
  const tetrominos = "IJLOSTZ";
  const randTetromino =
    tetrominos[Math.floor(Math.random() * tetrominos.length)];
  return TETROMINOS[randTetromino as keyof typeof TETROMINOS];
};

// Create game board
const createBoard = () => {
  return Array.from(Array(20), () => Array(10).fill(0));
};

interface TetrisProps {
  isActive: boolean;
  onClose: () => void;
}

const Tetris: React.FC<TetrisProps> = ({ isActive, onClose }) => {
  const [board, setBoard] = useState(createBoard());
  const [currentPiece, setCurrentPiece] = useState(randomTetromino());
  const [position, setPosition] = useState({ x: 3, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Check for collisions
  const checkCollision = useCallback(
    (piece: typeof currentPiece, pos: typeof position) => {
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          // Check if piece cell exists and is not empty
          if (
            piece.shape[y][x] !== 0 &&
            // Check if the move is inside the game area height (y)
            (board[y + pos.y] === undefined ||
              // Check if the move is inside the game area width (x)
              board[y + pos.y][x + pos.x] === undefined ||
              // Check if the cell is already occupied
              board[y + pos.y][x + pos.x] !== 0)
          ) {
            return true;
          }
        }
      }
      return false;
    },
    [board]
  );

  // Rotate a tetromino
  const rotate = (piece: typeof currentPiece) => {
    // Transpose the matrix
    const rotatedPiece = piece.shape.map((_, index) =>
      piece.shape.map((col) => col[index])
    );
    // Reverse each row to get a rotated matrix
    return {
      ...piece,
      shape: rotatedPiece.map((row) => row.reverse()),
    };
  };

  // Move the tetromino
  const moveTetromino = (x: number, y: number) => {
    if (!gameOver && !isPaused) {
      const newPos = { x: position.x + x, y: position.y + y };
      if (!checkCollision(currentPiece, newPos)) {
        setPosition(newPos);
      } else if (y > 0) {
        // We've hit something while moving down
        // Time to freeze the piece and create a new one
        updateBoard();
        // Check if game over
        if (position.y <= 1) {
          setGameOver(true);
          return;
        }
        // Get new tetromino
        setCurrentPiece(randomTetromino());
        setPosition({ x: 3, y: 0 });
      }
    }
  };

  // Update the board when a piece is placed
  const updateBoard = () => {
    const newBoard = [...board];
    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          newBoard[y + position.y][x + position.x] = value;
        }
      });
    });

    // Check for completed rows
    let rowsCleared = 0;
    for (let y = 0; y < newBoard.length; y++) {
      if (newBoard[y].every((cell) => cell !== 0)) {
        rowsCleared++;
        // Remove the row and add an empty one at the top
        newBoard.splice(y, 1);
        newBoard.unshift(Array(10).fill(0));
      }
    }

    // Update score
    if (rowsCleared > 0) {
      setScore((prev) => prev + rowsCleared * 100);
    }

    setBoard(newBoard);
  };

  // Handle key presses
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (gameOver || !isActive) return;

      // Prevent default behavior for arrow keys to avoid page scrolling
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === "ArrowLeft") {
        moveTetromino(-1, 0);
      } else if (e.key === "ArrowRight") {
        moveTetromino(1, 0);
      } else if (e.key === "ArrowDown") {
        moveTetromino(0, 1);
      } else if (e.key === "ArrowUp") {
        const rotated = rotate(currentPiece);
        if (!checkCollision(rotated, position)) {
          setCurrentPiece(rotated);
        }
      } else if (e.key === "p") {
        setIsPaused(!isPaused);
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [
      currentPiece,
      position,
      gameOver,
      isPaused,
      isActive,
      checkCollision,
      onClose,
    ]
  );

  // Set up game loop
  useEffect(() => {
    if (!isActive) return;

    const gameLoop = setInterval(() => {
      if (!gameOver && !isPaused) {
        moveTetromino(0, 1);
      }
    }, 500);

    return () => {
      clearInterval(gameLoop);
    };
  }, [isActive, gameOver, isPaused, position]);

  // Set up key listeners
  useEffect(() => {
    if (isActive) {
      window.addEventListener("keydown", handleKeyPress);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isActive, handleKeyPress]);

  // Reset game
  const resetGame = () => {
    setBoard(createBoard());
    setCurrentPiece(randomTetromino());
    setPosition({ x: 3, y: 0 });
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  // Render the current piece on the board
  const renderPiece = () => {
    return currentPiece.shape.map((row, y) => {
      return row.map((cell, x) => {
        if (cell !== 0) {
          return (
            <div
              key={`piece-${y}-${x}`}
              style={{
                position: "absolute",
                top: `${(y + position.y) * 20}px`,
                left: `${(x + position.x) * 20}px`,
                width: "18px",
                height: "18px",
                backgroundColor: currentPiece.color,
                border: `1px solid ${theme.colors.backgroundDark}`,
                boxShadow: `0 0 5px ${currentPiece.color}`,
              }}
            />
          );
        }
        return null;
      });
    });
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
          border: `${theme.borders.width.medium} ${theme.borders.style.solid} ${theme.colors.accent5}`,
          borderRadius: theme.borders.radius.md,
          padding: theme.spacing.lg,
          boxShadow: theme.shadows.neon.purple,
          position: "relative",
          width: "320px",
        }}
      >
        <div
          style={{
            backgroundColor: theme.colors.accent5,
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
            TETRIS.EXE
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
                backgroundColor: theme.colors.accent3,
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
              width: "200px",
              height: "400px",
              border: `${theme.borders.width.medium} ${theme.borders.style.solid} ${theme.colors.accent5}`,
              backgroundColor: theme.colors.backgroundDark,
              overflow: "hidden",
            }}
          >
            {/* Render the board */}
            {board.map((row, y) =>
              row.map((cell, x) => {
                if (cell !== 0) {
                  const tetromino = Object.values(TETROMINOS)[cell - 1];
                  return (
                    <div
                      key={`${y}-${x}`}
                      style={{
                        position: "absolute",
                        top: `${y * 20}px`,
                        left: `${x * 20}px`,
                        width: "18px",
                        height: "18px",
                        backgroundColor: tetromino.color,
                        border: `1px solid ${theme.colors.backgroundDark}`,
                        boxShadow: `0 0 5px ${tetromino.color}`,
                      }}
                    />
                  );
                }
                return null;
              })
            )}

            {/* Render the current piece */}
            {!gameOver && renderPiece()}

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
                  color: theme.colors.accent4,
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
                <button
                  onClick={resetGame}
                  style={{
                    backgroundColor: theme.colors.accent4,
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
                  color: theme.colors.accent2,
                  textShadow: theme.shadows.neon.blue,
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
            <p>← → : Move</p>
            <p>↑ : Rotate</p>
            <p>↓ : Drop</p>
            <p>P : Pause</p>
            <p>ESC : Close</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tetris;
