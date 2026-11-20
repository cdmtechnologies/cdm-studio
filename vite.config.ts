import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' so the site works at cdmtechnologies.github.io/cdm-studio/ (and on any other address)
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: { sourcemap: false, target: 'es2020' },
  test: { include: ['src/**/*.test.ts'] },
})
