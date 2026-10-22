import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/unit/**/*.test.ts'],
    // `npx vitest run --coverage` — gate the pure EPF engine at ≥95% lines.
    coverage: {
      include: [
        'src/lib/calculators/epf/engine.ts',
        'src/lib/calculators/epf/params.ts',
        'src/lib/calculators/epf/defaults.ts',
        'src/lib/calculators/epf/types.ts',
        'src/lib/calculators/epf/rules.ts',
        'src/lib/calculators/epf/schema.ts',
      ],
      thresholds: { lines: 95 },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
