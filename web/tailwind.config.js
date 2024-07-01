const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      boxShadow: {
        // glow: '0 0 10px #0f0, 0 0 20px #0f0, 0 0 30px #0f0, 0 0 40px #0f0',
        glow: '0 0 20px 10px #00f, 0 0 30px 15px #00f, 0 0 40px 20px #00f, 0 0 50px 25px #00f',
      },
      keyframes: {
        glow: {
          '0%': {
            boxShadow:
              '0 0 5px #0f0, 0 0 10px #0f0, 0 0 15px #0f0, 0 0 20px #0f0',
          },
          '50%': {
            boxShadow:
              '0 0 20px #0f0, 0 0 30px #0f0, 0 0 40px #0f0, 0 0 50px #0f0',
          },
          '100%': {
            boxShadow:
              '0 0 5px #0f0, 0 0 10px #0f0, 0 0 15px #0f0, 0 0 20px #0f0',
          },
        },
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['coffee'],
  },
};
