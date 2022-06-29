import { PACKAGE_MANAGE_TOOL } from './constants';

/**
 * npm 操作类参数
 */
export interface INpmParameters {
  /**
   * 根路径
   * @default process.cwd()
   */
  rootPath?: string;
  /**
   * package.json 路径
   * @default 'package.json'
   */
  configPath?: string;
  /**
   * 获取兜底包管理工具
   */
  getEarsPackageManageTool?: (map: typeof PACKAGE_MANAGE_TOOL) => PACKAGE_MANAGE_TOOL;
}
