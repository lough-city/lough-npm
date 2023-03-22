/**
 * 包生命周期
 */
export enum PACKAGE_LIFE_CYCLE {
  /**
   * 准备好前
   */
  prepare = 'prepare',
  /**
   * 发布前
   */
  prepublish = 'prepublish',
  /**
   * 只是发布前
   */
  prepublishOnly = 'prepublishOnly',
  /**
   * 打包前
   */
  prepack = 'prepack',
  /**
   * 打包后
   */
  postpack = 'postpack'
}

/**
 * 包必需字段
 */
export enum PACKAGE_REQUIRED_FIELD {
  /**
   * 名称
   */
  name = 'name',
  /**
   * 版本
   */
  version = 'version'
}

/**
 * 包描述字段
 */
export enum PACKAGE_DESCRIPTION_FIELD {
  /**
   * 描述
   */
  description = 'description',
  /**
   * 关键词
   */
  keywords = 'keywords',
  /**
   * 作者
   */
  author = 'author',
  /**
   * 贡献者们
   */
  contributors = 'contributors',
  /**
   * 主页
   */
  homepage = 'homepage',
  /**
   * 仓库
   */
  repository = 'repository',
  /**
   * 问题
   */
  bugs = 'bugs',
  /**
   * 捐助
   */
  funding = 'funding'
}

/**
 * 包规范字段
 */
export enum PACKAGE_NORM_FIELD {
  /**
   * 类型
   */
  type = 'type',
  /**
   * 包含文件
   */
  files = 'files',
  /**
   * 入口
   */
  main = 'main',
  /**
   * 模块入口
   */
  module = 'module',
  /**
   * 类型入口
   */
  types = 'types',
  /**
   * 分发入口
   */
  unpkg = 'unpkg',
  /**
   * 可执行文件
   */
  bin = 'bin',
  /**
   * 工作区
   */
  workspaces = 'workspaces'
}

/**
 * 包脚本字段
 */
export enum PACKAGE_SCRIPT_FIELD {
  /**
   * 脚本
   */
  scripts = 'scripts',
  /**
   * 配置
   */
  config = 'config'
}

/**
 * 包依赖字段
 */
export enum PACKAGE_DEPENDENCIES_FIELD {
  /**
   * 生产依赖
   */
  dependencies = 'dependencies',
  /**
   * 开发依赖
   */
  devDependencies = 'devDependencies',
  /**
   * 同等依赖
   */
  peerDependencies = 'peerDependencies'
}

/**
 * 包发布字段
 */
export enum PACKAGE_PUBLISH_FIELD {
  /**
   * 私有的
   */
  private = 'private',
  /**
   * 发布配置
   */
  publishConfig = 'publishConfig',
  /**
   * 许可证
   */
  license = 'license',
  /**
   * 操作系统
   */
  os = 'os',
  /**
   * 主机架构
   */
  cpu = 'cpu',
  /**
   * 工作环境
   */
  engines = 'engines'
}

/**
 * 包字段
 */
export const PACKAGE_FIELD = {
  ...PACKAGE_REQUIRED_FIELD,
  ...PACKAGE_DESCRIPTION_FIELD,
  ...PACKAGE_NORM_FIELD,
  ...PACKAGE_SCRIPT_FIELD,
  ...PACKAGE_DEPENDENCIES_FIELD,
  ...PACKAGE_PUBLISH_FIELD
};
