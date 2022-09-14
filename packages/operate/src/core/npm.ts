import execa from 'execa';
import { Package } from './package';

export class Npm extends Package {
  protected commandInstall(
    waitInstallPackageName: string,
    workspacePackageName?: string,
    isDev?: boolean
  ): execa.ExecaSyncReturnValue<string> {
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

  protected commandUnInstall(
    waitInstallPackageName: string,
    workspacePackageName?: string,
    isDev?: boolean
  ): execa.ExecaSyncReturnValue<string> {
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
