import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F5F0EB",
        foreground: "#1A1A1A",
        accent: {
          DEFAULT: "#C4723A",
          hover: "#A85E2A",
          light: "#F5E6D8",
        },
        card: "#FDFAF7",
        border: "#E5DDD5",
        muted: "#7A6E66",
        ring: "#C4723A",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "DM Sans", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.45s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
