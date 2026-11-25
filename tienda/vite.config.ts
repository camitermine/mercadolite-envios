import { pelelajsPlugin } from 'vite-plugin-pelelajs'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [pelelajsPlugin()],
  server: {
    port: 5174,
    strictPort: true,
  },
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/testing/**', 'src/global.d.ts'],
      reporter: ['text', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
