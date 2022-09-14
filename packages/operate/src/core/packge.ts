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
  /**
   * 是否 Yarn
   * @default false
   */
  isYarn?: boolean;
}

const readConfig = (rootConfigPath: string) => {
  const text = fs.readFileSync(rootConfigPath, 'utf-8');
  const config = JSON.parse(text);

  return config as IPackage;
};

const commandMap = {
  npm: {
    install: {
      save: (waitInstallPackageName: string) => `npm install ${waitInstallPackageName}`,
      dev: (waitInstallPackageName: string) => `npm install ${waitInstallPackageName} --save-dev`
    },
    uninstall: {
      save: (waitUninstallPackageName: string) => `npm uninstall ${waitUninstallPackageName}`,
      dev: (waitUninstallPackageName: string) => `npm uninstall ${waitUninstallPackageName} --save-dev`
    }
  },
  yarn: {
    install: {
      save: (waitInstallPackageName: string) => `yarn add ${waitInstallPackageName}`,
      dev: (waitInstallPackageName: string) => `yarn add ${waitInstallPackageName} --dev`
    },
    uninstall: {
      save: (waitUninstallPackageName: string) => `yarn remove ${waitUninstallPackageName}`,
      dev: (waitUninstallPackageName: string) => `yarn remove ${waitUninstallPackageName} --dev`
    }
  },
  workspaces: {
    npm: {
      install: {
        save: (waitInstallPackageName: string) => `npm install ${waitInstallPackageName}`,
        dev: (waitInstallPackageName: string) => `npm install ${waitInstallPackageName} --save-dev`
      },
      uninstall: {
        save: (waitUninstallPackageName: string) => `npm uninstall ${waitUninstallPackageName}`,
        dev: (waitUninstallPackageName: string) => `npm uninstall ${waitUninstallPackageName} --save-dev`
      }
    },
    yarn: {
      install: {
        save: (waitInstallPackageName: string) => `yarn add ${waitInstallPackageName} -W`,
        dev: (waitInstallPackageName: string) => `yarn add ${waitInstallPackageName} -W --dev`
      },
      uninstall: {
        save: (waitUninstallPackageName: string) => `yarn remove ${waitUninstallPackageName} -W`,
        dev: (waitUninstallPackageName: string) => `yarn remove ${waitUninstallPackageName} -W --dev`
      }
    }
  },
  workspace: {
    npm: {
      install: {
        save: (waitInstallPackageName: string, subPackageName: string) =>
          `npm install ${waitInstallPackageName} -w ${subPackageName}`,
        dev: (waitInstallPackageName: string, subPackageName: string) =>
          `npm install ${waitInstallPackageName} -w ${subPackageName} --save-dev`
      },
      uninstall: {
        save: (waitUninstallPackageName: string, subPackageName: string) =>
          `npm uninstall ${waitUninstallPackageName} -w ${subPackageName}`,
        dev: (waitUninstallPackageName: string, subPackageName: string) =>
          `npm uninstall ${waitUninstallPackageName} -w ${subPackageName} --save-dev`
      }
    },
    yarn: {
      install: {
        save: (waitInstallPackageName: string, subPackageName: string) =>
          `yarn workspace ${subPackageName} add ${waitInstallPackageName}`,
        dev: (waitInstallPackageName: string, subPackageName: string) =>
          `yarn workspace ${subPackageName} add ${waitInstallPackageName} --dev`
      },
      uninstall: {
        save: (waitUninstallPackageName: string, subPackageName: string) =>
          `yarn workspace ${subPackageName} remove ${waitUninstallPackageName}`,
        dev: (waitUninstallPackageName: string, subPackageName: string) =>
          `yarn workspace ${subPackageName} remove ${waitUninstallPackageName} --dev`
      }
    },
    lerna: {
      install: {
        save: (waitInstallPackageName: string, subPackageName: string) =>
          `lerna add ${waitInstallPackageName} --scope=${subPackageName}`,
        dev: (waitInstallPackageName: string, subPackageName: string) =>
          `lerna add ${waitInstallPackageName} --scope=${subPackageName} --dev`
      },
      uninstall: {
        save: (waitInstallPackageName: string, subPackageName: string) => false,
        dev: (waitInstallPackageName: string, subPackageName: string) => false
      }
    }
  }
};

export class Package {
  protected options: Required<Omit<IPackageParameters, 'emptyCreate'>> & {
    /**
     * 配置路径
     */
    readonly rootConfigPath: string;
  };

  protected get command(): {
    install: {
      save: (packageName: string, subPackageName?: string) => string;
      dev: (packageName: string, subPackageName?: string) => string;
    };
    uninstall: {
      save: (packageName: string, subPackageName?: string) => string;
      dev: (packageName: string, subPackageName?: string) => string;
    };
  } {
    if (this.options.isWorkspace) {
      if (this.options.isLerna) return commandMap.workspace.lerna as any;
      if (this.options.isYarn) return commandMap.workspace.yarn as any;
      return commandMap.workspace.npm as any;
    }

    if (this.options.isWorkspaces) {
      if (this.options.isYarn) return commandMap.workspaces.yarn;
      return commandMap.workspaces.npm;
    }

    if (this.options.isYarn) return commandMap.yarn;
    return commandMap.npm;
  }

  constructor(parameters: IPackageParameters) {
    const {
      dirName,
      configFileName,
      isWorkspaces = false,
      isWorkspace = false,
      workspacesDir = dirName,
      relativeWorkspacesDir = '',
      isLerna = false,
      isYarn = false
    } = parameters;

    this.options = {
      dirName: dirName,
      configFileName,
      get rootConfigPath() {
        return path.join(this.configDirName, this.configFileName);
      },
      isWorkspaces: isWorkspaces || !!readConfig(path.join(dirName, configFileName)).workspaces,
      isWorkspace: isWorkspace,
      workspacesDir: workspacesDir,
      relativeWorkspacesDir: relativeWorkspacesDir,
      isLerna: isLerna || fs.existsSync(path.join(dirName, 'lerna.json')),
      isYarn: isYarn || fs.existsSync(path.join(dirName, 'yarn.lock'))
    };
  }

  /**
   * 读配置
   */
  readConfig() {
    const text = fs.readFileSync(this.options.rootConfigPath, 'utf-8');
    const config = JSON.parse(text);

    return config as IPackage;
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
   * 安装生产依赖
   * @param dependencies 待安装依赖
   */
  install(dependencies: string | Array<string>) {
    if (!Array.isArray(dependencies)) dependencies = [dependencies];

    for (const dependency of dependencies) {
      execa.commandSync(this.command.install.save(dependency), { stdio: 'inherit' });
    }
  }

  /**
   * 安装开发依赖
   * @param dependencies 待安装依赖
   */
  installDev(dependencies: string | Array<string>) {
    if (!Array.isArray(dependencies)) dependencies = [dependencies];

    for (const dependency of dependencies) {
      execa.commandSync(this.command.install.dev(dependency), { stdio: 'inherit' });
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

      execa.commandSync(this.command.uninstall.save(dependency), { stdio: 'inherit' });
    }
  }
}
