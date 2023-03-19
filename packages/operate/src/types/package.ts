import {
  PACKAGE_DEPENDENCIES_FIELD,
  PACKAGE_DESCRIPTION_FIELD,
  PACKAGE_LIFE_CYCLE,
  PACKAGE_NORM_FIELD,
  PACKAGE_PUBLISH_FIELD,
  PACKAGE_REQUIRED_FIELD,
  PACKAGE_SCRIPT_FIELD
} from '../constants/package';

/**
 * 作者
 */
interface Author {
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
}

/**
 * 必需配置
 */
interface RequiredConfig {
  /**
   * 名称
   */
  [PACKAGE_REQUIRED_FIELD.name]: string;
  /**
   * 版本
   */
  [PACKAGE_REQUIRED_FIELD.version]: string;
}

/**
 * 描述配置
 */
interface DescriptionConfig {
  /**
   * 描述
   */
  [PACKAGE_DESCRIPTION_FIELD.description]: string;
  /**
   * 关键词
   */
  [PACKAGE_DESCRIPTION_FIELD.keywords]: string;
  /**
   * 作者
   */
  [PACKAGE_DESCRIPTION_FIELD.author]: string | Author;
  /**
   * 贡献者们
   */
  [PACKAGE_DESCRIPTION_FIELD.contributors]: Array<string | Author>;
  /**
   * 主页
   */
  [PACKAGE_DESCRIPTION_FIELD.homepage]: string;
  /**
   * 仓库
   */
  [PACKAGE_DESCRIPTION_FIELD.repository]: {
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
   * 问题
   */
  [PACKAGE_DESCRIPTION_FIELD.bugs]:
    | string
    | {
        /**
         * 地址
         */
        url: string;
        /**
         * 邮箱
         */
        email: string;
      };
  /**
   * 捐助
   */
  [PACKAGE_DESCRIPTION_FIELD.funding]: {
    /**
     * 类型
     */
    type: 'individual' | 'patreon';
    /**
     * 地址
     */
    url: string;
  };
}

/**
 * 规范配置
 */
interface NormConfig {
  /**
   * 类型
   * @description 定义 `node` 环境下，包规范是 `module` 还是 `commonjs`。
   */
  [PACKAGE_NORM_FIELD.type]: 'module' | 'commonjs';
  /**
   * 包含文件
   * @description 包在发布时包含的文件。
   */
  [PACKAGE_NORM_FIELD.files]: Array<string>;
  /**
   * 入口
   * @description 定义了 `NPM` 包的入口文件，`browser` 环境和 `node` 环境均可使用。
   */
  [PACKAGE_NORM_FIELD.main]: string;
  /**
   * 模块入口
   * @description 定义 `NPM` 包在 `ES Module` 规范的入口文件，`browser` 环境和 `node` 环境均可使用。
   * @tripartite `构建工具`
   */
  [PACKAGE_NORM_FIELD.module]: string;
  /**
   * 类型入口
   * @description 指定 `typescript` 类型入口文件，帮助包提供更好的类型服务。
   * @tripartite `typescript`
   */
  [PACKAGE_NORM_FIELD.types]: string;
  /**
   * 分发入口
   * @description 提供一个给 [UNPKG](https://www.unpkg.com/)，用于支持 CDN 服务。
   * @tripartite `unpkg`
   */
  [PACKAGE_NORM_FIELD.unpkg]: string;
  /**
   * 可执行文件
   * @example {"lough": "./bin/index.js"}
   */
  [PACKAGE_NORM_FIELD.bin]: Record<string, string>;
  /**
   * 工作区
   * @description 描述了本地文件系统中的位置，安装客户端应该查找这些位置，以找到需要用符号链接到顶级 node_modules 文件夹的每个工作空间。
   */
  [PACKAGE_NORM_FIELD.workspaces]: Array<string>;
}

/**
 * 脚本配置
 */
interface ScriptConfig {
  /**
   * 脚本
   * @description 包含在包生命周期的不同时间运行的脚本命令。
   */
  [PACKAGE_SCRIPT_FIELD.scripts]: Partial<{ [K in PACKAGE_LIFE_CYCLE]: string }> & Record<string, string>;
  /**
   * 配置
   * @description 存在一个包含 `npm_package_config_*` 环境变量的启动命令
   */
  [PACKAGE_SCRIPT_FIELD.config]: Record<string, string>;
}

/**
 * 依赖配置
 */
interface DependenciesConfig {
  /**
   * 生产依赖
   */
  [PACKAGE_DEPENDENCIES_FIELD.dependencies]: Record<string, string>;
  /**
   * 开发依赖
   */
  [PACKAGE_DEPENDENCIES_FIELD.devDependencies]: Record<string, string>;
  /**
   * 同等依赖
   */
  [PACKAGE_DEPENDENCIES_FIELD.peerDependencies]: Record<string, string>;
}

/**
 * 发布配置
 */
interface PublishConfig {
  /**
   * 私有的
   * @description 如果你在包中设置了 `true`。那么 NPM 将拒绝发布它。
   * @default false
   */
  [PACKAGE_PUBLISH_FIELD.private]: boolean;
  /**
   * 发布配置
   */
  [PACKAGE_PUBLISH_FIELD.publishConfig]: {
    /**
     * 注册表地址，如：`https://registry.npmjs.org/`
     */
    registry?: string;
    /**
     * 包公开还是受限私有的
     * @default 'restricted'
     */
    access?: 'restricted' | 'public';
  };
  /**
   * 许可证
   */
  [PACKAGE_PUBLISH_FIELD.license]: string;
  /**
   * 操作系统
   */
  [PACKAGE_PUBLISH_FIELD.os]: NodeJS.Platform;
  /**
   * 主机架构
   */
  [PACKAGE_PUBLISH_FIELD.cpu]: NodeJS.Architecture;
  /**
   * 工作环境
   */
  [PACKAGE_PUBLISH_FIELD.engines]: Partial<{ node: string; npm: string }> & Record<string, string>;
}

/**
 * 第三方配置
 */
interface TripartiteConfig {
  ['lint-staged']: Record<string, Array<string>>;
}

/**
 * 包类型
 */
export type IPackage = RequiredConfig &
  Partial<DescriptionConfig> &
  Partial<NormConfig> &
  Partial<ScriptConfig> &
  Partial<DependenciesConfig> &
  Partial<PublishConfig> &
  Partial<TripartiteConfig> &
  Partial<TripartiteConfig>;
