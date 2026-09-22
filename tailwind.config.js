/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // SOC console surfaces
        abyss: '#05080e',
        panel: '#0b1220',
        panel2: '#111b2c',
        line: '#1e2b40',
        line2: '#2a3b56',
        ink: '#e6edf7',
        muted: '#93a4bd',
        dim: '#64748b',
        // accents
        neon: {
          DEFAULT: '#22d3ee',
          soft: '#67e8f9',
          deep: '#0e7490',
        },
        sev: {
          critical: '#ff3b5c',
          high: '#ff8c42',
          medium: '#f5c542',
          low: '#38bdf8',
          info: '#94a3b8',
        },
        ok: '#34d399',
        bad: '#f43f5e',
        iris: '#a78bfa',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(34,211,238,0.35), 0 0 22px -6px rgba(34,211,238,0.45)',
        panel: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 12px 30px -18px rgba(0,0,0,0.9)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        blink: {
          '0%, 45%': { opacity: '1' },
          '50%, 100%': { opacity: '0.15' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(255,59,92,0.45)' },
          '70%': { boxShadow: '0 0 0 10px rgba(255,59,92,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255,59,92,0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 260ms ease-out both',
        slideIn: 'slideIn 220ms ease-out both',
        blink: 'blink 1.4s steps(1) infinite',
        pulseRing: 'pulseRing 2s ease-out infinite',
      },
    },
  },
  plugins: [],
};
