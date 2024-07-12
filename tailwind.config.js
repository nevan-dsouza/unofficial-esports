/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'bebas': ['Bebas Neue', 'cursive'],
        'rajdhani': ['Rajdhani', 'sans-serif'],
        'exo': ['Exo 2', 'sans-serif'],
        'orbitron': ['Orbitron', 'sans-serif'],
        'oswald': ['Oswald', 'sans-serif'],
        'inter': ['Inter', 'Arial', 'sans-serif'],
      },
      fontWeight: {
        'extrabold': '800',
        'semibold': '600',
      },
      backgroundImage: {
        'gradient-to-r': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'gradient-to-l': 'linear-gradient(to left, var(--tw-gradient-stops))',
        'gradient-to-b': 'linear-gradient(to bottom, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
