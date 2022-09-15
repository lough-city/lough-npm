import fs from 'fs';
import path from 'path';
import { IPackage } from '../types/package';
import execa from 'execa';

/**
 * Package 类参数
 */
interface IPackageParameters {
  /**
   * 目录名称
   */
  dirName: string;
  /**
   * 配置文件名称
   */
  configFileName: string;
  /**
   * 是否工作空间
   * @default false
   */
  isWorkspaces?: boolean;
  /**
   * 工作空间目录
   * @default `dirName`
   */
  workspacesDir?: string;
  /**
   * 是否工作区
   * @default false
   */
  isWorkspace?: boolean;
  /**
   * 相对工作空间目录
   * @default ''
   */
  relativeWorkspacesDir?: string;
  /**
   * 是否 Lerna 项目
   * @default false
   */
  isLerna?: boolean;
}

export abstract class Package {
  name: string;

  protected options: Required<Omit<IPackageParameters, 'emptyCreate'>> & {
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

  constructor(parameters: IPackageParameters) {
    const {
      dirName,
      configFileName,
      isWorkspaces = false,
      isWorkspace = false,
      workspacesDir = dirName,
      relativeWorkspacesDir = '',
      isLerna = false
    } = parameters;

    const config = Package.readConfig(path.join(dirName, configFileName));

    this.options = {
      dirName: dirName,
      configFileName,
      get rootConfigPath() {
        return path.join(this.configDirName, this.configFileName);
      },
      isWorkspaces: isWorkspaces || !!config.workspaces,
      isWorkspace: isWorkspace,
      workspacesDir: workspacesDir,
      relativeWorkspacesDir: relativeWorkspacesDir,
      isLerna: isLerna || fs.existsSync(path.join(dirName, 'lerna.json'))
    };

    this.name = config.name;
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
    fs.writeFileSync(this.options.rootConfigPath, JSON.stringify(config, null, 2), 'utf8');
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
   * 安装命令
   */
  protected abstract commandInstall(
    waitInstallPackageName: string,
    workspacePackageName?: string,
    isDev?: boolean
  ): execa.ExecaSyncReturnValue<string>;

  /**
   * 卸载命令
   */
  protected abstract commandUnInstall(
    waitInstallPackageName: string,
    workspacePackageName?: string,
    isDev?: boolean
  ): execa.ExecaSyncReturnValue<string>;

  /**
   * 安装生产依赖
   * @param dependencies 待安装依赖
   */
  install(dependencies: string | Array<string>) {
    if (!Array.isArray(dependencies)) dependencies = [dependencies];

    for (const dependency of dependencies) {
      this.commandInstall(dependency, this.options.isWorkspace ? this.name : undefined, false);
    }
  }

  /**
   * 安装开发依赖
   * @param dependencies 待安装依赖
   */
  installDev(dependencies: string | Array<string>) {
    if (!Array.isArray(dependencies)) dependencies = [dependencies];

    for (const dependency of dependencies) {
      this.commandInstall(dependency, this.options.isWorkspace ? this.name : undefined, true);
    }
  }

  /**
   * 卸载依赖
   * @param dependencies 待卸载依赖
   */
  uninstall(dependencies: string | Array<string>) {
    if (!Array.isArray(dependencies)) dependencies = [dependencies];

    const npmConfigText = fs.readFileSync(this.options.rootConfigPath, 'utf-8');
    const npmConfig = JSON.parse(npmConfigText);
    let allDependencies: Array<string> = [];

    if (npmConfig.hasOwnProperty('dependencies')) {
      allDependencies = allDependencies.concat(Object.keys(npmConfig.dependencies));
    }

    if (npmConfig.hasOwnProperty('devDependencies')) {
      allDependencies = allDependencies.concat(Object.keys(npmConfig.devDependencies));
    }

    for (const dependency of dependencies) {
      if (!allDependencies.includes(dependency)) continue;

      this.commandUnInstall(dependency, this.options.isWorkspace ? this.name : undefined, false);
    }
  }
}
