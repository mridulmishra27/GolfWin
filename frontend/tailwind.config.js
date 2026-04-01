/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        deep: {
          900: '#050816',
          800: '#0a0e27',
          700: '#111340',
          600: '#1a1145',
        },
        electric: {
          DEFAULT: '#00d4ff',
          50: '#e6fbff',
          100: '#b3f3ff',
          200: '#80ebff',
          300: '#4de3ff',
          400: '#1adbff',
          500: '#00d4ff',
          600: '#00a3c7',
          700: '#00728f',
          800: '#004157',
          900: '#00101f',
        },
        amber: {
          DEFAULT: '#ffb347',
          50: '#fff8ed',
          100: '#ffead1',
          200: '#ffd9a8',
          300: '#ffb347',
          400: '#ff9a1a',
          500: '#ff8800',
          600: '#cc6d00',
          700: '#995200',
          800: '#663700',
          900: '#331b00',
        },
        orchid: {
          DEFAULT: '#c084fc',
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        surface: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          hover: 'rgba(255,255,255,0.08)',
          border: 'rgba(255,255,255,0.1)',
          glass: 'rgba(10,14,39,0.7)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh': 'radial-gradient(at 40% 20%, #1a1145 0px, transparent 50%), radial-gradient(at 80% 0%, #0a0e27 0px, transparent 50%), radial-gradient(at 0% 50%, #111340 0px, transparent 50%), radial-gradient(at 80% 50%, #1a1145 0px, transparent 50%), radial-gradient(at 0% 100%, #050816 0px, transparent 50%)',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0,212,255,0.3), 0 0 60px rgba(0,212,255,0.1)',
        'glow-amber': '0 0 20px rgba(255,179,71,0.3), 0 0 60px rgba(255,179,71,0.1)',
        'glow-orchid': '0 0 20px rgba(192,132,252,0.3), 0 0 60px rgba(192,132,252,0.1)',
        'card': '0 8px 32px rgba(0,0,0,0.3)',
        'card-hover': '0 16px 48px rgba(0,0,0,0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin 20s linear infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(3deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}