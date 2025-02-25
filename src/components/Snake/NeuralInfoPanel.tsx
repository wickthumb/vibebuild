import React from "react";
import { NeuralInfoPanelProps } from "./types";

const NeuralInfoPanel: React.FC<NeuralInfoPanelProps> = ({
  generation,
  bestScore,
  currentScore,
  isLearning,
  moves,
  toggleLearning,
  toggleInfo,
  boardHeight,
  cellSize,
  speedMultiplier,
  gpuEnabled,
}) => {
  return (
    <div className="neural-info-panel">
      <h3>Neural Network Info</h3>
      <div style={{ margin: 0 }}>
        <p style={{ margin: 0 }}>
          Generation: <strong>{generation}</strong>
        </p>
        <p style={{ margin: 0 }}>
          Best Score: <strong>{bestScore}</strong>
        </p>
        <p style={{ margin: 0 }}>
          Current Score: <strong>{currentScore}</strong>
        </p>
        <p style={{ margin: 0 }}>
          Moves: <strong>{moves}</strong>
        </p>
        <p
          style={{
            margin: 0,
            color: speedMultiplier === 50 ? "#ff69b4" : "inherit",
            fontWeight: speedMultiplier === 50 ? "bold" : "normal",
            textShadow:
              speedMultiplier === 50 ? "0 0 5px rgba(255, 105, 180, 0.7)" : "none",
          }}
        >
          Speed: <strong>{speedMultiplier}x</strong>
          {speedMultiplier === 50 && " (ULTRA)"}
        </p>
        <p style={{ margin: 0 }}>
          GPU Acceleration:{" "}
          <strong style={{ color: gpuEnabled ? "#4CAF50" : "#f44336" }}>
            {gpuEnabled ? "Enabled ✓" : "Disabled ✗"}
          </strong>
          {gpuEnabled && <span style={{ color: "#4CAF50" }}> (Faster Training)</span>}
        </p>
        <p style={{ margin: 0 }}>
          Learning:{" "}
          <strong style={{ color: isLearning ? "#4CAF50" : "#f44336" }}>
            {isLearning ? "ON" : "OFF"}
          </strong>
        </p>
      </div>
      <div className="neural-controls" style={{ marginTop: 10 }}>
        <button
          onClick={toggleLearning}
          style={{
            backgroundColor: isLearning ? "#f44336" : "#4CAF50",
            color: "white",
            border: "none",
            padding: "5px 10px",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "5px",
          }}
        >
          {isLearning ? "Pause Learning" : "Resume Learning"}
        </button>
        <button
          onClick={toggleInfo}
          style={{
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            padding: "5px 10px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Hide Panel
        </button>
      </div>
      <div style={{ marginTop: 10, fontSize: "0.9em", color: "#666" }}>
        <p style={{ margin: 0 }}>
          Press L to toggle learning on/off
        </p>
        <p style={{ margin: 0 }}>
          Press I to toggle this info panel
        </p>
        <p style={{ margin: 0 }}>
          Press 1, 2, 5, 0, 9 to change speed (10x default, 50x for ultra-fast
          training)
        </p>
      </div>
    </div>
  );
};

export default NeuralInfoPanel;
