export enum NPM_LIFE_CYCLE {
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
  postpack = 'postpack',
  /**
   * 依赖改变
   */
  dependencies = 'dependencies'
}
