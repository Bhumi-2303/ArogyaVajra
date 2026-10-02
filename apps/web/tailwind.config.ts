import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#021C48",
          dark: "#011230",
        },
        primary: {
          DEFAULT: "#012C7D",
          hover: "#012260",
          light: "#E5F0FE",
        },
        royal: {
          DEFAULT: "#0B5ED7",
          hover: "#094bb0",
        },
        bright: {
          DEFAULT: "#1677E8",
        },
        soft: {
          DEFAULT: "#E5F0FE",
        },
        app: {
          bg: "#F6F9FD",
          surface: "#FFFFFF",
          border: "#DDE6F2",
          muted: "#52658A",
        },
        success: {
          DEFAULT: "#16A765",
          light: "#D7F5E3",
        },
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        card: "16px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "Fira Sans",
          "Droid Sans",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
