import { defineConfig } from '@tailwindcss/vite'

export default defineConfig({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      'mok-blue': '#0013FF',
      'mok-green': '#CBFF63',
    },
    extend: {
      fontFamily: {
        'sans': ['Fira Code', 'monospace'],
      },
      maxWidth: {
        'container': '1184px',
      }
    },
  },
})