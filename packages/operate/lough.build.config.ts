import { defineConfig } from '@lough/build-cli';

export default defineConfig({
  external: ['execa'],
  style: false,
  input: 'src/index.ts'
});
