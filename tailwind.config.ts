import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E6D3B1",
        dark: "#2B2B2B",
        light: "#FAF7F2",
        border: "#E5E0D8",
        accent: "#C4A26A",
      },
    },
  },
  plugins: [],
} satisfies Config;
