# @lough/npm-operate

> lough git operate.



## Usage

1. 安装

   ```bash
   npm i @lough/git-operate
   ```

2. 使用

   ```javascript
   import { Package } from "@lough/npm-operate"
   
   const npm = new Package();
   ```



## API

```typescript
/**
 * Package 类参数
 */
export interface IPackageParameters {
  /**
   * 目录名称
   * @default process.cwd()
   */
  dirName?: string;
  /**
   * 配置文件名称
   * @default 'package.json'
   */
  configFileName?: string;
  /**
   * 是否工作空间
   * @description 默认判断 `dirName` 下 `package.json` `workspaces` 属性
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
   * @description 默认判断 `dirName` 下 `lerna.json`
   */
  isLerna?: boolean;
  /**
   * 是否 Yarn
   * @description 默认判断 `dirName` 下 `yarn.lock`
   */
  isYarn?: boolean;
}
```

