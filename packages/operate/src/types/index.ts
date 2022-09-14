import { PACKAGE_MANAGE_TOOL } from '../constants';
import { IPackage } from './package';

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
   * 绝对目录
   */
  absolutePath: string;
  /**
   * 子包 package.json 绝对路径
   */
  absoluteConfigPath: string;
  /**
   * 子包配置
   */
  config: IPackage;
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
