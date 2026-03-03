/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#1142d4",
        "bglight": "#f6f6f8",
        "bgdark": "#101522",
        brand: '#1142d4', // From generated screen
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
        custom: '8px', // From generated screen
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease forwards',
        'slide-right': 'slide-in-right 0.3s ease forwards',
        'glow': 'glow-pulse 2s infinite',
        'pulse-slow': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', // From generated screen
      },
    },
  },
  plugins: [],
}
