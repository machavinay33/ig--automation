import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf2f8",
          100: "#fce7f3",
          400: "#e1306c",
          500: "#c13584",
          600: "#833ab4",
          700: "#5851db",
        },
      },
      backgroundImage: {
        "ig-gradient":
          "linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)",
      },
    },
  },
  plugins: [],
};
export default config;
