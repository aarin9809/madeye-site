/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0a0a12',
          surface: '#10101c',
          elevated: '#16162a',
          border: '#1e1e3a',
        },
        cyber: {
          cyan: '#22d3ee',
          magenta: '#e879f9',
          green: '#4ade80',
          red: '#f87171',
          yellow: '#facc15',
          orange: '#fb923c',
          blue: '#60a5fa',
        },
        text: {
          primary: '#e2e2f0',
          secondary: '#9999bb',
          muted: '#55556a',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scan 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(-100%)' },
          '50%': { transform: 'translateY(100vh)' },
        },
        glow: {
          from: { boxShadow: '0 0 5px #22d3ee, 0 0 10px #22d3ee' },
          to: { boxShadow: '0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 40px #22d3ee' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      backgroundImage: {
        'cyber-grid': `
          linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)
        `,
        'gradient-cyber': 'linear-gradient(135deg, #22d3ee 0%, #e879f9 100%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      boxShadow: {
        'cyber': '0 0 15px rgba(34,211,238,0.15)',
        'cyber-hover': '0 0 25px rgba(34,211,238,0.3)',
        'magenta': '0 0 15px rgba(232,121,249,0.15)',
        'glow-cyan': '0 0 20px rgba(34,211,238,0.4)',
        'glow-red': '0 0 20px rgba(248,113,113,0.4)',
        'glow-green': '0 0 20px rgba(74,222,128,0.4)',
      },
    },
  },
  plugins: [],
};
