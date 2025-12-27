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
        vampBg: "#050608",
        vampSurface: "#0B0C10",
        vampSurfaceSoft: "#121318",
        vampAccent: "#E63946",
        vampAccentSoft: "#F97373",
        vampBorder: "#1F2933",
        vampTextMain: "#F9FAFB",
        vampTextMuted: "#9CA3AF",
      },
      boxShadow: {
        vampGlow: "0 0 30px rgba(230, 57, 70, 0.35)",
      },
      borderRadius: {
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;

