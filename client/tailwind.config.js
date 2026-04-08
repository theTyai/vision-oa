/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:          '#0b0f0c',
        card:        '#111827',
        neon:        '#00ff88',
        neonDark:    '#00cc6a',
        accent:      '#22c55e',
        muted:       '#374151',
        textPrimary: '#e5e7eb',
        textMuted:   '#9ca3af',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon:   '0 0 20px #00ff8830',
        'neon-lg': '0 0 40px #00ff8840',
        card:   '0 4px 24px #00000060',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in':    'fadeIn 0.35s ease both',
        'slide-down': 'slideDown 0.25s ease both',
        'slide-up':   'slideUp 0.3s ease both',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(#00ff8806 1px, transparent 1px), linear-gradient(90deg, #00ff8806 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid': '48px 48px',
      },
    },
  },
  plugins: [],
}
