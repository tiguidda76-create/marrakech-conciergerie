import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#12121A",
        foreground: "#F5EBE1",
        surface: {
          DEFAULT: "#1A1A26",
          elevated: "#232332",
          border: "#2A2A3A",
          muted: "#171722",
        },
        primary: {
          DEFAULT: "#C49A6C",
          hover: "#B3895B",
          dark: "#996F43",
          light: "#DFC09C",
          foreground: "#12121A",
        },
        secondary: {
          DEFAULT: "#8B5E3C",
          foreground: "#FFFFFF",
        },
        accent: {
          majorelle: "#2E5BFF",
          emerald: "#2D9F6F",
          terracotta: "#C85A32",
          amber: "#D97706",
        },
        muted: {
          DEFAULT: "#2A2A3A",
          foreground: "#A0A0B2",
        },
        status: {
          libre: "#2D9F6F",
          reserve: "#2E5BFF",
          menage: "#D97706",
          maintenance: "#EF4444",
        }
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;