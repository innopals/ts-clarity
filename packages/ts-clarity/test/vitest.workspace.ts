// import path from 'path';
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      name: 'ts-clarity',
      environment: 'node',
      setupFiles: [],
      include: ['./packages/ts-clarity/**/*.test.ts'],
    },
  },
]);
