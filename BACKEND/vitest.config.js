import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    env: {
      NODE_ENV: 'test',
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    include: ['tests/**/*.test.js'],
  },
});