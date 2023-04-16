import fs from 'fs';
import path from 'path';
import { commandSync } from 'execa';
import { package_field_schema, RULE_TYPE, ObjectRule } from './schemas/package';
import { IPackageParameters } from './types';
import { IPackage } from './types/package';

const objectSortByKeys = <O extends object>(
  obj: O,
  keys: Array<string>,
  handle?: (key: string, value: O[keyof O]) => O[keyof O]
) => {
  const _object = JSON.parse(JSON.stringify(obj)) as O;
  const fork = {} as O;

  for (const key of keys) {
    if (_object.hasOwnProperty(key)) {
      fork[key] = handle ? handle(key, _object[key]) : _object[key];
      delete _object[key];
    }
  }

  return { ...fork, ..._object };
};

const objectSortByDataSchema = <O extends Record<string, any>, DS extends ObjectRule>(obj: O, dataSchema: DS) => {
  const fork = objectSortByKeys(obj, Object.keys(dataSchema.properties), (key, value) => {
    const { rules } = dataSchema.properties[key];

    for (const rule of rules) {
      if (rule.type === RULE_TYPE.object && Object.prototype.toString.call(value) === '[object Object]')
        return objectSortByDataSchema(value, rule);
    }

    return value;
  });

  return fork;
};

/**
 * NPM 包
 */
export class Package {
  /**
   * 名称
   */
  name: string;

  /**
   * 版本
   */
  version: string;

  /**
   * 子包
   */
  children: Array<Package>;

  /**
   * 选项
   */
  options: Required<Omit<IPackageParameters, 'emptyCreate'>> & {
    /**
     * 配置路径
     */
    readonly rootConfigPath: string;
  };

  static readConfig = (rootConfigPath: string) => {
    const text = fs.readFileSync(rootConfigPath, 'utf-8');
    const config = JSON.parse(text);

    return config as IPackage;
  };

  constructor(parameters: IPackageParameters = {}) {
    const {
      dirName = process.cwd(),
      configFileName = 'package.json',
      isWorkspaces = false,
      isWorkspace = false,
      workspacesDir = dirName,
      relativeWorkspacesDir = '',
      isLerna = false,
      isYarn = false
    } = parameters;

    if (!fs.existsSync(path.join(dirName, configFileName))) throw new Error('未检测到 NPM 配置！');

    const config = Package.readConfig(path.join(dirName, configFileName));

    this.options = {
      dirName: dirName,
      configFileName,
      get rootConfigPath() {
        return path.join(this.dirName, this.configFileName);
      },
      isWorkspaces: isWorkspaces || !!config.workspaces,
      isWorkspace: isWorkspace,
      workspacesDir: workspacesDir,
      relativeWorkspacesDir: relativeWorkspacesDir,
      isLerna: isLerna || fs.existsSync(path.join(dirName, 'lerna.json')),
      isYarn: isYarn || fs.existsSync(path.join(dirName, 'yarn.lock'))
    };

    this.name = config.name;
    this.version = config.version;

    this.children = [];

    if (this.options.isWorkspaces) {
      for (let workspace of config.workspaces || ['packages/*']) {
        workspace = workspace.replace('/*', '');

        const files = fs.readdirSync(path.join(dirName, workspace));
        for (const fileName of files) {
          const packageParams: IPackageParameters = {
            dirName: path.join(dirName, workspace, fileName),
            configFileName: 'package.json',
            isWorkspaces: false,
            workspacesDir: dirName,
            isWorkspace: true,
            relativeWorkspacesDir: path.join(workspace, fileName),
            isLerna: this.options.isLerna,
            isYarn: this.options.isYarn
          };

          this.children.push(new Package(packageParams));
        }
      }
    }
  }

  /**
   * 读配置
   */
  readConfig() {
    return Package.readConfig(this.options.rootConfigPath);
  }

  /**
   * 写配置
   */
  writeConfig(config: IPackage) {
    const fork = objectSortByDataSchema(config, package_field_schema);

    fs.writeFileSync(this.options.rootConfigPath, JSON.stringify(fork, null, 2), 'utf8');
  }

  /**
   * 写部分配置
   */
  writePartConfig(config: Partial<IPackage>) {
    const oldConfig = this.readConfig();
    const mergeConfig = { ...oldConfig, ...config };

    this.writeConfig(mergeConfig);

    return mergeConfig as IPackage;
  }

  /**
   * 命令安装
   */
  protected commandInstall(packageNames: string | Array<string>, workspacePackageName?: string, isDev?: boolean) {
    packageNames = Array.isArray(packageNames) ? packageNames : [packageNames];
    const joinedPackageNames = packageNames.join(' ');

    if (this.options.isYarn) {
      const dev = isDev ? ' --dev' : '';

      if (this.options.isWorkspace) {
        if (this.options.isLerna) {
          return packageNames.map(name =>
            commandSync(`lerna add ${name} --scope=${workspacePackageName}${dev}`, {
              cwd: this.options.workspacesDir,
              stdio: 'inherit'
            })
          );
        }

        return commandSync(`yarn workspace ${workspacePackageName} add ${joinedPackageNames}${dev}`, {
          cwd: this.options.workspacesDir,
          stdio: 'inherit'
        });
      }

      if (this.options.isWorkspaces)
        return commandSync(`yarn add ${joinedPackageNames} -W${dev}`, {
          cwd: this.options.dirName,
          stdio: 'inherit'
        });

      return commandSync(`yarn add ${joinedPackageNames}${dev}`, {
        cwd: this.options.dirName,
        stdio: 'inherit'
      });
    } else {
      const dev = isDev ? ' --save-dev' : '';
      const lernaDev = isDev ? ' --dev' : '';

      if (this.options.isWorkspace) {
        if (this.options.isLerna) {
          return commandSync(`lerna add ${packageNames} --scope=${workspacePackageName}${lernaDev}`, {
            cwd: this.options.workspacesDir,
            stdio: 'inherit'
          });
        }

        return commandSync(`npm install ${joinedPackageNames} -w ${workspacePackageName}${dev}`, {
          cwd: this.options.workspacesDir,
          stdio: 'inherit'
        });
      }

      if (this.options.isWorkspaces)
        return commandSync(`npm install ${joinedPackageNames}${dev}`, {
          cwd: this.options.dirName,
          stdio: 'inherit'
        });

      return commandSync(`npm install ${joinedPackageNames}${dev}`, {
        cwd: this.options.dirName,
        stdio: 'inherit'
      });
    }
  }

