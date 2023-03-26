import { defineConfig } from '@lough/build-cli';

export default defineConfig({
  external: ['@lough/npm-operate', 'commander', 'chalk', 'ora', 'inquirer'],
  globals: {
    commander: 'Commander',
    '@lough/npm-operate': 'LoughNpmOperate',
    chalk: 'Chalk',
    ora: 'Ora',
    inquirer: 'Inquirer'
  },
  style: false,
  input: 'src/index.ts'
});
