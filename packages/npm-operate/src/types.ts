import { PACKAGE_MANAGE_TOOL } from './constants';

/**
 * 子包数据
 */
export interface ISubPackage {
  /**
   * 名称
   */
  name: string;
  /**
   * 目录名称
   */
  dirName: string;
  /**
   * 相对主包目录
   */
  relativeDir: string;
  /**
   * 相对主包路径
   */
  relativePath: string;
  /**
   * 绝对路径
   */
  absolutePath: string;
  /**
   * 子包 package.json 路径
   */
  configPath: string;
  /**
   * 子包配置
   */
  config: Record<string, any>;
}

/**
 * Lerna Config
 */
export interface ILernaConfig {
  packagesPath: string;
}

/**
 * npm 操作类参数
 */
export interface INpmParameters {
  /**
   * 项目根路径
   * @default process.cwd()
   */
  rootPath?: string;
  /**
   * 包 package.json 路径
   * @default 'package.json'
   */
  configPath?: string;
  /**
   * 获取兜底包管理工具
   * TODO: 异步处理
   */
  getEarsPackageManageTool?: (map: typeof PACKAGE_MANAGE_TOOL) => PACKAGE_MANAGE_TOOL;
}
