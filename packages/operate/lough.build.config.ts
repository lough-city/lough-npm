import { defineConfig } from '@lough/build-cli';

export default defineConfig({
  external: ['execa'],
  globals: { execa: 'Execa' },
  style: false,
  input: 'src/index.ts'
});
