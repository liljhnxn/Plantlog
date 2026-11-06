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
        nature: {
          50: "#f3f8f4",
          100: "#e4efe7",
          200: "#c7dfcf",
          300: "#9fc6ab",
          400: "#71a882",
          500: "#4f8d62",
          600: "#3d724d",
          700: "#325c3f",
          800: "#2a4934",
          900: "#233d2c",
          950: "#122118",
        },
        earth: {
          50: "#fbf8f5",
          100: "#f6efe8",
          200: "#ecdecb",
          300: "#ddc3a6",
          400: "#c79f7a",
          500: "#ad7d57",
          600: "#946344",
          700: "#784c36",
          800: "#633f2f",
          900: "#523629",
          950: "#2d1b14",
        },
        cream: {
          50: "#fdfcf9",
          100: "#faf7f0",
          200: "#f4ede0",
          300: "#ece1cd",
          400: "#ded0b5",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

