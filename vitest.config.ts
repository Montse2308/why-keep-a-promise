import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    environment: 'node',
    // palette.test.ts reads tokens.css as text (`?raw`); Vitest empties CSS files unless included.
    css: { include: [/tokens\.css/] },
  },
});
