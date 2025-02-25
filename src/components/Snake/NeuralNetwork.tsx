import { useRef, useState, useEffect } from "react";
import { Cell, Direction } from "./types.ts";
import * as tf from "@tensorflow/tfjs";

// Neural Network types
export interface NeuralNetwork {
  model: tf.LayersModel;
  isInitialized: boolean;
}

export interface NeuralNetworkState {
  neuralNetwork: NeuralNetwork | null;
  isLearning: boolean;
  generation: number;
  bestScore: number;
  showNeuralInfo: boolean;
  gpuEnabled: boolean;
}

export interface NeuralNetworkHook extends NeuralNetworkState {
  trainingData: React.MutableRefObject<
    {
      state: number[];
      action: number;
      reward: number;
      nextState: number[];
      done: boolean;
    }[]
  >;
  moves: React.MutableRefObject<number>;
  initializeNeuralNetwork: () => Promise<void>;
  updateNeuralNetwork: (reward: number) => void;
  getNextDirection: (
    snake: Cell[],
    food: Cell,
    currentDirection: Direction,
    boardWidth: number,
    boardHeight: number
  ) => Direction;
  toggleLearning: () => void;
  toggleInfo: () => void;
  incrementGeneration: () => void;
  updateBestScore: (score: number) => void;
}

