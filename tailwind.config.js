/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}',"./app/**/*.{js,jsx,ts,tsx}", './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#4FB3BF",
        "primary-dark": "#3A8A94",
        "accent": "#2F80ED",
        "background-light": "#F7F9FA",
        "background-dark": "#121212",
        "surface-light": "#FFFFFF",
        "surface-dark": "#1E1E1E",
        "text-primary-light": "#333333",
        "text-primary-dark": "#E0E0E0",
        "text-secondary-light": "#828282",
        "text-secondary-dark": "#B0B0B0",
        "border-light": "#E0E0E0",
        "border-dark": "#333333",
      },
    },
  },
  plugins: [],
};
