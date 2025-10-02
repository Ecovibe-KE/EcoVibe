import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
  test: {
    globals: true,
    setupFiles: './tests/setup.js',
    environment: 'jsdom',
      coverage: {
      provider: 'istanbul',
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/main.jsx'
      ],
      all: true,
      reporter: ['text', 'json-summary', 'html', 'json'],
      reportOnFailure: true,
      thresholds: {
        // Have at least 50% coverage TODO: Increase these thresholds as you add more tests
        lines: 50,
        branches: 50,
        functions: 50,
        statements: 50
      },
    },
  },
})
