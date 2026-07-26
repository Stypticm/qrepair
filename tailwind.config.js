/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#faf7f2',
        teal: {
          500: '#7ec8dc',
          600: '#6bb8cc',
        },
      },
      fontFamily: {
        'sf-pro': [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      fontSize: {
        'apple-title': [
          '24px',
          { lineHeight: '1.2', fontWeight: '700' },
        ],
        'apple-body': [
          '16px',
          { lineHeight: '1.5', fontWeight: '400' },
        ],
        'apple-button': [
          '17px',
          { lineHeight: '1.3', fontWeight: '500' },
        ],
      },
      borderRadius: {
        apple: '8px',
        'apple-lg': '12px',
        'apple-xl': '16px',
      },
      backdropBlur: {
        apple: '20px',
      },
    },
  },
  plugins: [],
}
