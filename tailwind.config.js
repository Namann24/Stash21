/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0908",
        "slate-panel": "#151311",
        copper: "#B87333",
        brass: "#C9A24B",
        "brass-light": "#E8CE8C",
        champagne: "#FBE2C2",
        maroon: "#5A1220",
        bronze: "#82553E",
        steel: "#9C9186",
        circuit: "#4DD8E8",
        "circuit-dim": "#1F6B75",
        violet: "#8B6FE8",
        "violet-dim": "#3D2E6B"
      },
      fontFamily: {
        display: ["Cinzel", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      backgroundImage: {
        "metal-gradient": "linear-gradient(135deg, #F3DFA8 0%, #E8CE8C 25%, #C9A24B 55%, #8A4B25 100%)"
      }
    }
  },
  plugins: []
};