export const useNeuralNetwork = (
  boardWidth: number,
  boardHeight: number
): NeuralNetworkHook => {
  const [neuralNetwork, setNeuralNetwork] = useState<NeuralNetwork | null>(
    null
  );
  const [isLearning, setIsLearning] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [showNeuralInfo, setShowNeuralInfo] = useState(true);
  const [gpuEnabled, setGpuEnabled] = useState(false);

  // Enhanced training data structure for Q-learning
  const trainingData = useRef<
    {
      state: number[];
      action: number;
      reward: number;
      nextState: number[];
      done: boolean;
    }[]
  >([]);

  const moves = useRef<number>(0);
  const lastState = useRef<number[]>([]);
  const lastAction = useRef<number>(0);
  const batchTrainingInProgress = useRef<boolean>(false);

  // Cache for recent predictions to avoid async issues
  const predictionCache = useRef<Map<string, Direction>>(new Map());

  // Initialize TensorFlow.js with GPU support
  useEffect(() => {
    const setupTensorflow = async () => {
      try {
        // Try to enable WebGL for GPU acceleration
        await tf.setBackend("webgl");
        const backend = tf.getBackend();
        setGpuEnabled(backend === "webgl");
        console.log(`TensorFlow.js is using ${backend} backend`);
      } catch (error) {
        console.warn(
          "GPU acceleration not available, falling back to CPU",
          error
        );
        await tf.setBackend("cpu");
        setGpuEnabled(false);
      }
    };

    setupTensorflow();
  }, []);

  // Initialize a neural network with TensorFlow.js
  const initializeNeuralNetwork = async () => {
    // Input layer: Grid state (boardWidth * boardHeight) + 4 for direction + 4 for distances + 4 for danger
    // Hidden layers: Three layers with decreasing neuron counts
    // Output layer: 4 neurons (one for each direction)
    const inputSize = boardWidth * boardHeight + 4 + 4 + 4;

    try {
      // Create a sequential model
      const model = tf.sequential();

      // Add first hidden layer with ReLU activation
      model.add(
        tf.layers.dense({
          units: 512,
          inputShape: [inputSize],
          kernelInitializer: "glorotUniform",
          activation: "relu",
        })
      );

      // Add dropout to prevent overfitting
      model.add(tf.layers.dropout({ rate: 0.3 }));

      // Add second hidden layer
      model.add(
        tf.layers.dense({
          units: 256,
          kernelInitializer: "glorotUniform",
          activation: "relu",
        })
      );

      // Add dropout to prevent overfitting
      model.add(tf.layers.dropout({ rate: 0.3 }));

      // Add third hidden layer
      model.add(
        tf.layers.dense({
          units: 128,
          kernelInitializer: "glorotUniform",
          activation: "relu",
        })
      );

      // Add dropout to prevent overfitting
      model.add(tf.layers.dropout({ rate: 0.2 }));

      // Add output layer with sigmoid activation
      model.add(
        tf.layers.dense({
          units: 4,
          kernelInitializer: "glorotUniform",
          activation: "sigmoid",
        })
      );

      // Compile the model with a better optimizer
      model.compile({
        optimizer: tf.train.adam(0.0003),
        loss: "meanSquaredError",
      });

      // Log model summary
      model.summary();

      setNeuralNetwork({
        model,
        isInitialized: true,
      });

      console.log("Neural network initialized with TensorFlow.js");
    } catch (error) {
      console.error("Failed to initialize neural network:", error);
    }
  };

  // Create a comprehensive grid state representation
  const createGridState = (
    snake: Cell[],
    food: Cell,
    currentDir: Direction,
    boardWidth: number,
    boardHeight: number
  ): number[] => {
    // Initialize grid with zeros
    const grid = Array(boardWidth * boardHeight).fill(0);

    // Mark snake body with different values based on distance from head
    // This helps the network understand the snake's shape and direction
    for (let i = 1; i < snake.length; i++) {
      const index = snake[i].y * boardWidth + snake[i].x;
      if (index >= 0 && index < grid.length) {
        // Normalize the body segment value based on position
        // Segments closer to head have stronger negative values
        const normalizedValue =
          -1.0 * (1.0 - Math.min(0.8, (i - 1) / snake.length));
        grid[index] = normalizedValue;
      }
    }

    // Mark snake head with -2
    const headIndex = snake[0].y * boardWidth + snake[0].x;
    if (headIndex >= 0 && headIndex < grid.length) {
      grid[headIndex] = -2;
    }

    // Mark food with 1
    const foodIndex = food.y * boardWidth + food.x;
    if (foodIndex >= 0 && foodIndex < grid.length) {
      grid[foodIndex] = 1;
    }

    // Add walls as -0.5 (boundaries)
    for (let i = 0; i < boardWidth; i++) {
      // Top wall
      grid[i] = grid[i] === 0 ? -0.5 : grid[i];
      // Bottom wall
      grid[(boardHeight - 1) * boardWidth + i] =
        grid[(boardHeight - 1) * boardWidth + i] === 0
          ? -0.5
          : grid[(boardHeight - 1) * boardWidth + i];
    }

    for (let i = 0; i < boardHeight; i++) {
      // Left wall
      grid[i * boardWidth] =
        grid[i * boardWidth] === 0 ? -0.5 : grid[i * boardWidth];
      // Right wall
      grid[i * boardWidth + boardWidth - 1] =
        grid[i * boardWidth + boardWidth - 1] === 0
          ? -0.5
          : grid[i * boardWidth + boardWidth - 1];
    }

    // Add distance to food in each direction
    const head = snake[0];
    const distanceUp = head.y - food.y;
    const distanceDown = food.y - head.y;
    const distanceLeft = head.x - food.x;
    const distanceRight = food.x - head.x;

    // Normalize distances to [-1, 1] range
    const maxDistance = Math.max(boardWidth, boardHeight);
    const normalizedDistances = [
      distanceUp > 0 ? distanceUp / maxDistance : 0,
      distanceDown > 0 ? distanceDown / maxDistance : 0,
      distanceLeft > 0 ? distanceLeft / maxDistance : 0,
      distanceRight > 0 ? distanceRight / maxDistance : 0,
    ];

    // Add current direction as one-hot encoding
    const directionOneHot = [0, 0, 0, 0];
    if (currentDir === "UP") directionOneHot[0] = 1;
    else if (currentDir === "DOWN") directionOneHot[1] = 1;
    else if (currentDir === "LEFT") directionOneHot[2] = 1;
    else if (currentDir === "RIGHT") directionOneHot[3] = 1;

    // Add danger signals in each direction
    const dangerSignals = [
      isDanger(head, snake, "UP", boardWidth, boardHeight) ? 1 : 0,
      isDanger(head, snake, "DOWN", boardWidth, boardHeight) ? 1 : 0,
      isDanger(head, snake, "LEFT", boardWidth, boardHeight) ? 1 : 0,
      isDanger(head, snake, "RIGHT", boardWidth, boardHeight) ? 1 : 0,
    ];

    return [
      ...grid,
      ...directionOneHot,
      ...normalizedDistances,
      ...dangerSignals,
    ];
  };

  // Calculate Manhattan distance between two points
  const manhattanDistance = (a: Cell, b: Cell): number => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  };

  // Helper function to check if a move would be dangerous
  const isDanger = (
    head: Cell,
    snake: Cell[],
    direction: Direction,
    boardWidth: number,
    boardHeight: number
  ): boolean => {
    // Calculate where the head would be after moving in the given direction
    let newHead = { ...head };

    switch (direction) {
      case "UP":
        newHead.y -= 1;
        break;
      case "DOWN":
        newHead.y += 1;
        break;
      case "LEFT":
        newHead.x -= 1;
        break;
      case "RIGHT":
        newHead.x += 1;
        break;
    }

    // Check if the new position would hit a wall
    if (
      newHead.x < 0 ||
      newHead.x >= boardWidth ||
      newHead.y < 0 ||
      newHead.y >= boardHeight
    ) {
      return true; // Danger!
    }

    // Check if the new position would hit the snake body
    for (let i = 0; i < snake.length - 1; i++) {
      if (newHead.x === snake[i].x && newHead.y === snake[i].y) {
        return true; // Danger!
      }
    }

    return false; // Safe
  };

  // Forward pass through the neural network using TensorFlow.js
  const forwardPass = async (inputs: number[]): Promise<number[]> => {
    if (!neuralNetwork || !neuralNetwork.isInitialized) {
      return [0.25, 0.25, 0.25, 0.25]; // Equal probabilities if no network
    }

    try {
      // Convert inputs to tensor
      const inputTensor = tf.tensor2d([inputs]);

      // Run prediction
      const outputTensor = neuralNetwork.model.predict(
        inputTensor
      ) as tf.Tensor;

      // Get output values
      const outputs = await outputTensor.data();

      // Clean up tensors to prevent memory leaks
      inputTensor.dispose();
      outputTensor.dispose();

      // Convert to array and return
      return Array.from(outputs);
    } catch (error) {
      console.error("Error during forward pass:", error);
      return [0.25, 0.25, 0.25, 0.25];
    }
  };

  // Get direction from neural network output with improved decision making
  const getDirectionFromOutput = (
    output: number[],
    snake: Cell[],
    currentDirection: Direction,
    boardWidth: number,
    boardHeight: number
  ): Direction => {
    // Map indices to directions
    const directions: Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"];

    // Prevent 180-degree turns (suicide)
    const oppositeDirections: Record<Direction, Direction> = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT",
    };

    // Apply a penalty to the opposite direction to prevent 180-degree turns
    const adjustedOutput = [...output];
    const oppositeIndex = directions.indexOf(
      oppositeDirections[currentDirection]
    );
    if (oppositeIndex !== -1) {
      adjustedOutput[oppositeIndex] = -Infinity; // Make it impossible to choose
    }

    // Check for dangerous moves and apply penalties
    for (let i = 0; i < directions.length; i++) {
      if (isDanger(snake[0], snake, directions[i], boardWidth, boardHeight)) {
        adjustedOutput[i] = -Infinity; // Avoid dangerous moves
      }
    }

    // If all directions are dangerous, try to find the least dangerous one
    if (adjustedOutput.every((val) => val === -Infinity)) {
      console.log(
        "All directions are dangerous! Trying to find the least bad option..."
      );

      // Reset penalties and just avoid the opposite direction
      adjustedOutput[0] = output[0];
      adjustedOutput[1] = output[1];
      adjustedOutput[2] = output[2];
      adjustedOutput[3] = output[3];

      if (oppositeIndex !== -1) {
        adjustedOutput[oppositeIndex] = -Infinity;
      }

      // If still all directions are -Infinity, just continue in current direction
      if (adjustedOutput.every((val) => val === -Infinity)) {
        const currentIndex = directions.indexOf(currentDirection);
        adjustedOutput[currentIndex] = 0; // At least make current direction possible
      }
    }

    // Get the index of the highest value (best move)
    const bestMoveIndex = adjustedOutput.indexOf(Math.max(...adjustedOutput));

    // Store the action for learning
    lastAction.current = bestMoveIndex;

    return directions[bestMoveIndex];
  };

  // Get the next direction based on neural network
  const getNextDirection = (
    snake: Cell[],
    food: Cell,
    currentDirection: Direction,
    boardWidth: number,
    boardHeight: number
  ): Direction => {
    // Get neural network inputs - comprehensive grid state
    const state = createGridState(
      snake,
      food,
      currentDirection,
      boardWidth,
      boardHeight
    );

    // Store the current state for learning
    lastState.current = state;

    // Increment move counter
    moves.current += 1;

    // Add exploration - occasionally make a random move to break patterns
    // Exploration rate decreases as the snake gets longer (more to lose)
    const explorationRate = Math.max(0.05, 0.3 - snake.length * 0.01);

    // Increase exploration if we've been moving for a while without eating
    const stuckExplorationBonus =
      moves.current > 100 ? Math.min(0.4, moves.current * 0.001) : 0;
    const finalExplorationRate = explorationRate + stuckExplorationBonus;

    // Random exploration to break out of loops
    if (Math.random() < finalExplorationRate) {
      // Get safe directions (avoid walls and self)
      const directions: Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"];
      const oppositeDirections: Record<Direction, Direction> = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT",
      };

      // Filter out the opposite direction and dangerous moves
      const safeDirections = directions.filter(
        (dir) =>
          dir !== oppositeDirections[currentDirection] &&
          !isDanger(snake[0], snake, dir, boardWidth, boardHeight)
      );

      // If there are safe directions, choose one randomly
      if (safeDirections.length > 0) {
        const randomDirection =
          safeDirections[Math.floor(Math.random() * safeDirections.length)];
        console.log(
          `Exploration: Choosing random direction ${randomDirection} (moves: ${moves.current})`
        );

        // Store the action for learning
        lastAction.current = directions.indexOf(randomDirection);

        return randomDirection;
      }
    }

    // Create a cache key from the state
    const cacheKey = JSON.stringify({
      head: snake[0],
      food,
      direction: currentDirection,
      moves: Math.floor(moves.current / 50), // Include moves in cache key to vary behavior over time
    });

    // Check if we have a cached prediction for this state
    if (predictionCache.current.has(cacheKey)) {
      return predictionCache.current.get(cacheKey)!;
    }

    // If no neural network or not initialized, use a simple heuristic
    if (!neuralNetwork || !neuralNetwork.isInitialized) {
      // Simple heuristic: try to move towards food
      const head = snake[0];
      const dx = food.x - head.x;
      const dy = food.y - head.y;

      // Avoid 180-degree turns
      const oppositeDirections: Record<Direction, Direction> = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT",
      };

      // Possible directions excluding the opposite of current direction
      const possibleDirections = ["UP", "DOWN", "LEFT", "RIGHT"].filter(
        (dir) => dir !== oppositeDirections[currentDirection]
      ) as Direction[];

      // Check if moving in each direction would cause collision
      const safeDirections = possibleDirections.filter((dir) => {
        return !isDanger(snake[0], snake, dir, boardWidth, boardHeight);
      });

      // If no safe directions, just continue in current direction
      if (safeDirections.length === 0) {
        return currentDirection;
      }

      // Prefer horizontal movement if dx is larger, vertical if dy is larger
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && safeDirections.includes("RIGHT")) {
          return "RIGHT";
        } else if (dx < 0 && safeDirections.includes("LEFT")) {
          return "LEFT";
        }
      } else {
        if (dy > 0 && safeDirections.includes("DOWN")) {
          return "DOWN";
        } else if (dy < 0 && safeDirections.includes("UP")) {
          return "UP";
        }
      }

      // If preferred direction is not safe, choose any safe direction
      return safeDirections[0];
    }

    try {
      // Use synchronous prediction with tf.tidy for memory management
      const outputs = tf.tidy(() => {
        const inputTensor = tf.tensor2d([state]);
        const outputTensor = neuralNetwork.model.predict(
          inputTensor
        ) as tf.Tensor;
        // Get the data synchronously - this is less efficient but ensures we have a direction
        return Array.from(outputTensor.dataSync());
      });

      // Get direction from outputs
      const newDirection = getDirectionFromOutput(
        outputs,
        snake,
        currentDirection,
        boardWidth,
        boardHeight
      );

      // Cache the prediction
      predictionCache.current.set(cacheKey, newDirection);

      // Limit cache size to prevent memory issues
      if (predictionCache.current.size > 1000) {
        // Remove oldest entries
        const keys = Array.from(predictionCache.current.keys());
        for (let i = 0; i < 200; i++) {
          predictionCache.current.delete(keys[i]);
        }
      }

      return newDirection;
    } catch (error) {
      console.error("Error in synchronous prediction:", error);

      // Fallback to a simple heuristic
      const head = snake[0];
      if (food.x > head.x && currentDirection !== "LEFT") return "RIGHT";
      if (food.x < head.x && currentDirection !== "RIGHT") return "LEFT";
      if (food.y > head.y && currentDirection !== "UP") return "DOWN";
      if (food.y < head.y && currentDirection !== "DOWN") return "UP";

      return currentDirection;
    }
  };

  // Update neural network weights using Q-learning with TensorFlow.js
  const updateNeuralNetwork = (reward: number) => {
    if (
      !neuralNetwork ||
      !neuralNetwork.isInitialized ||
      lastState.current.length === 0
    )
      return;

    // Store experience for batch learning
    const experience = {
      state: lastState.current,
      action: lastAction.current,
      reward: reward,
      nextState: lastState.current, // Will be updated on next move
      done: reward < -1, // Consider strongly negative rewards as terminal states
    };

    // Update the nextState of the previous experience if available
    if (trainingData.current.length > 0) {
      const prevExperience =
        trainingData.current[trainingData.current.length - 1];
      if (!prevExperience.done) {
        prevExperience.nextState = lastState.current;
      }
    }

    trainingData.current.push(experience);

    // Log significant rewards for debugging
    if (Math.abs(reward) > 1) {
      console.log(
        `Significant reward: ${reward.toFixed(2)}, action: ${
          lastAction.current
        }`
      );
    }

    // Limit the training data size
    if (trainingData.current.length > 10000) {
      trainingData.current.shift();
    }

    // Only train if we have enough experiences and not already training
    if (trainingData.current.length < 64 || batchTrainingInProgress.current)
      return;

    // Schedule batch training
    setTimeout(() => trainOnBatch(), 0);
  };

  // Train the network on a batch of experiences
  const trainOnBatch = async () => {
    if (
      batchTrainingInProgress.current ||
      !neuralNetwork ||
      !neuralNetwork.isInitialized
    )
      return;

    batchTrainingInProgress.current = true;

    try {
      // Q-learning parameters
      const discountFactor = 0.95;

      // Randomly sample a batch of experiences
      const batchSize = Math.min(64, trainingData.current.length);
      const batch: {
        state: number[];
        action: number;
        reward: number;
        nextState: number[];
        done: boolean;
      }[] = [];

      // Prioritize recent experiences (50% from recent, 50% random)
      const recentExperienceCount = Math.min(
        32,
        Math.floor(trainingData.current.length / 2)
      );

      // Add recent experiences
      for (let i = 0; i < recentExperienceCount; i++) {
        const index = trainingData.current.length - 1 - i;
        if (index >= 0) {
          batch.push(trainingData.current[index]);
        }
      }

      // Fill the rest with random experiences
      while (batch.length < batchSize) {
        const randomIndex = Math.floor(
          Math.random() * trainingData.current.length
        );
        batch.push(trainingData.current[randomIndex]);
      }

      // Prepare tensors for batch training
      const states = batch.map((exp) => exp.state);
      const nextStates = batch.map((exp) => exp.nextState);

      // Get current Q-values for all states
      const statesTensor = tf.tensor2d(states);
      const currentQTensor = neuralNetwork.model.predict(
        statesTensor
      ) as tf.Tensor;
      const currentQ = (await currentQTensor.array()) as number[][];

      // Get next Q-values for all next states
      const nextStatesTensor = tf.tensor2d(nextStates);
      const nextQTensor = neuralNetwork.model.predict(
        nextStatesTensor
      ) as tf.Tensor;
      const nextQ = (await nextQTensor.array()) as number[][];

      // Create target Q-values by applying Bellman equation
      const targetQ = currentQ.map((q, i) => {
        const { action, reward, done } = batch[i];
        const newQ = [...q];

        if (done) {
          newQ[action] = reward;
        } else {
          const maxNextQ = Math.max(...nextQ[i]);
          newQ[action] = reward + discountFactor * maxNextQ;
        }

        return newQ;
      });

      // Train the model on the batch
      const targetQTensor = tf.tensor2d(targetQ);

      await neuralNetwork.model.trainOnBatch(statesTensor, targetQTensor);

      // Clean up tensors
      statesTensor.dispose();
      nextStatesTensor.dispose();
      currentQTensor.dispose();
      nextQTensor.dispose();
      targetQTensor.dispose();

      // Log training progress occasionally
      if (generation % 10 === 0) {
        console.log(
          `Trained on batch, generation: ${generation}, best score: ${bestScore}`
        );
      }
    } catch (error) {
      console.error("Error during batch training:", error);
    } finally {
      batchTrainingInProgress.current = false;
    }
  };

  // Toggle learning state
  const toggleLearning = () => {
    setIsLearning((prev) => !prev);
  };

  // Toggle info panel visibility
  const toggleInfo = () => {
    setShowNeuralInfo((prev) => !prev);
  };

  // Increment generation counter
  const incrementGeneration = () => {
    setGeneration((prev) => prev + 1);
  };

  // Update best score if current score is higher
  const updateBestScore = (score: number) => {
    if (score > bestScore) {
      setBestScore(score);
    }
  };

  return {
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
  };
};
