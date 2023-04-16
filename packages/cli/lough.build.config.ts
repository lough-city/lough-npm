import { defineConfig } from '@lough/build-cli';

export default defineConfig({
  external: ['@lough/npm-operate', 'commander', 'chalk', 'ora', 'inquirer'],
  style: false,
  input: 'src/index.ts'
});
