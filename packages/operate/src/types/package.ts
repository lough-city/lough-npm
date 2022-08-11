import { NPM_LIFE_CYCLE } from '../constants/package';

export interface Package {
  /**
   * 名称
   */
  name: string;
  /**
   * 版本
   */
  version: string;
  /**
   * 描述
   */
  description: string;
  /**
   * 关键词
   */
  keywords: string;
  /**
   * 主页
   */
  homepage: string;
  /**
   * 问题
   */
  bugs: string;
  /**
   * 许可证
   */
  license: string;
  /**
   * 作者
   */
  author: string;
  /**
   * 贡献者们
   */
  contributors: {
    /**
     * 名称
     */
    name: string;
    /**
     * 邮箱
     */
    email: string;
    /**
     * 主页
     */
    url: string;
  };
  /**
   * 捐助
   */
  funding: {
    /**
     * 类型
     */
    type: 'individual' | 'patreon';
    /**
     * 地址
     */
    url: string;
  };
  /**
   * 包含文件
   * @description 包在发布时包含的文件。
   */
  files: Array<string>;
  /**
   * 入口
   */
  main: string;
  /**
   * browser 浏览器入口
   * @description 定义 npm 包在 browser 环境下的入口文件。
   */
  browser: string;
  /**
   * 可执行文件
   * @example {"lough": "./bin/index.js"}
   */
  bin: Record<string, string>;
  /**
   * 规范目录
   * @example {"lib": "src/lib/"}
   */
  directories: Record<string, string>;
  /**
   * 仓库
   */
  repository: {
    /**
     * 类型
     * @example "git"
     */
    type: string;
    /**
     * 地址
     */
    url: string;
    /**
     * 目录
     * @example "packages/cli"
     * @description 如果 `package.json`，不在仓库根目录中(例如，如果它是 `monorepo` 的一部分)，你可以指定它所在的目录:
     */
    directory?: string;
  };
  /**
   * 脚本
   */
  scripts: Partial<{ [K in NPM_LIFE_CYCLE]: string }> & Record<string, string>;
  /**
   * 配置
   * @description 存在一个包含 `npm_package_config_*` 环境变量的 `start` 命令
   */
  config: Record<string, any>;
  /**
   * 依赖
   */
  dependencies: Record<string, string>;
  /**
   * 开发依赖
   */
  devDependencies: Record<string, string>;
  /**
   * 重写依赖关系
   */
  overrides: Record<string, any>;
  /**
   * 工作环境
   */
  engines: Partial<{ node: string; npm: string }> & Record<string, string>;
  /**
   * 操作系统
   */
  os: NodeJS.Platform;
  /**
   * 主机架构
   */
  cpu: NodeJS.Architecture;
  /**
   * 私有的
   * @description 如果你在包中设置了 `true`。那么 NPM 将拒绝发布它。
   */
  private: boolean;
  /**
   * 发布配置
   */
  publishConfig: Record<string, any>;
  /**
   * 工作区
   */
  workspaces: Array<string>;
}
