/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#020305",
        surface: {
          DEFAULT: "#060B1A",
          raised: "#0A1226",
          border: "rgba(34, 211, 238, 0.22)",
          borderGlow: "rgba(34, 211, 238, 0.45)",
        },
        cyan: {
          DEFAULT: "#22D3EE",
          bright: "#67E8F9",
          dim: "#0891B2",
          deep: "rgba(8, 145, 178, 0.2)",
          glow: "rgba(34, 211, 238, 0.35)",
        },
        text: {
          main: "#FFFFFF",
          secondary: "#E0F2FE",
          muted: "#7EA3B8",
        },
      },
      fontFamily: {
        sans: ["Segoe UI", "-apple-system", "BlinkMacSystemFont", "Roboto", "sans-serif"],
        mono: ["Consolas", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
}
