import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cosmic: "#1a1333",
        accent: "#c084fc",
      },
    },
  },
  plugins: [],
};

export default config;
