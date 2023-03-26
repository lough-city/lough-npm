import { Package } from '@lough/npm-operate';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { startLoadingSpinner, startSpinner, succeedLoadingSpinner, succeedSpinner } from '../utils/spinner';

const getSub = (keyList: Array<string>) =>
  inquirer
    .prompt<{ targets: Array<string> }>([
      {
        type: 'checkbox',
        name: 'targets',
        message: `Please select need sort package:`,
        choices: keyList.map(type => ({ name: type, checked: true }))
      }
    ])
    .then(res => res.targets);

const action = async () => {
  const npm = new Package();

  if (npm.options.isWorkspaces) {
    const subList = await getSub([npm.name, ...npm.children.map(item => item.name)]);
    const list = [
      ...(subList.includes(npm.name) ? [npm] : []),
      ...npm.children.filter(item => subList.includes(item.name))
    ];

    startSpinner('Lough NPM Sort start');

    for (const item of list) {
      startLoadingSpinner(`${item.name}: start sort`);

      item.writeConfig(item.readConfig());

      succeedLoadingSpinner(`${item.name}: ${chalk.green('success')}`);
    }
  } else {
    startSpinner('');

    startLoadingSpinner(`${npm.name}: start sort`);

    npm.writeConfig(npm.readConfig());

    succeedLoadingSpinner(`${npm.name}: ${chalk.green('success')}`);
  }

  succeedSpinner('Lough NPM Sort success.');
};

export default {
  command: 'sort',
  description: 'Sort NPM package.json.',
  action
};
