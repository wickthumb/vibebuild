// Theme colors for the application - Synthwave/Retro-Futuristic Style
// You can access these colors throughout your application by importing this file

export const colors = {
  // Primary colors - Neon purple/pink
  primary: "#ff00ff", // Magenta
  primaryDark: "#b300b3",
  primaryLight: "#ff66ff",

  // Secondary colors - Neon blue/cyan
  secondary: "#00ffff", // Cyan
  secondaryDark: "#00b3b3",
  secondaryLight: "#66ffff",

  // Neutral colors
  black: "#000000",
  darkGray: "#1a1a2e", // Dark blue-ish black
  gray: "#4f4f7a", // Muted purple
  lightGray: "#8080b3", // Light purple
  white: "#ffffff",

  // Accent colors - Synthwave palette
  accent1: "#fe75fe", // Neon pink
  accent2: "#08f7fe", // Neon blue
  accent3: "#7b42f6", // Purple
  accent4: "#ff2975", // Hot pink
  accent5: "#f222ff", // Bright purple
  accent6: "#01ffc3", // Teal
  accent7: "#ffb700", // Gold

  // Feedback colors
  success: "#01ffc3", // Teal
  warning: "#ffb700", // Gold
  error: "#ff2975", // Hot pink
  info: "#08f7fe", // Neon blue

  // Background colors
  background: "#1a1a2e", // Dark blue-ish black
  backgroundDark: "#0f0f1a", // Darker blue-black
  backgroundLight: "#2a2a4a", // Lighter blue-black
  backgroundGradient: "linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)",
  backgroundGrid: "radial-gradient(#4f4f7a 1px, transparent 1px)",
};

// Typography colors
export const textColors = {
  primary: "#ffffff", // White
  secondary: "#8080b3", // Light purple
  light: "#b3b3cc", // Very light purple
  inverse: "#0f0f1a", // Dark background
  neon: {
    pink: "#fe75fe",
    blue: "#08f7fe",
    purple: "#7b42f6",
    teal: "#01ffc3",
  },
};

// You can also define other theme properties like spacing, shadows, etc.
export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  xxl: "48px",
};

export const shadows = {
  small: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
  medium: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
  large: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)",
  neon: {
    pink: "0 0 5px #fe75fe, 0 0 10px #fe75fe, 0 0 15px #fe75fe",
    blue: "0 0 5px #08f7fe, 0 0 10px #08f7fe, 0 0 15px #08f7fe",
    purple: "0 0 5px #7b42f6, 0 0 10px #7b42f6, 0 0 15px #7b42f6",
    teal: "0 0 5px #01ffc3, 0 0 10px #01ffc3, 0 0 15px #01ffc3",
  },
};

// Borders
export const borders = {
  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    round: "50%",
  },
  width: {
    thin: "1px",
    medium: "2px",
    thick: "4px",
  },
  style: {
    solid: "solid",
    dashed: "dashed",
    dotted: "dotted",
    double: "double",
  },
};

// Fonts
export const fonts = {
  family: {
    main: "'VT323', 'Courier New', monospace", // Retro computer font
    heading: "'Press Start 2P', 'VT323', monospace", // Pixel font
    body: "'VT323', 'Courier New', monospace",
  },
  size: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.25rem",
    xl: "1.5rem",
    xxl: "2rem",
    xxxl: "3rem",
  },
  weight: {
    light: 300,
    normal: 400,
    medium: 500,
    bold: 700,
  },
};

// Animations
export const animations = {
  glow: "@keyframes glow { 0% { text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0073e6, 0 0 20px #0073e6; } 50% { text-shadow: 0 0 5px #fff, 0 0 15px #0073e6, 0 0 25px #0073e6, 0 0 30px #0073e6; } 100% { text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0073e6, 0 0 20px #0073e6; } }",
  scanline:
    "@keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }",
  blink:
    "@keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }",
};

// Export all theme elements
const theme = {
  colors,
  textColors,
  spacing,
  shadows,
  borders,
  fonts,
  animations,
};

export default theme;
