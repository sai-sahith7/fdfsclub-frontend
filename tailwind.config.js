export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        bg: {
          DEFAULT: '#121212',
          2: '#181818',
          3: '#1f1f1f',
          4: '#252525',
        },
        accent: {
          DEFAULT: '#e8c97d',
          dim: '#c8a94d',
        },
        cine: {
          green: '#41d6a6',
          blue: '#539df5',
          red: '#f3727f',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          md: 'rgba(255,255,255,0.12)',
        },
      },
      animation: {
        blink: 'blink 1.5s ease-in-out infinite',
        floatUp: 'floatUp 0.5s ease both',
        slideUp: 'slideUp 0.35s cubic-bezier(0.32,0.72,0,1)',
        ringPulse: 'ringPulse 2s ease-out infinite',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        blink: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.3' } },
        floatUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'none' } },
        slideUp: { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        ringPulse: { '0%': { opacity: '1', transform: 'scale(1)' }, '100%': { opacity: '0', transform: 'scale(1.06)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}