/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: '#1142d4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease forwards',
        'slide-right': 'slide-in-right 0.3s ease forwards',
        'glow': 'glow-pulse 2s infinite',
      },
    },
  },
  plugins: [],
}
