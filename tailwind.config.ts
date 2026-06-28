import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blistBg: "#050608",
        blistSurface: "#0B0C10",
        blistSurfaceSoft: "#121318",
        blistAccent: "#FFFFFF",
        blistAccentSoft: "#E2E8F0",
        blistBorder: "#2A2A2A",
        blistTextMain: "#F9FAFB",
        blistTextMuted: "#9CA3AF",
      },
      boxShadow: {
        blistGlow: "0 0 30px rgba(255, 255, 255, 0.12)",
      },
      borderRadius: {
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;

