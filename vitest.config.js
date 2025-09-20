
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    setupFiles: './src/tests/setup.js',
    environment: 'jsdom',
    include: [
    'src/tests/**/*.{test,spec}.{js,jsx,ts,tsx}',
    'client/tests/**/*.{test,spec}.{js,jsx,ts,tsx}',
    ],



    coverage: {
      provider: 'istanbul',
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/main.jsx'],
      all: true,
      reporter: ['text', 'json-summary', 'html', 'json'],
      reportOnFailure: true,
      thresholds: {
        lines: 60,
        branches: 60,
        functions: 60,
        statements: 60
      },
    },
  },
})


