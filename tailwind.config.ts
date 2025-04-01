import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#FF385C", // Airbnb primary red
          hover: "#DE1661",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#222222", // Airbnb dark text
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#717171", // Airbnb muted text
          foreground: "#F7F7F7",
        },
        accent: {
          DEFAULT: "#00A6DE", // Airbnb blue accent
          foreground: "#FFFFFF",
        },
        border: "#DDDDDD", // Airbnb border color
        input: "#DDDDDD",
        ring: "#FF385C",
        card: "var(--card)", // Added custom card color
      },
      borderRadius: {
        lg: "1rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      fontFamily: {
        sans: ["Circular", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 6px 20px rgba(0, 0, 0, 0.1)",
        nav: "0 2px 10px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
