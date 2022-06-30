import fs from 'fs';
import path from 'path';
import execa from 'execa';
import { INpmParameters } from './types';
import { PACKAGE_MANAGE_TOOL } from './constants';

export const existsCommand = (command: string) => {
  let test = false;

  try {
    execa.commandSync(command, { encoding: 'utf8' });
    test = true;
  } catch (error) {}

  return test;
};

/**
 * npm 操作类
 */
class NpmOperate {
  protected options = {} as Required<Omit<INpmParameters, 'getEarsPackageManageTool'>>;

  protected packageManageTool = PACKAGE_MANAGE_TOOL.yarn;

  protected isLernaProject = false;

  protected packages: Record<string, string> = {};

  protected get rootConfigPath() {
    return path.join(this.options.rootPath, this.options.configPath);
  }

  constructor(parameters: INpmParameters = {}) {
    // TODO: 初始化 npm init
    const { rootPath = process.cwd(), configPath = 'package.json', getEarsPackageManageTool } = parameters;

    this.options.rootPath = rootPath;
    this.options.configPath = configPath;

    if (!fs.existsSync(path.join(rootPath, configPath))) throw new Error('未检测到 NPM 配置！');

    this.packageManageTool = fs.existsSync(`${rootPath}/package-lock.json`)
      ? PACKAGE_MANAGE_TOOL.npm
      : fs.existsSync(`${rootPath}/yarn.lock`)
      ? PACKAGE_MANAGE_TOOL.yarn
      : undefined;

    if (!this.packageManageTool && getEarsPackageManageTool)
      this.packageManageTool = getEarsPackageManageTool(PACKAGE_MANAGE_TOOL);
    this.isLernaProject = fs.existsSync(`${rootPath}/lerna.json`);

    if (this.isLernaProject) {
      const files = fs.readdirSync(path.join(rootPath, 'packages'));
      for (const fileName of files) {
        const config = this.readConfig(path.join(rootPath, 'packages', fileName, 'package.json'));
        this.packages[config.name] = fileName;
      }
    }
  }

  protected getInstallCommand(packageName: string, isDev = false) {
    if (this.packageManageTool === PACKAGE_MANAGE_TOOL.yarn) {
      if (this.isLernaProject) return `yarn add ${packageName} -W${isDev ? 'D' : ''}`;
      return `yarn add ${packageName}${isDev ? ' -D' : ''}`;
    }

    return `npm install ${packageName}${isDev ? ' -D' : ''}`;
  }

  protected getUninstallCommand(packageName: string) {
    if (this.packageManageTool === PACKAGE_MANAGE_TOOL.yarn) {
      if (this.isLernaProject) return `yarn remove ${packageName} -WD`;
      return `yarn remove ${packageName}`;
    }

    return `npm uninstall ${packageName}`;
  }

  /**
   * 读配置
   */
  readConfig(configPath = this.rootConfigPath) {
    const text = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(text);

    return config;
  }

  /**
   * 读子包配置
   * @param packageName 子包名
   */
  readConfigLerna(packageName: string) {
    return this.readConfig(path.join(this.options.rootPath, 'packages', this.packages[packageName]));
  }

  /**
   * 读所有子包配置
   */
  readConfigLernaAll() {
    const configAll: Record<string, Record<string, any>> = {};

    for (const packageName of Object.keys(this.packages)) {
      configAll[packageName] = this.readConfigLerna(packageName);
    }

    return configAll;
  }

  /**
   * 写配置
   * @param config 待写入配置
   */
  writeConfig(config: Record<string, any>, configPath = this.rootConfigPath) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  }

  /**
   * 写子包配置
   * @param packageName 子包名
   */
  writeConfigLerna(config: Record<string, any>, packageName: string) {
    return this.writeConfig(config, path.join(this.options.rootPath, 'packages', this.packages[packageName]));
  }

  /**
   * 安装生产依赖
   * @param dependencies 待安装依赖
   */
  install(dependencies: string | Array<string>) {
    if (!Array.isArray(dependencies)) dependencies = [dependencies];

    for (const dependency of dependencies) {
      execa.commandSync(this.getInstallCommand(dependency, false), { stdio: 'inherit' });
    }
  }

  /**
   * 安装开发依赖
   * @param dependencies 待安装依赖
   */
  installDev(dependencies: string | Array<string>) {
    if (!Array.isArray(dependencies)) dependencies = [dependencies];

    for (const dependency of dependencies) {
      execa.commandSync(this.getInstallCommand(dependency, true), { stdio: 'inherit' });
    }
  }

  /**
   * 卸载依赖
   * @param dependencies 待卸载依赖
   */
  uninstall(dependencies: string | Array<string>) {
    if (!Array.isArray(dependencies)) dependencies = [dependencies];

    const npmConfigText = fs.readFileSync(this.rootConfigPath, 'utf-8');
    const npmConfig = JSON.parse(npmConfigText);
    let allDependencies = [];

    if (npmConfig.hasOwnProperty('dependencies')) {
      allDependencies = allDependencies.concat(Object.keys(npmConfig.dependencies));
    }

    if (npmConfig.hasOwnProperty('devDependencies')) {
      allDependencies = allDependencies.concat(Object.keys(npmConfig.devDependencies));
    }

    for (const dependency of dependencies) {
      if (!allDependencies.includes(dependency)) continue;

      execa.commandSync(this.getUninstallCommand(dependency), { stdio: 'inherit' });
    }
  }

  /**
   * 安装子包生产依赖
   * @param dependencies 待安装依赖
   * @param packages 需要安装依赖的子包
   */
  installLerna(dependencies: string | Array<string>, packages: string | Array<string> = Object.keys(this.packages)) {
    if (!Array.isArray(dependencies)) dependencies = [dependencies];
    if (!Array.isArray(packages)) packages = [packages];

    for (const dependency of dependencies) {
      for (const packageName of packages) {
        execa.commandSync(`lerna add ${dependency} --scope=${packageName}`, { stdio: 'inherit' });
      }
    }
  }

  /**
   * 安装子包开发依赖
   * @param dependencies 待安装依赖
   * @param packages 需要安装依赖的子包
   */
  installDevLerna(dependencies: string | Array<string>, packages: string | Array<string> = Object.keys(this.packages)) {
    if (!Array.isArray(dependencies)) dependencies = [dependencies];
    if (!Array.isArray(packages)) packages = [packages];

    for (const dependency of dependencies) {
      for (const packageName of packages) {
        execa.commandSync(`lerna add ${dependency} --scope=${packageName} -D`, { stdio: 'inherit' });
      }
    }
  }

  /**
   * 卸载子包依赖
   * @param dependencies 待卸载依赖
   * @param packages 需要安装依赖的子包
   */
  uninstallLerna(dependencies: string | Array<string>, packages: string | Array<string> = Object.keys(this.packages)) {
    if (!Array.isArray(dependencies)) dependencies = [dependencies];
    if (!Array.isArray(packages)) packages = [packages];

    for (const packageName of packages) {
      const npmConfig = this.readConfigLerna(packageName);

      for (const dependency of dependencies) {
        if (npmConfig.hasOwnProperty('dependencies') && npmConfig.dependencies[dependency]) {
          delete npmConfig.dependencies[dependency];
        }

        if (npmConfig.hasOwnProperty('devDependencies') && npmConfig.devDependencies[dependency]) {
          delete npmConfig.devDependencies[dependency];
        }
      }

      this.writeConfigLerna(npmConfig, packageName);
    }
  }
}

export * from './constants';
export default NpmOperate;
