/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{mjs,js}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#EBF4FF', 100: '#D6E8FF', 200: '#A8CDFF', 300: '#6FB0FA', 500: '#1A7FE6', 600: '#0066CC', 700: '#0052A3', 800: '#003D7A', 900: '#002952', 950: '#001833' },
        accent: '#FFD23F'
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif']
      }
    }
  }
};
