/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2563eb',
          darkBlue: '#1d4ed8',
          lightBlue: '#eff6ff',
          bg: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
          textDark: '#0f172a',
          textMuted: '#64748b',
          greenBg: '#dcfce7',
          greenText: '#15803d',
          greenDot: '#22c55e',
          coralBg: '#fee2e2',
          coralText: '#b91c1c',
          coralDot: '#ef4444',
          amberBg: '#fef3c7',
          amberText: '#b45309'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