  /**
   * 命令卸载
   */
  protected commandUnInstall(packageNames: string | Array<string>, workspacePackageName?: string, isDev?: boolean) {
    packageNames = Array.isArray(packageNames) ? packageNames : [packageNames];
    const joinedPackageNames = packageNames.join(' ');

    if (this.options.isYarn) {
      const dev = isDev ? ' --dev' : '';

      if (this.options.isWorkspace)
        return commandSync(`yarn workspace ${workspacePackageName} remove ${joinedPackageNames}${dev}`, {
          cwd: this.options.workspacesDir,
          stdio: 'inherit'
        });

      if (this.options.isWorkspaces)
        return commandSync(`yarn remove ${joinedPackageNames} -W${dev}`, {
          cwd: this.options.dirName,
          stdio: 'inherit'
        });

      return commandSync(`yarn remove ${joinedPackageNames}${dev}`, {
        cwd: this.options.dirName,
        stdio: 'inherit'
      });
    } else {
      const dev = isDev ? ' --save-dev' : '';

      if (this.options.isWorkspace) {
        return commandSync(`npm uninstall ${joinedPackageNames} -w ${workspacePackageName}${dev}`, {
          cwd: this.options.workspacesDir,
          stdio: 'inherit'
        });
      }

      if (this.options.isWorkspaces)
        return commandSync(`npm uninstall ${joinedPackageNames}${dev}`, {
          cwd: this.options.dirName,
          stdio: 'inherit'
        });

      return commandSync(`npm uninstall ${joinedPackageNames}${dev}`, {
        cwd: this.options.dirName,
        stdio: 'inherit'
      });
    }
  }

  /**
   * 查看注册表信息
   */
  view(packageName: string) {
    return JSON.parse(commandSync(`npm view ${packageName} --json`).stdout) as IPackage;
  }

  /**
   * 冷安装
   */
  protected coldInstall(packageNames: string | Array<string>) {
    packageNames = Array.isArray(packageNames) ? packageNames : [packageNames];
    const config = this.readConfig();
    if (!config.dependencies) config.dependencies = {};

    for (const packageName of packageNames) {
      const { version } = this.view(packageName);
      if (!version) throw new Error(`${packageName} not found version!`);
      config.dependencies[packageName] = `^${version}`;
    }
  }

  /**
   * 冷卸载
   */
  protected coldUnInstall(packageNames: string | Array<string>) {
    packageNames = Array.isArray(packageNames) ? packageNames : [packageNames];

    const config = this.readConfig();
    if (!config.devDependencies) config.devDependencies = {};

    for (const packageName of packageNames) {
      const { version } = this.view(packageName);
      if (!version) throw new Error(`${packageName} not found version!`);
      config.devDependencies[packageName] = `^${version}`;
    }
  }

  /**
   * 安装生产依赖
   */
  install(dependencies: string | Array<string>) {
    if (!Array.isArray(dependencies)) dependencies = [dependencies];

    this.commandInstall(dependencies, this.options.isWorkspace ? this.name : undefined, false);
  }

  /**
   * 安装开发依赖
   */
  installDev(dependencies: string | Array<string>) {
    if (!Array.isArray(dependencies)) dependencies = [dependencies];

    this.commandInstall(dependencies, this.options.isWorkspace ? this.name : undefined, true);
  }

  /**
   * 卸载依赖
   */
  uninstall(dependencies: string | Array<string>) {
    if (!Array.isArray(dependencies)) dependencies = [dependencies];

    const config = this.readConfig();

    const allDependencies = [...Object.keys(config.dependencies || {}), ...Object.keys(config.devDependencies || {})];

    const existDependencies = dependencies.filter(dependency => allDependencies.includes(dependency));

    if (existDependencies.length) {
      this.commandUnInstall(existDependencies, this.options.isWorkspace ? this.name : undefined, false);
    }
  }

  /**
   * 启动程式
   */
  bootstrap() {
    if (this.options.isYarn) {
      if (this.options.isWorkspace) {
        if (this.options.isLerna) {
          return commandSync('lerna bootstrap', {
            cwd: this.options.workspacesDir,
            stdio: 'inherit'
          });
        }
      }

      return commandSync('yarn', {
        cwd: this.options.dirName,
        stdio: 'inherit'
      });
    } else {
      if (this.options.isWorkspace) {
        if (this.options.isLerna) {
          return commandSync('lerna bootstrap', {
            cwd: this.options.workspacesDir,
            stdio: 'inherit'
          });
        }
      }

      return commandSync('npm install', {
        cwd: this.options.dirName,
        stdio: 'inherit'
      });
    }
  }
}

export * from './constants/package';
export * from './schemas/package';
export * from './types/index';
export * from './types/package';
