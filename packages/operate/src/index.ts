import fs from 'fs';
import path from 'path';
import execa from 'execa';
import { IPackageParameters } from './types';
import { IPackage } from './types/package';

export class Package {
  name: string;

  children: Array<Package>;

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

    this.children = [];

    if (this.options.isWorkspaces) {
      for (let workspace of config.workspaces || ['packages/*']) {
        workspace = (workspace as string).replace('/*', '');

        const files = fs.readdirSync(path.join(dirName, workspace));
        for (const fileName of files) {
          const packageParams: IPackageParameters = {
            dirName: path.join(dirName, workspace, fileName),
            configFileName: 'package.json',
            isWorkspaces: false,
            workspacesDir: dirName,
            isWorkspace: true,
            relativeWorkspacesDir: path.join(workspace, fileName),
            isLerna: isLerna,
            isYarn: isYarn
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
  protected commandInstall(waitInstallPackageName: string, workspacePackageName?: string, isDev?: boolean) {
    if (this.options.isYarn) {
      const dev = isDev ? ' --dev' : '';

      if (this.options.isWorkspace) {
        if (this.options.isLerna) {
          return execa.commandSync(`lerna add ${waitInstallPackageName} --scope=${workspacePackageName}${dev}`, {
            cwd: this.options.workspacesDir,
            stdio: 'inherit'
          });
        }

        return execa.commandSync(`yarn workspace ${workspacePackageName} add ${waitInstallPackageName}${dev}`, {
          cwd: this.options.workspacesDir,
          stdio: 'inherit'
        });
      }

      if (this.options.isWorkspaces)
        return execa.commandSync(`yarn add ${waitInstallPackageName} -W${dev}`, {
          cwd: this.options.dirName,
          stdio: 'inherit'
        });

      return execa.commandSync(`yarn remove ${waitInstallPackageName}${dev}`, {
        cwd: this.options.dirName,
        stdio: 'inherit'
      });
    } else {
      const dev = isDev ? ' --save-dev' : '';
      const lernaDev = isDev ? '--dev' : '';

      if (this.options.isWorkspace) {
        if (this.options.isLerna) {
          return execa.commandSync(`lerna add ${waitInstallPackageName} --scope=${workspacePackageName}${lernaDev}`, {
            cwd: this.options.workspacesDir,
            stdio: 'inherit'
          });
        }

        return execa.commandSync(`npm install ${waitInstallPackageName} -w ${workspacePackageName}${dev}`, {
          cwd: this.options.workspacesDir,
          stdio: 'inherit'
        });
      }

      if (this.options.isWorkspaces)
        return execa.commandSync(`npm install ${waitInstallPackageName}${dev}`, {
          cwd: this.options.dirName,
          stdio: 'inherit'
        });

      return execa.commandSync(`npm install ${waitInstallPackageName}${dev}`, {
        cwd: this.options.dirName,
        stdio: 'inherit'
      });
    }
  }

  /**
   * 卸载命令
   */
  protected commandUnInstall(waitInstallPackageName: string, workspacePackageName?: string, isDev?: boolean) {
    if (this.options.isYarn) {
      const dev = isDev ? ' --dev' : '';

      if (this.options.isWorkspace)
        return execa.commandSync(`yarn workspace ${workspacePackageName} remove ${waitInstallPackageName}${dev}`, {
          cwd: this.options.workspacesDir,
          stdio: 'inherit'
        });

      if (this.options.isWorkspaces)
        return execa.commandSync(`yarn remove ${waitInstallPackageName} -W${dev}`, {
          cwd: this.options.dirName,
          stdio: 'inherit'
        });

      return execa.commandSync(`yarn remove ${waitInstallPackageName}${dev}`, {
        cwd: this.options.dirName,
        stdio: 'inherit'
      });
    } else {
      const dev = isDev ? ' --save-dev' : '';

      if (this.options.isWorkspace) {
        return execa.commandSync(`npm uninstall ${waitInstallPackageName} -w ${workspacePackageName}${dev}`, {
          cwd: this.options.workspacesDir,
          stdio: 'inherit'
        });
      }

      if (this.options.isWorkspaces)
        return execa.commandSync(`npm uninstall ${waitInstallPackageName}${dev}`, {
          cwd: this.options.dirName,
          stdio: 'inherit'
        });

      return execa.commandSync(`npm uninstall ${waitInstallPackageName}${dev}`, {
        cwd: this.options.dirName,
        stdio: 'inherit'
      });
    }
  }

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

export * from './types';
export * from './types/package';
