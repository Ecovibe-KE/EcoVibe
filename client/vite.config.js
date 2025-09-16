import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './jest.setup.js',
    provider: 'v8',
    coverage: {
      reporter: ['text', 'json-summary', 'html', 'json'],
      reportOnFailure: true,
    },
  },
})
