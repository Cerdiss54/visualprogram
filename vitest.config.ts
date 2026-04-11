import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.ts'],
    reporters: ['default', 'junit'],
    outputFile: {
      junit: './test-results/junit.html',
    },
  },
});