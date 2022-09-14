import execa from 'execa';
import { Package } from './package';

export class Yarn extends Package {
  protected commandInstall(
    waitInstallPackageName: string,
    workspacePackageName?: string,
    isDev?: boolean
  ): execa.ExecaSyncReturnValue<string> {
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
  }

  protected commandUnInstall(
    waitInstallPackageName: string,
    workspacePackageName?: string,
    isDev?: boolean
  ): execa.ExecaSyncReturnValue<string> {
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
  }
}
