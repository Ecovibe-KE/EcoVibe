import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: './jest.setup.js',
    environment: 'jsdom',
    coverage: {
      provider: 'istanbul',
      include: ['src/**/*'],
      exclude: [
        'src/**/*.d.ts',
        'src/main.jsx'
      ],
      all: true,
      reporter: ['text', 'json-summary', 'html', 'json'],
      reportOnFailure: true,
      thresholds: {
        // Have at least 60% coverage
        lines: 60,
        branches: 60,
        functions: 60,
        statements: 60
      },
    },
  },
})
