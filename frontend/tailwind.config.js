/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        shell: '#0B1120',
        ink: '#FFFFFF',
        soft: 'rgba(255,255,255,0.7)',
        muted: 'rgba(255,255,255,0.5)',
        glass: 'rgba(255,255,255,0.05)',
        stroke: 'rgba(255,255,255,0.1)',
        verdict: '#9E1C1C',
        alert: '#FF5B5B',
        electric: '#1D7FFF',
        violet: '#885CFF',
        fuchsia: '#F43FE3',
      },
      backgroundImage: {
        page:
          'radial-gradient(circle at 18% 28%, rgba(50, 108, 255, 0.18), transparent 18%), radial-gradient(circle at 78% 30%, rgba(165, 103, 255, 0.14), transparent 18%), linear-gradient(180deg, #0A162A 0%, #112240 34%, #1E293B 70%, #0B1120 100%)',
        heading: 'linear-gradient(90deg, #2F7BFF 0%, #8B5CFF 46%, #FF42D0 100%)',
      },
      boxShadow: {
        card: '0 24px 80px rgba(2, 6, 23, 0.45)',
        glow: '0 0 30px rgba(100, 140, 255, 0.35)',
        alert: '0 0 36px rgba(255, 69, 69, 0.28)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(0, -20px, 0) scale(1.04)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(14px, -16px, 0)' },
        },
        beam: {
          '0%, 100%': { opacity: '0.45', transform: 'scaleX(0.9)' },
          '50%': { opacity: '0.9', transform: 'scaleX(1)' },
        },
        pulseAlert: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(255, 91, 91, 0.15)' },
          '50%': { boxShadow: '0 0 32px rgba(255, 91, 91, 0.42)' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        float: 'float 10s ease-in-out infinite',
        drift: 'drift 14s ease-in-out infinite',
        beam: 'beam 3.4s ease-in-out infinite',
        alert: 'pulseAlert 1.8s ease-in-out infinite',
        blink: 'blink 1s steps(2, start) infinite',
        spinSlow: 'spinSlow 12s linear infinite',
      },
    },
  },
  plugins: [],
};
