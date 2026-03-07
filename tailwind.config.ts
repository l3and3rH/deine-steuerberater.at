import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f2f7f4",
          100: "#e0ebe4",
          200: "#c3d8cb",
          300: "#98bca6",
          400: "#6a9a7d",
          500: "#487d60",
          600: "#36644c",
          700: "#2c503e",
          800: "#1e3a2c",
          900: "#0f2b1d",
          950: "#081a10",
        },
        cream: {
          50: "#fffefb",
          100: "#faf7f2",
          200: "#f5efe5",
          300: "#ebe1d1",
          400: "#d9cbb3",
        },
        gold: {
          300: "#e0c77a",
          400: "#d4b44e",
          500: "#c4973b",
          600: "#a67a2e",
          700: "#8a6325",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out both",
        "fade-in": "fadeIn 0.5s ease-out both",
        "slide-in": "slideIn 0.4s ease-out both",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
