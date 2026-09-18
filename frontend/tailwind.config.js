/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B1120',
          900: '#111827', // Primary Background
          850: '#172033', // Secondary Background
          800: '#1F2937', // Card Surface
          750: '#243044', // Elevated Surface
          700: '#334155',
        },
        brand: {
          orange: '#F97316',  // Primary Accent
          bright: '#FB923C',  // Bright Accent
          soft: '#FDBA74',    // Soft Accent
          glow: 'rgba(249, 115, 22, 0.25)',
        },
        surface: {
          card: '#1F2937',
          elevated: '#243044',
          subtle: '#172033',
        },
        textPrimary: '#F8FAFC',
        textSecondary: '#CBD5E1',
        textMuted: '#94A3B8',
        statusSuccess: '#22C55E',
        statusWarning: '#F59E0B',
        statusError: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.35)',
        'elevated': '0 10px 30px -4px rgba(0, 0, 0, 0.45)',
        'orange-glow': '0 0 25px -4px rgba(249, 115, 22, 0.3)',
        'orange-sm': '0 0 12px -2px rgba(249, 115, 22, 0.25)',
      },
      borderColor: {
        subtle: 'rgba(255, 255, 255, 0.08)',
        glow: 'rgba(249, 115, 22, 0.35)',
      }
    },
  },
  plugins: [],
}
