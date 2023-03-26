#!/usr/bin/env node
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Package } from '@lough/npm-operate';
import { program } from 'commander';
import sort from './commands/sort';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function start() {
  const npm = new Package({ dirName: join(__dirname, '..') });
  program.version(npm.version);

  program.command(sort.command).description(sort.description).action(sort.action);

  program.parseAsync(process.argv);
}

start();
