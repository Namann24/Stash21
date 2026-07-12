/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./lib/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink:            "#0A0908",
        "slate-panel":  "#151311",
        copper:         "#B87333",
        brass:          "#C9A24B",
        "brass-light":  "#E8CE8C",
        champagne:      "#FBE2C2",
        maroon:         "#5A1220",
        bronze:         "#82553E",
        steel:          "#9C9186",
        circuit:        "#4DD8E8",
        "circuit-dim":  "#1F6B75",
        violet:         "#8B6FE8",
        "violet-dim":   "#3D2E6B"
      },
      fontFamily: {
        display: ["Cinzel", "serif"],
        body:    ["Inter", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"]
      },
      backgroundImage: {
        "metal-gradient": "linear-gradient(135deg, #F3DFA8 0%, #E8CE8C 25%, #C9A24B 55%, #8A4B25 100%)"
      },
      animation: {
        shimmer:       "shimmer 6s ease-in-out infinite",
        marquee:       "marquee 28s linear infinite",
        aurora:        "aurora-spin 22s linear infinite",
        "gear-spin":   "gear-spin 20s linear infinite",
        "gear-spin-r": "gear-spin-reverse 16s linear infinite",
        "copper-pulse":"copper-pulse 3s ease-in-out infinite",
      },
      keyframes: {
        "gear-spin": {
          "from": { transform: "rotate(0deg)" },
          "to":   { transform: "rotate(360deg)" }
        },
        "gear-spin-reverse": {
          "from": { transform: "rotate(360deg)" },
          "to":   { transform: "rotate(0deg)" }
        },
        "copper-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%":      { opacity: "0.7" }
        }
      }
    }
  },
  plugins: []
};
