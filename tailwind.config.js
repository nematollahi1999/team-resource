/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,svelte,ts}", // all your Svelte and JS/TS files
  ],
  theme: {
    extend: {
      fontFamily: {
        geist: ["Geist", "sans-serif"], 
      },
      
    },
  },
  plugins: [],
};
