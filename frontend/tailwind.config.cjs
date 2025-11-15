/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#038391",
        primaryDark: "#068460",
        danger: "#8B0E04",
        accentRed: "#CF4240",
        accentBrown: "#551900",
        grayBg: "#EEEEEE",
        tealSoft: "#A1CBC9",
        yellowAccent: "#F7D002",
        pinkAccent: "#E00490",
        darkText: "#333333",
      },
      borderRadius: {
        card: "1rem",
      },
    },
  },
  plugins: [],
};
