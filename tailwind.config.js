/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#020201',      // Negro/Oscuro
          yellow: '#FCC21B',    // Amarillo
          blue: '#003893',      // Azul
          red: '#CE1126',       // Rojo
        },
      },
      boxShadow: {
        'brand-sm': '0 2px 10px -4px rgba(2,2,1,0.10)',
        'brand-md': '0 10px 28px -8px rgba(0,56,147,0.20)',
        'brand-lg': '0 24px 55px -16px rgba(0,56,147,0.28)',
        'brand-xl': '0 32px 70px -20px rgba(2,2,1,0.30)',
        'brand-glow-blue': '0 0 0 4px rgba(0,56,147,0.14)',
        'brand-glow-yellow': '0 0 0 4px rgba(252,194,27,0.22)',
        'brand-glow-red': '0 0 0 4px rgba(206,17,38,0.16)',
        'brand-inset': 'inset 0 1px 2px rgba(2,2,1,0.06)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #FCC21B 0%, #003893 55%, #CE1126 100%)',
        'brand-gradient-soft':
          'linear-gradient(135deg, rgba(252,194,27,0.14) 0%, rgba(0,56,147,0.12) 55%, rgba(206,17,38,0.10) 100%)',
        'brand-radial':
          'radial-gradient(circle at 30% 20%, rgba(252,194,27,0.16), transparent 55%), radial-gradient(circle at 80% 0%, rgba(0,56,147,0.14), transparent 50%), radial-gradient(circle at 50% 100%, rgba(206,17,38,0.10), transparent 55%)',
      },
      transitionTimingFunction: {
        'brand-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'brand-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
    },
  },
  plugins: [],
};