const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "hover-dark": colors.gray[700],
        "hover-light": "#d1d5db",
      },
    },
  },
  plugins: [],
};
