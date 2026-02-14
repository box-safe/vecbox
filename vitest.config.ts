import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 30000, // 30 seconds for API calls
    setupFiles: [], // Ensure env is loaded before tests
  },
});
