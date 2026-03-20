/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
      },
      colors: {
        primary: {
          50: 'oklch(0.97 0.01 270)',
          100: 'oklch(0.94 0.02 270)',
          200: 'oklch(0.88 0.04 270)',
          300: 'oklch(0.78 0.08 270)',
          400: 'oklch(0.65 0.14 270)',
          500: 'oklch(0.52 0.20 270)',
          600: 'oklch(0.44 0.18 270)',
          700: 'oklch(0.36 0.15 270)',
          800: 'oklch(0.28 0.12 270)',
          900: 'oklch(0.22 0.08 270)',
          950: 'oklch(0.15 0.06 270)',
        },
        accent: {
          400: 'oklch(0.82 0.16 75)',
          500: 'oklch(0.75 0.18 75)',
          600: 'oklch(0.68 0.16 75)',
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'fade-in-up': {
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
