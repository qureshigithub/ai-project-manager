/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0e1117',
        foreground: '#fafafa',
        primary: '#00d2ff',
        secondary: '#1a1a2e',
        card: '#1e1e2f',
        muted: '#2a2a3a',
        border: '#333344',
        input: '#333344',
        ring: '#00d2ff',
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '4px',
      },
    },
  },
  plugins: [],
}