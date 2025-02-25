import { useState, useEffect } from "react";
import theme from "../components/style/theme";
import Terminal from "../components/Terminal";
import Resume from "../components/Resume";

const Home = () => {
  const [activeColor, setActiveColor] = useState("primary");

  // Add the necessary fonts to our index.html
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Function to display the selected color
  const handleColorClick = (colorName: string) => {
    setActiveColor(colorName);
  };

  // Synthwave grid background style
  const gridBackgroundStyle = {
    backgroundImage: theme.colors.backgroundGrid,
    backgroundSize: "30px 30px",
    backgroundPosition: "center",
  };

  return (
    <div
      style={{
        padding: theme.spacing.md,
        backgroundColor: theme.colors.backgroundDark,
        background: theme.colors.backgroundGradient,
        minHeight: "100vh",
        width: "100%",
        color: theme.textColors.primary,
        fontFamily: theme.fonts.family.main,
        position: "relative",
        overflow: "hidden",
        ...gridBackgroundStyle,
      }}
    >
      {/* Scanline effect */}
      <style>
        {`
          @keyframes scanline {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
          
          @keyframes glow {
            0% { text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px ${theme.colors.primary}, 0 0 20px ${theme.colors.primary}; }
            50% { text-shadow: 0 0 5px #fff, 0 0 15px ${theme.colors.primary}, 0 0 25px ${theme.colors.primary}, 0 0 30px ${theme.colors.primary}; }
            100% { text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px ${theme.colors.primary}, 0 0 20px ${theme.colors.primary}; }
          }
          
          @keyframes blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
          }

          @keyframes pixelReveal {
            0% { 
              clip-path: inset(0 100% 0 0);
              filter: brightness(2) hue-rotate(45deg);
            }
            30% { 
              clip-path: inset(0 70% 0 0);
              filter: brightness(1.7) hue-rotate(30deg);
            }
            60% { 
              clip-path: inset(0 30% 0 0);
              filter: brightness(1.5) hue-rotate(15deg);
            }
            100% { 
              clip-path: inset(0 0 0 0);
              filter: brightness(1) hue-rotate(0deg);
            }
          }

          @keyframes arcadeStartup {
            0% { transform: scale(0.8); opacity: 0; filter: blur(10px); }
            30% { transform: scale(1.1); opacity: 0.7; filter: blur(5px); }
            40% { transform: scale(0.95); opacity: 0.8; filter: blur(3px); }
            50% { transform: scale(1.05); opacity: 0.9; filter: blur(1px); }
            60% { transform: scale(0.98); opacity: 1; filter: blur(0); }
            70% { transform: scale(1.02); }
            80% { transform: scale(0.99); }
            100% { transform: scale(1); }
          }

          .arcade-header {
            position: relative;
            animation: arcadeStartup 2s ease-out forwards, flicker 8s infinite 2s;
            transform-origin: center;
          }

          .arcade-title {
            position: relative;
            display: inline-block;
            animation: pixelReveal 1.5s steps(10) forwards;
          }

          .arcade-title::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, 
              transparent 0%, 
              rgba(255, 255, 255, 0.8) 50%, 
              transparent 100%);
            transform: translateX(-100%);
            animation: shine 3s infinite 2s;
          }

          @keyframes shine {
            0% { transform: translateX(-100%); }
            20% { transform: translateX(100%); }
            100% { transform: translateX(100%); }
          }

          .pixel-noise {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
            opacity: 0.05;
            pointer-events: none;
            z-index: 1;
          }
        `}
      </style>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "100%",
            background:
              "linear-gradient(transparent 50%, rgba(32, 32, 64, 0.25) 50%)",
            backgroundSize: "100% 4px",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "100%",
            background: "rgba(78, 124, 255, 0.03)",
            zIndex: 3,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "100%",
            animation: "scanline 8s linear infinite",
            background:
              "linear-gradient(to bottom, transparent, rgba(78, 124, 255, 0.15), transparent)",
            zIndex: 4,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Header */}
      <header
        className="arcade-header"
        style={{
          textAlign: "center",
          marginBottom: theme.spacing.lg,
          padding: theme.spacing.md,
          borderBottom: `${theme.borders.width.medium} ${theme.borders.style.solid} ${theme.colors.primary}`,
          boxShadow: theme.shadows.neon.pink,
          position: "relative",
          zIndex: 5,
          overflow: "hidden",
          background: `linear-gradient(180deg, 
            rgba(0,0,0,0.7) 0%, 
            rgba(50,10,90,0.5) 50%, 
            rgba(0,0,0,0.7) 100%)`,
          borderRadius: "8px",
        }}
      >
        <div className="pixel-noise"></div>
        <h1
          className="header-title arcade-title"
          style={{
            color: theme.textColors.primary,
            fontFamily: theme.fonts.family.heading,
            fontSize: theme.fonts.size.xxl,
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "2px",
            textShadow: theme.shadows.neon.pink,
            position: "relative",
            zIndex: 2,
            padding: "10px 0",
          }}
        >
          VIBE BUILDING OS v1.0
        </h1>
      </header>

      {/* Main content */}
      <div
        className="grid-container"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: theme.spacing.lg,
          position: "relative",
          zIndex: 5,
          width: "100%",
          height: "calc(100vh - 200px)",
        }}
      >
        {/* Terminal section */}
        <Terminal activeColor={activeColor} />

        {/* Resume section */}
        <Resume />
      </div>

      {/* Footer with color selection */}
      <footer
        style={{
          marginTop: theme.spacing.lg,
          padding: theme.spacing.md,
          borderTop: `${theme.borders.width.thin} ${theme.borders.style.solid} ${theme.colors.gray}`,
          textAlign: "center",
          color: theme.textColors.secondary,
          fontFamily: theme.fonts.family.main,
          fontSize: theme.fonts.size.sm,
          position: "relative",
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <p>
          VIBE BUILDING OS v1.0 © {new Date().getFullYear()} // ALL RIGHTS
          RESERVED
        </p>
        <p
          style={{ marginTop: theme.spacing.xs, fontSize: theme.fonts.size.xs }}
        >
          Type 'help' in the terminal for available commands
        </p>
      </footer>
    </div>
  );
};

export default Home;
