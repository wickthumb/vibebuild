import { useState, useEffect, useRef } from "react";
import theme from "./style/theme";
import Tetris from "./Tetris";
import Snake from "./Snake";
import MemoryGame from "./MemoryGame";

interface TerminalProps {
  activeColor: string;
}

// Define the file system structure
const fileSystem = {
  root: {
    bin: {
      tetris: "executable",
      snake: "executable",
      memory: "executable",
      help: "executable",
    },
    home: {
      user: {
        documents: {
          "readme.txt": "This is a sample text file.",
          "notes.txt": "Remember to update your resume.",
        },
        pictures: {
          "synthwave.jpg": "A neon cityscape image.",
        },
      },
    },
    usr: {
      games: {
        "tetris.exe": "executable",
        "snake.exe": "executable",
        "memory.exe": "executable",
      },
      local: {
        share: {},
      },
    },
  },
};

const Terminal = ({ activeColor }: TerminalProps) => {
  const [terminalText, setTerminalText] = useState<string>("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [bootSequence, setBootSequence] = useState(true);
  const [currentInput, setCurrentInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState("/root");
  const [showTetris, setShowTetris] = useState(false);
  const [showSnake, setShowSnake] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when terminal content changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalText, currentInput]);

  // Get the current directory object based on the path
  const getCurrentDirectory = () => {
    const pathParts = currentPath.split("/").filter((part) => part);
    let currentDir: any = fileSystem;

    for (const part of pathParts) {
      if (currentDir[part]) {
        currentDir = currentDir[part];
      } else {
        return null;
      }
    }

    return currentDir;
  };

  // Get the prompt string
  const getPrompt = () => {
    return `${currentPath} >`;
  };

  // Simulate typing effect for terminal
  useEffect(() => {
    if (bootSequence) {
      const messages = [
        "INITIALIZING SYSTEM...",
        "LOADING CORE MODULES...",
        "ESTABLISHING CONNECTION...",
        "SYNCING DATA STREAMS...",
        "CALIBRATING VISUAL INTERFACE...",
        "SYSTEM READY.",
      ];

      let currentMessageIndex = 0;
      let currentCharIndex = 0;
      let timeout: ReturnType<typeof setTimeout>;

      const typeNextChar = () => {
        if (currentMessageIndex < messages.length) {
          const currentMessage = messages[currentMessageIndex];

          if (currentCharIndex < currentMessage.length) {
            setTerminalText((prev) => prev + currentMessage[currentCharIndex]);
            currentCharIndex++;
            timeout = setTimeout(typeNextChar, 50);
          } else {
            setTerminalText((prev) => prev + "\n");
            currentMessageIndex++;
            currentCharIndex = 0;
            timeout = setTimeout(typeNextChar, 500);
          }
        } else {
          setBootSequence(false);
        }
      };

      timeout = setTimeout(typeNextChar, 500);

      return () => clearTimeout(timeout);
    }
  }, [bootSequence]);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Handle key presses for the terminal
  useEffect(() => {
    if (bootSequence || showTetris || showSnake || showMemory) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        processCommand();
      } else if (e.key === "Backspace") {
        setCurrentInput((prev) => prev.slice(0, -1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault(); // Prevent scrolling
        navigateHistory(-1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault(); // Prevent scrolling
        navigateHistory(1);
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setCurrentInput((prev) => prev + e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    bootSequence,
    currentInput,
    commandHistory,
    historyIndex,
    currentPath,
    showTetris,
    showSnake,
    showMemory,
  ]);

  // Navigate through command history
  const navigateHistory = (direction: number) => {
    if (commandHistory.length === 0) return;

    const newIndex = historyIndex + direction;
    if (newIndex >= -1 && newIndex < commandHistory.length) {
      setHistoryIndex(newIndex);
      if (newIndex === -1) {
        setCurrentInput("");
      } else {
        setCurrentInput(commandHistory[newIndex]);
      }
    }
  };

  // Process the entered command
  const processCommand = () => {
    const command = currentInput.trim();

    if (command) {
      // Add to command history
      setCommandHistory((prev) => [command, ...prev]);
      setHistoryIndex(-1);

      // Add command to terminal output
      setTerminalText((prev) => prev + getPrompt() + " " + command + "\n");

      // Process the command
      executeCommand(command);

      // Clear current input
      setCurrentInput("");
    } else {
      // Just add a new prompt if empty command
      setTerminalText((prev) => prev + getPrompt() + "\n");
    }
  };

  // Execute the command
  const executeCommand = (command: string) => {
    const parts = command.split(" ");
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case "help":
        showHelp();
        break;
      case "ls":
        listDirectory();
        break;
      case "cd":
        changeDirectory(args[0]);
        break;
      case "pwd":
        printWorkingDirectory();
        break;
      case "cat":
        catFile(args[0]);
        break;
      case "clear":
        clearTerminal();
        break;
      case "tetris":
        launchTetris();
        break;
      case "snake":
        launchSnake();
        break;
      case "memory":
        launchMemory();
        break;
      case "games":
        listGames();
        break;
      case "run":
        runExecutable(args[0]);
        break;
      default:
        setTerminalText(
          (prev) =>
            prev +
            `Command not found: ${cmd}. Type 'help' for available commands.\n`
        );
    }
  };

  // Show help information
  const showHelp = () => {
    setTerminalText(
      (prev) =>
        prev +
        `Available commands:
  help                 - Show this help message
  ls                   - List directory contents
  cd <directory>       - Change directory
  pwd                  - Print working directory
  cat <file>           - Display file contents
  clear                - Clear terminal
  games                - List available games
  tetris               - Launch Tetris game
  snake                - Launch Snake game
  memory               - Launch Memory game
  run <executable>     - Run an executable file
`
    );
  };

  // List available games
  const listGames = () => {
    setTerminalText(
      (prev) =>
        prev +
        `Available games:
  tetris               - Classic block stacking game
  snake                - Control a snake to eat food and grow
  memory               - Match pairs of cards
  
You can launch games by typing their name or using 'run /path/to/game.exe'
`
    );
  };

  // List directory contents
  const listDirectory = () => {
    const currentDir = getCurrentDirectory();

    if (!currentDir) {
      setTerminalText((prev) => prev + `Error: Directory not found.\n`);
      return;
    }

    let output = "";

    // Get directories and files
    for (const item in currentDir) {
      const isDir = typeof currentDir[item] === "object";
      const isExecutable = currentDir[item] === "executable";

      if (isDir) {
        output += `<DIR>  ${item}/\n`;
      } else if (isExecutable) {
        output += `<EXE>  ${item}\n`;
      } else {
        output += `<FILE> ${item}\n`;
      }
    }

    if (output === "") {
      output = "Directory is empty.\n";
    }

    setTerminalText((prev) => prev + output);
  };

  // Change directory
  const changeDirectory = (dir: string) => {
    if (!dir) {
      setTerminalText((prev) => prev + `Error: No directory specified.\n`);
      return;
    }

    let newPath = currentPath;
    let success = false;

    if (dir === "..") {
      // Go up one level
      const pathParts = currentPath.split("/").filter((part) => part);
      if (pathParts.length > 1) {
        pathParts.pop();
        newPath = "/" + pathParts.join("/");
        success = true;
      } else {
        setTerminalText((prev) => prev + `Already at root directory.\n`);
        return;
      }
    } else if (dir === "/") {
      // Go to root
      newPath = "/root";
      success = true;
    } else if (dir.startsWith("/")) {
      // Handle absolute paths
      const pathParts = dir.split("/").filter((part) => part);
      let currentDir: any = fileSystem;
      let validPath = true;

      for (const part of pathParts) {
        if (currentDir[part] && typeof currentDir[part] === "object") {
          currentDir = currentDir[part];
        } else {
          validPath = false;
          break;
        }
      }

      if (validPath) {
        newPath = "/" + pathParts.join("/");
        success = true;
      } else {
        setTerminalText(
          (prev) => prev + `Error: Directory not found: ${dir}\n`
        );
        return;
      }
    } else {
      // Handle relative paths
      const currentDir = getCurrentDirectory();
      if (
        currentDir &&
        currentDir[dir] &&
        typeof currentDir[dir] === "object"
      ) {
        newPath = `${currentPath}/${dir}`.replace(/\/+/g, "/");
        success = true;
      } else {
        setTerminalText(
          (prev) => prev + `Error: Directory not found: ${dir}\n`
        );
        return;
      }
    }

    if (success) {
      setCurrentPath(newPath);
      setTerminalText((prev) => prev + `Changed directory to ${newPath}\n`);
    }
  };

  // Print working directory
  const printWorkingDirectory = () => {
    setTerminalText((prev) => prev + `${currentPath}\n`);
  };

  // Display file contents
  const catFile = (file: string) => {
    if (!file) {
      setTerminalText((prev) => prev + `Error: No file specified.\n`);
      return;
    }

    const currentDir = getCurrentDirectory();

    if (
      currentDir &&
      currentDir[file] &&
      typeof currentDir[file] === "string" &&
      currentDir[file] !== "executable"
    ) {
      setTerminalText((prev) => prev + `${currentDir[file]}\n`);
    } else {
      setTerminalText((prev) => prev + `Error: Cannot read file: ${file}\n`);
    }
  };

  // Clear terminal
  const clearTerminal = () => {
    setTerminalText("");
  };

  // Launch Tetris game
  const launchTetris = () => {
    setTerminalText((prev) => prev + `Launching Tetris...\n`);
    setShowTetris(true);
  };

  // Launch Snake game
  const launchSnake = () => {
    setTerminalText((prev) => prev + `Launching Snake...\n`);
    setShowSnake(true);
  };

  // Launch Memory game
  const launchMemory = () => {
    setTerminalText((prev) => prev + `Launching Memory Game...\n`);
    setShowMemory(true);
  };

  // Run executable
  const runExecutable = (executable: string) => {
    if (!executable) {
      setTerminalText((prev) => prev + `Error: No executable specified.\n`);
      return;
    }

    const currentDir = getCurrentDirectory();

    if (currentDir && currentDir[executable] === "executable") {
      if (executable === "tetris" || executable === "tetris.exe") {
        launchTetris();
      } else if (executable === "snake" || executable === "snake.exe") {
        launchSnake();
      } else if (executable === "memory" || executable === "memory.exe") {
        launchMemory();
      } else if (executable === "help") {
        showHelp();
      } else {
        setTerminalText((prev) => prev + `Executed: ${executable}\n`);
      }
    } else {
      setTerminalText(
        (prev) => prev + `Error: Cannot execute: ${executable}\n`
      );
    }
  };

  // Close Tetris
  const closeTetris = () => {
    setShowTetris(false);
    setTerminalText((prev) => prev + `Tetris closed.\n`);
  };

  // Close Snake
  const closeSnake = () => {
    setShowSnake(false);
    setTerminalText((prev) => prev + `Snake closed.\n`);
  };

  // Close Memory
  const closeMemory = () => {
    setShowMemory(false);
    setTerminalText((prev) => prev + `Memory Game closed.\n`);
  };

  return (
    <>
      <div
        style={{
          backgroundColor: theme.colors.backgroundDark,
          border: `${theme.borders.width.medium} ${theme.borders.style.solid} ${theme.colors.accent3}`,
          borderRadius: theme.borders.radius.md,
          padding: theme.spacing.lg,
          boxShadow: theme.shadows.neon.purple,
          fontFamily: theme.fonts.family.main,
          fontSize: theme.fonts.size.lg,
          position: "relative",
          height: "100%",
          minHeight: "250px",
        }}
      >
        <div
          style={{
            backgroundColor: theme.colors.accent3,
            padding: theme.spacing.xs,
            marginBottom: theme.spacing.md,
            borderTopLeftRadius: theme.borders.radius.sm,
            borderTopRightRadius: theme.borders.radius.sm,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          <p
            style={{
              margin: 0,
              color: theme.textColors.inverse,
              fontSize: theme.fonts.size.sm,
              textAlign: "center",
            }}
          >
            TERMINAL
          </p>
        </div>

        <div
          ref={terminalRef}
          className="terminal-text"
          style={{
            marginTop: theme.spacing.xl,
            color: theme.colors.accent6,
            whiteSpace: "pre-wrap",
            lineHeight: 1.5,
            height: "calc(100% - 40px)",
            overflowY: "auto",
            fontFamily: "monospace",
          }}
        >
          <div>{terminalText}</div>
          {!bootSequence && (
            <div style={{ display: "flex" }}>
              <span>{currentPath} &gt;&nbsp;</span>
              <span>{currentInput}</span>
              <span
                className="terminal-cursor"
                style={{
                  display: "inline-block",
                  width: "10px",
                  height: "20px",
                  backgroundColor: cursorVisible
                    ? theme.colors.accent6
                    : "transparent",
                  marginLeft: "2px",
                }}
              ></span>
            </div>
          )}
        </div>
      </div>

      {/* Render game components when active */}
      {showTetris && <Tetris isActive={showTetris} onClose={closeTetris} />}
      {showSnake && <Snake isActive={showSnake} onClose={closeSnake} />}
      {showMemory && <MemoryGame isActive={showMemory} onClose={closeMemory} />}
    </>
  );
};

export default Terminal;
