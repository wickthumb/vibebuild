import React, { useState, useEffect } from "react";
import theme from "./style/theme";

interface MemoryGameProps {
  isActive: boolean;
  onClose: () => void;
}

// Card interface
interface Card {
  id: number;
  type: string;
  flipped: boolean;
  matched: boolean;
}

const MemoryGame: React.FC<MemoryGameProps> = ({ isActive, onClose }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Card symbols (using emoji for simplicity)
  const cardSymbols = ["🚀", "🌟", "🔮", "💎", "🎮", "🎧", "💻", "🎲"];

  // Initialize game
  const initializeGame = () => {
    // Create pairs of cards
    const cardPairs = [...cardSymbols, ...cardSymbols].map((type, index) => ({
      id: index,
      type,
      flipped: false,
      matched: false,
    }));

    // Shuffle cards
    const shuffledCards = shuffleArray(cardPairs);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setGameOver(false);
    setGameStarted(true);
  };

  // Shuffle array (Fisher-Yates algorithm)
  const shuffleArray = (array: Card[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Handle card click
  const handleCardClick = (id: number) => {
    // Ignore if game is over or card is already flipped/matched
    const card = cards.find((card) => card.id === id);
    if (
      gameOver ||
      !card ||
      card.flipped ||
      card.matched ||
      flippedCards.length >= 2
    ) {
      return;
    }

    // Flip the card
    const newCards = cards.map((card) =>
      card.id === id ? { ...card, flipped: true } : card
    );
    setCards(newCards);

    // Add to flipped cards
    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    // If two cards are flipped, check for a match
    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstId, secondId] = newFlippedCards;
      const firstCard = newCards.find((card) => card.id === firstId);
      const secondCard = newCards.find((card) => card.id === secondId);

      if (firstCard && secondCard && firstCard.type === secondCard.type) {
        // Match found
        setTimeout(() => {
          const matchedCards = newCards.map((card) =>
            card.id === firstId || card.id === secondId
              ? { ...card, matched: true }
              : card
          );
          setCards(matchedCards);
          setFlippedCards([]);

          // Check if all cards are matched
          if (matchedCards.every((card) => card.matched)) {
            setGameOver(true);
          }
        }, 500);
      } else {
        // No match, flip cards back
        setTimeout(() => {
          const resetCards = newCards.map((card) =>
            card.id === firstId || card.id === secondId
              ? { ...card, flipped: false }
              : card
          );
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Initialize game when component mounts
  useEffect(() => {
    if (isActive && !gameStarted) {
      initializeGame();
    }
  }, [isActive, gameStarted]);

  // Handle keyboard input
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for arrow keys to avoid page scrolling
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.key)) {
        e.preventDefault();
      }
      
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "r") {
        initializeGame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, onClose]);

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
          border: `${theme.borders.width.medium} ${theme.borders.style.solid} ${theme.colors.accent2}`,
          borderRadius: theme.borders.radius.md,
          padding: theme.spacing.lg,
          boxShadow: theme.shadows.neon.blue,
          position: "relative",
          width: "400px",
        }}
      >
        <div
          style={{
            backgroundColor: theme.colors.accent2,
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
            MEMORY.EXE
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
            <p style={{ color: theme.colors.accent6 }}>Moves: {moves}</p>
            <button
              onClick={initializeGame}
              style={{
                backgroundColor: theme.colors.accent2,
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
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: theme.spacing.sm,
              width: "320px",
              height: "320px",
            }}
          >
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                style={{
                  width: "70px",
                  height: "70px",
                  backgroundColor:
                    card.flipped || card.matched
                      ? theme.colors.backgroundLight
                      : theme.colors.accent2,
                  border: `${theme.borders.width.thin} ${
                    theme.borders.style.solid
                  } ${
                    card.matched
                      ? theme.colors.accent6
                      : card.flipped
                      ? theme.colors.accent2
                      : theme.colors.backgroundLight
                  }`,
                  borderRadius: theme.borders.radius.sm,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  fontSize: "24px",
                  boxShadow: card.matched
                    ? `0 0 10px ${theme.colors.accent6}`
                    : card.flipped
                    ? `0 0 5px ${theme.colors.accent2}`
                    : "none",
                  transition: "all 0.3s ease",
                  transform:
                    card.flipped || card.matched
                      ? "rotateY(180deg)"
                      : "rotateY(0)",
                }}
              >
                {(card.flipped || card.matched) && card.type}
              </div>
            ))}
          </div>

          {gameOver && (
            <div
              style={{
                marginTop: theme.spacing.lg,
                padding: theme.spacing.md,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                borderRadius: theme.borders.radius.md,
                textAlign: "center",
                color: theme.colors.accent6,
                textShadow: theme.shadows.neon.teal,
              }}
            >
              <p
                style={{
                  fontSize: theme.fonts.size.lg,
                  marginBottom: theme.spacing.sm,
                }}
              >
                Congratulations!
              </p>
              <p>You completed the game in {moves} moves!</p>
              <button
                onClick={initializeGame}
                style={{
                  backgroundColor: theme.colors.accent6,
                  color: theme.textColors.inverse,
                  border: "none",
                  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                  borderRadius: theme.borders.radius.sm,
                  cursor: "pointer",
                  marginTop: theme.spacing.md,
                }}
              >
                Play Again
              </button>
            </div>
          )}

          <div
            style={{
              marginTop: theme.spacing.md,
              color: theme.textColors.secondary,
              fontSize: theme.fonts.size.sm,
              textAlign: "center",
            }}
          >
            <p>Controls:</p>
            <p>Click cards to flip them</p>
            <p>R : Reset game</p>
            <p>ESC : Close</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryGame;
