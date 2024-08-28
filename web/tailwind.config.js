const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app,ui,providers}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      screens: {
        // xs: '428px',
      },
      boxShadow: {
        glow: '0 0 8px #ffd700, 0 0 12px #ffae00, 0 0 16px #ffd700',
        'glow-subtract': '0 0 8px #ff0000, 0 0 12px #cc0000, 0 0 16px #ff0000',
        'glow-add': '0 0 8px #00ff00, 0 0 12px #00cc00, 0 0 16px #00ff00',
      },
      keyframes: {
        glow: {
          '0%': {
            boxShadow:
              '0 0 5px #ffd700, 0 0 10px #ffae00, 0 0 15px #ffae00, 0 0 20px #ffd700',
          },
          '50%': {
            boxShadow:
              '0 0 20px #ffd700, 0 0 30px #ffae00, 0 0 40px #ffae00, 0 0 50px #ffd700',
          },
          '100%': {
            boxShadow:
              '0 0 5px #ffd700, 0 0 10px #ffae00, 0 0 15px #ffae00, 0 0 20px #ffd700',
          },
        },
        scale: {
          '0%': { transform: 'scale(0)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite',
        'scale-up': 'scale 0.5s ease-out forwards',
        'scale-down': 'scale 0.5s ease-out reverse forwards',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['coffee'],
  },
};
