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
          light: "#0a2d6c",
        },
        primary: {
          DEFAULT: "#012C7D",
          hover: "#012260",
          light: "#E5F0FE",
        },
        royal: {
          DEFAULT: "#0B5ED7",
          hover: "#094bb0",
          active: "#084298",
        },
        bright: {
          DEFAULT: "#1677E8",
        },
        soft: {
          DEFAULT: "#E5F0FE",
          hover: "#d2e4fd",
        },
        app: {
          bg: "#F6F9FD",
          surface: "#FFFFFF",
          border: "#DDE6F2",
          muted: "#52658A",
          subtle: "#F0F4FA",
        },
        success: {
          DEFAULT: "#16A765",
          hover: "#138a53",
          light: "#D7F5E3",
          dark: "#0d633c",
        },
        danger: {
          DEFAULT: "#DC3545",
          hover: "#c82333",
          light: "#FDE8E8",
          dark: "#842029",
        },
        warning: {
          DEFAULT: "#D97706",
          hover: "#b45309",
          light: "#FEF3C7",
          dark: "#78350f",
        },
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "14px",
        card: "16px",
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(2, 28, 72, 0.05), 0 1px 2px -1px rgba(2, 28, 72, 0.03)",
        card: "0 2px 8px -2px rgba(2, 28, 72, 0.06), 0 2px 4px -2px rgba(2, 28, 72, 0.04)",
        dialog: "0 20px 25px -5px rgba(2, 28, 72, 0.1), 0 8px 10px -6px rgba(2, 28, 72, 0.06)",
        dropdown: "0 10px 15px -3px rgba(2, 28, 72, 0.08), 0 4px 6px -4px rgba(2, 28, 72, 0.04)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
