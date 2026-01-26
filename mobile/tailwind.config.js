/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Professional Palette
        primary: {
          DEFAULT: '#4F46E5', // indigo-600
          dark: '#4338CA',    // indigo-700
          light: '#818CF8',   // indigo-400
        },
        secondary: {
          DEFAULT: '#0EA5E9', // sky-500
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',  // Body text
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',  // Headings
        },
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F8FAFC',
          app: '#F1F5F9', // Professional App Background (Slate 100)
        }
      },
      fontFamily: {
        'sans': ['System'],
        'heading': ['System'],
      },
      letterSpacing: {
        tight: '-0.025em',
        tighter: '-0.05em',
      }
    },
  },
  plugins: [],
}
