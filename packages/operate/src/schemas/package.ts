import {
  PACKAGE_DEPENDENCIES_FIELD,
  PACKAGE_DESCRIPTION_FIELD,
  PACKAGE_FIELD,
  PACKAGE_LIFE_CYCLE,
  PACKAGE_NORM_FIELD,
  PACKAGE_PUBLISH_FIELD,
  PACKAGE_REQUIRED_FIELD,
  PACKAGE_SCRIPT_FIELD
} from '../constants/package';

/**
 * 规则类型
 */
export enum RULE_TYPE {
  /**
   * 字符
   */
  string = 'string',
  /**
   * 数值
   */
  number = 'number',
  /**
   * 布尔
   */
  boolean = 'boolean',
  /**
   * 对象
   */
  object = 'object',
  /**
   * 数组
   */
  array = 'array'
}

/**
 * 字符规则
 */
interface StringRule {
  /**
   * 类型
   */
  type: RULE_TYPE.string;
  /**
   * 范围
   */
  range?: {
    /**
     * 最小
     */
    min?: number;
    /**
     * 最大
     */
    max?: number;
  };
  /**
   * 校验正则
   */
  pattern?: string;
  /**
   * 格式规则
   */
  format?: 'email' | 'uri' | 'phone';
  /**
   * 枚举
   */
  enum?: Array<string>;
  /**
   * 默认值
   */
  default?: string;
}

/**
 * 数值规则
 */
interface NumberRule {
  /**
   * 类型
   */
  type: RULE_TYPE.number;
  /**
   * 范围
   */
  range?: {
    /**
     * 最小
     */
    min?: number;
    /**
     * 最大
     */
    max?: number;
  };
  /**
   * 枚举
   */
  enum?: Array<number>;
  /**
   * 默认值
   */
  default?: string;
}

/**
 * 布尔规则
 */
interface BooleanRule {
  /**
   * 类型
   */
  type: RULE_TYPE.boolean;
  /**
   * 默认值
   */
  default?: boolean;
}

/**
 * 数组规则
 */
interface ArrayRule {
  /**
   * 类型
   */
  type: RULE_TYPE.array;
  /**
   * 数组项
   */
  items: Array<
    Omit<DataSchema, 'rules'> & {
      /**
       * 规则
       */
      rule: DataRule;
    }
  >;
}

/**
 * 对象规则
 */
export interface ObjectRule<K extends string | number | symbol = string> {
  /**
   * 类型
   */
  type: RULE_TYPE.object;
  /**
   * 对象属性
   */
  properties: Record<K, DataSchema>;
  /**
   * 必需字段
   */
  required?: Array<K>;
}

/**
 * 数据规则
 */
type DataRule = StringRule | NumberRule | BooleanRule | ObjectRule | ArrayRule;

/**
 * 数据格式
 */
export interface DataSchema {
  /**
   * 标题
   */
  title: string;
  /**
   * 描述
   */
  description: string;
  /**
   * 标签
   */
  tags?: Record<string, string>;
  /**
   * 规则列表
   */
  rules: Array<DataRule>;
}

/**
 * 包对象规则
 */
export const package_field_schema: ObjectRule<keyof typeof PACKAGE_FIELD> = {
  type: RULE_TYPE.object,
  required: Object.values(PACKAGE_REQUIRED_FIELD),
  properties: {
    /**
     * 名称
     */
    [PACKAGE_REQUIRED_FIELD.name]: {
      title: '名称',
      description: '包的名称。',
      rules: [
        {
          type: RULE_TYPE.string,
          range: {
            min: 1,
            max: 214
          },
          pattern: '/^(?:@[a-z0-9-*~][a-z0-9-*._~]*/)?[a-z0-9-~][a-z0-9-._~]*$/'
        }
      ]
    },
    /**
     * 版本
     */
    [PACKAGE_REQUIRED_FIELD.version]: {
      title: '版本',
      description: '版本必须可以被 node-semver 解析， node-semver 作为依赖项与 npm 捆绑在一起。',
      rules: [{ type: RULE_TYPE.string }]
    },
    /**
     * 描述
     */
    [PACKAGE_DESCRIPTION_FIELD.description]: {
      title: '描述',
      description: '这有助于人们发现你的包，因为它列在 `npm search` 中。',
      rules: [{ type: RULE_TYPE.string }]
    },
    /**
     * 关键词
     */
    [PACKAGE_DESCRIPTION_FIELD.keywords]: {
      title: '关键词',
      description: '这有助于人们发现你的包，因为它列在 `npm search` 中。',
      rules: [{ type: RULE_TYPE.string }]
    },
    /**
     * 作者
     */
    [PACKAGE_DESCRIPTION_FIELD.author]: {
      title: '作者',
      description: '参与创建或维护此包的人员。',
      rules: [
        { type: RULE_TYPE.string },
        {
          type: RULE_TYPE.object,
          required: ['name'],
          properties: {
            name: {
              title: '名称',
              description: '作者名称。',
              rules: [{ type: RULE_TYPE.string }]
            },
            url: {
              title: '主页',
              description: '作者主页地址。',
              rules: [{ type: RULE_TYPE.string, format: 'uri' }]
            },
            email: {
              title: '邮箱',
              description: '作者邮箱地址。',
              rules: [{ type: RULE_TYPE.string, format: 'email' }]
            }
          }
        }
      ]
    },
    /**
     * 贡献者们
     */
    [PACKAGE_DESCRIPTION_FIELD.contributors]: {
      title: '贡献者们',
      description: '这是为这个计划出力的人的名单。',
      rules: [
        {
          type: RULE_TYPE.array,
          items: [
            {
              title: '作者',
              description: '参与创建或维护此包的人员。',
              rule: { type: RULE_TYPE.string }
            },
            {
              title: '作者',
              description: '参与创建或维护此包的人员。',
              rule: {
                type: RULE_TYPE.object,
                required: ['name'],
                properties: {
                  name: {
                    title: '名称',
                    description: '作者名称。',
                    rules: [{ type: RULE_TYPE.string }]
                  },
                  url: {
                    title: '主页',
                    description: '作者主页地址。',
                    rules: [{ type: RULE_TYPE.string, format: 'uri' }]
                  },
                  email: {
                    title: '邮箱',
                    description: '作者邮箱地址。',
                    rules: [{ type: RULE_TYPE.string, format: 'email' }]
                  }
                }
              }
            }
          ]
        }
      ]
    },
    /**
     * 主页
     */
    [PACKAGE_DESCRIPTION_FIELD.homepage]: {
      title: '主页',
      description: '项目主页的 url。',
      rules: [{ type: RULE_TYPE.string }]
    },
    /**
     * 仓库
     */
    [PACKAGE_DESCRIPTION_FIELD.repository]: {
      title: '仓库',
      description: '指定代码所在的位置。这对想要捐款的人很有帮助。',
      rules: [
        {
          type: RULE_TYPE.object,
          properties: {
            type: {
              title: '类型',
              description: '仓库类型。',
              rules: [{ type: RULE_TYPE.string }]
            },
            url: {
              title: '地址',
              description: '仓库地址。',
              rules: [{ type: RULE_TYPE.string }]
            },
            directory: {
              title: '目录',
              description: '仓库目录。',
              rules: [{ type: RULE_TYPE.string }]
            }
          }
        }
      ]
    },
    /**
     * 问题
     */
    [PACKAGE_DESCRIPTION_FIELD.bugs]: {
      title: '问题',
      description: '项目问题跟踪器的url和/或应报告问题的电子邮件地址。这对于遇到包问题的人很有帮助。',
      rules: [
        { type: RULE_TYPE.string },
        {
          type: RULE_TYPE.object,
          properties: {
            url: {
              title: '地址',
              description: '项目问题跟踪器的url。',
              rules: [
                {
                  type: RULE_TYPE.string,
                  format: 'uri'
                }
              ]
            },
            email: {
              title: '邮箱',
              description: '问题应报告到的电子邮件地址。',
              rules: [
                {
                  type: RULE_TYPE.string,
                  format: 'email'
                }
              ]
            }
          }
        }
      ]
    },
    /**
     * 捐助
     */
    [PACKAGE_DESCRIPTION_FIELD.funding]: {
      title: '捐助',
      description: '说明如何资助该项目。',
      rules: [
        {
          type: RULE_TYPE.object,
          properties: {
            type: {
              title: '类型',
              description: '个人还是平台。',
              rules: [
                {
                  type: RULE_TYPE.string,
                  enum: ['individual', 'patreon']
                }
              ]
            },
            url: {
              title: '地址',
              description: '捐助地址。',
              rules: [{ type: RULE_TYPE.string }]
            }
          }
        }
      ]
    },
    /**
     * 类型
     */
    [PACKAGE_NORM_FIELD.type]: {
      title: '类型',
      description: '定义 `node` 环境下，包规范是 `module` 还是 `commonjs`。',
      rules: [
        {
          type: RULE_TYPE.string,
          enum: ['commonjs', 'module'],
          default: 'commonjs'
        }
      ]
    },
    /**
     * 包含文件
     * @description 包在发布时包含的文件。
     */
    [PACKAGE_NORM_FIELD.files]: {
      title: '包含文件',
      description: '包在发布时包含的文件。',
      rules: [
        {
          type: RULE_TYPE.array,
          items: [
            {
              title: '文件',
              description: '包含的文件。',
              rule: {
                type: RULE_TYPE.string
              }
            }
          ]
        }
      ]
    },
    /**
     * 入口
     */
    [PACKAGE_NORM_FIELD.main]: {
      title: '入口',
      description: '定义了 `NPM` 包的入口文件，`browser` 环境和 `node` 环境均可使用。',
      rules: [{ type: RULE_TYPE.string }]
    },
    /**
     * 模块入口
     */
    [PACKAGE_NORM_FIELD.module]: {
      title: '模块入口',
      description: '定义 `NPM` 包在 `ES Module` 规范的入口文件，`browser` 环境和 `node` 环境均可使用。',
      tags: {
        tripartite: '构建工具'
      },
      rules: [{ type: RULE_TYPE.string }]
    },
    /**
     * 类型入口
     */
    [PACKAGE_NORM_FIELD.types]: {
      title: '类型入口',
      description: '指定 `typescript` 类型入口文件，帮助包提供更好的类型服务。',
      tags: {
        tripartite: 'typescript'
      },
      rules: [{ type: RULE_TYPE.string }]
    },
    /**
     * 分发入口
     */
    [PACKAGE_NORM_FIELD.unpkg]: {
      title: '分发入口',
      description: '提供一个给 [UNPKG](https://www.unpkg.com/)，用于支持 CDN 服务。',
      tags: {
        tripartite: 'unpkg'
      },
      rules: [{ type: RULE_TYPE.string }]
    },
    /**
     * 可执行文件
     */
    [PACKAGE_NORM_FIELD.bin]: {
      title: '可执行文件',
      description: '指定可执行文件入口。',
      rules: [
        {
          type: RULE_TYPE.object,
          properties: {
            '*': {
              title: '可执行文件路径',
              description: '可执行文件路径',
              rules: [{ type: RULE_TYPE.string }]
            }
          }
        }
      ]
    },
    /**
     * 工作区
     */
    [PACKAGE_NORM_FIELD.workspaces]: {
      title: '工作区',
      description:
        '允许一个目录内的包使用本地文件的直接链接相互依赖。此外，在可能的情况下，工作空间内的依赖关系被提升到工作空间根目录，以减少重复。',
      rules: [
        {
          type: RULE_TYPE.array,
          items: [
            {
              title: '路径',
              description: '基于根目录的工作区目录。',
              rule: {
                type: RULE_TYPE.string
              }
            }
          ]
        }
      ]
    },
    /**
     * 脚本
     */
    [PACKAGE_SCRIPT_FIELD.scripts]: {
      title: '脚本',
      description: '包含在包生命周期的不同时间运行的脚本命令。',
      rules: [
        {
          type: RULE_TYPE.object,
          properties: {
            [PACKAGE_LIFE_CYCLE.prepare]: {
              title: '准备好前',
              description:
                '在包打包和发布之前运行，在本地 `npm install` 上运行，不带任何参数。这是在预发布之后运行，但在预发布之前。',
              rules: [{ type: RULE_TYPE.string }]
            },
            [PACKAGE_LIFE_CYCLE.prepublish]: {
              title: '发布前',
              description: '在包发布之前运行(也可以在不带任何参数的本地 `npm install` 上运行)。',
              rules: [{ type: RULE_TYPE.string }]
            },
            [PACKAGE_LIFE_CYCLE.prepublishOnly]: {
              title: '只是发布前',
              description: '在包准备和打包之前运行，只在 `NPM` 发布时运行。',
              rules: [{ type: RULE_TYPE.string }]
            },
            [PACKAGE_LIFE_CYCLE.prepack]: {
              title: '打包前',
              description: '在 `tarball` 被打包之前运行(在npm pack, npm publish和安装git依赖项时)。',
              rules: [{ type: RULE_TYPE.string }]
            },
            [PACKAGE_LIFE_CYCLE.postpack]: {
              title: '打包后',
              description: '在生成 `tarball` 并将其移动到最终目的地后运行。',
              rules: [{ type: RULE_TYPE.string }]
            },
            '*': {
              title: '脚本命令',
              description: '自定义的脚本命令。',
              rules: [{ type: RULE_TYPE.string }]
            }
          }
        }
      ]
    },
    /**
     * 配置
     */
    [PACKAGE_SCRIPT_FIELD.config]: {
      title: '配置',
      description: '存在一个包含 `npm_package_config_*` 环境变量的启动命令。',
      rules: [
        {
          type: RULE_TYPE.object,
          properties: {
            '*': {
              title: '环境变量',
              description: '附带环境变量项。',
              rules: [
                {
                  type: RULE_TYPE.string
                }
              ]
            }
          }
        }
      ]
    },
    /**
     * 生产依赖
     */
    [PACKAGE_DEPENDENCIES_FIELD.dependencies]: {
      title: '生产依赖',
      description:
        '生产依赖，默认被打包到项目中。请不要将测试工具、编译器或其他 **开发** 时工具放在 `dependencies` 对象中，应该放在 `devDependencies` 中。',
      rules: [
        {
          type: RULE_TYPE.object,
          properties: {
            '*': {
              title: '依赖项',
              description:
                '依赖项由包名到版本范围的简单散列指定。版本范围是一个字符串，它有一个或多个空格分隔的描述符。依赖关系也可以用 `tarball` 或 `Git URL` 来标识。',
              rules: [{ type: RULE_TYPE.string }]
            }
          }
        }
      ]
    },
    /**
     * 开发依赖
     */
    [PACKAGE_DEPENDENCIES_FIELD.devDependencies]: {
      title: '开发依赖',
      description: '开发依赖，不会被打包到项目中。',
      rules: [
        {
          type: RULE_TYPE.object,
          properties: {
            '*': {
              title: '依赖项',
              description:
                '依赖项由包名到版本范围的简单散列指定。版本范围是一个字符串，它有一个或多个空格分隔的描述符。依赖关系也可以用 `tarball` 或 `Git URL` 来标识。',
              rules: [{ type: RULE_TYPE.string }]
            }
          }
        }
      ]
    },
    /**
     * 同等依赖
     */
    [PACKAGE_DEPENDENCIES_FIELD.peerDependencies]: {
      title: '同等依赖',
      description: '用于指定当前包（也就是你写的包）兼容的宿主版本。',
      rules: [
        {
          type: RULE_TYPE.object,
          properties: {
            '*': {
              title: '依赖项',
              description:
                '依赖项由包名到版本范围的简单散列指定。版本范围是一个字符串，它有一个或多个空格分隔的描述符。依赖关系也可以用 `tarball` 或 `Git URL` 来标识。',
              rules: [{ type: RULE_TYPE.string }]
            }
          }
        }
      ]
    },
    /**
     * 私有的
     */
    [PACKAGE_PUBLISH_FIELD.private]: {
      title: '私有的',
      description: '如果你在包中设置了 `true`。那么 NPM 将拒绝发布它。',
      rules: [
        {
          type: RULE_TYPE.boolean,
          default: false
        }
      ]
    },
    /**
     * 发布配置
     */
    [PACKAGE_PUBLISH_FIELD.publishConfig]: {
      title: '发布配置',
      description: '如果你在包中设置了 `true`，那么 NPM 将拒绝发布它。',
      rules: [
        {
          type: RULE_TYPE.object,
          properties: {
            access: {
              title: '作用域',
              description: '表明包发布后是公开还是受限的。',
              rules: [
                {
                  type: RULE_TYPE.string,
                  enum: ['public', 'restricted']
                }
              ]
            },
            registry: {
              title: '注册表',
              description: '表示发布到的注册表地址',
              rules: [
                {
                  type: RULE_TYPE.string,
                  format: 'uri'
                }
              ]
            }
          }
        }
      ]
    },
    /**
     * 许可证
     */
    [PACKAGE_PUBLISH_FIELD.license]: {
      title: '许可证',
      description: '您应该为您的包指定一个许可证，以便人们知道如何允许他们使用它，以及您对它施加的任何限制。',
      rules: [{ type: RULE_TYPE.string }]
    },
    /**
     * 操作系统
     */
    [PACKAGE_PUBLISH_FIELD.os]: {
      title: '操作系统',
      description: '指定模块将运行在哪些操作系统上。',
      rules: [
        {
          type: RULE_TYPE.array,
          items: [
            {
              title: 'os',
              description: '指定系统。',
              rule: {
                type: RULE_TYPE.string,
                enum: [
                  'aix',
                  'android',
                  'darwin',
                  'freebsd',
                  'haiku',
                  'linux',
                  'openbsd',
                  'sunos',
                  'win32',
                  'cygwin',
                  'netbsd'
                ]
              }
            }
          ]
        }
      ]
    },
    /**
     * 主机架构
     */
    [PACKAGE_PUBLISH_FIELD.cpu]: {
      title: '主机架构',
      description: '指定你的代码只在特定的 `cpu` 架构上运行。',
      rules: [
        {
          type: RULE_TYPE.array,
          items: [
            {
              title: '架构',
              description: '指定架构。',
              rule: {
                type: RULE_TYPE.string,
                enum: ['arm', 'arm64', 'ia32', 'mips', 'mipsel', 'ppc', 'ppc64', 's390', 's390x', 'x64']
              }
            }
          ]
        }
      ]
    },
    /**
     * 工作环境
     */
    [PACKAGE_PUBLISH_FIELD.engines]: {
      title: '工作环境',
      description: '指定运行代码需要依赖哪些工作环境。',
      rules: [
        {
          type: RULE_TYPE.object,
          properties: {
            node: {
              title: 'Node',
              description: '指定 `Node` 版本。',
              rules: [{ type: RULE_TYPE.string }]
            },
            npm: {
              title: 'NPM',
              description: '指定 `NPM` 版本。',
              rules: [{ type: RULE_TYPE.string }]
            },
            '*': {
              title: '环境',
              description: '指定环境版本。',
              rules: [{ type: RULE_TYPE.string }]
            }
          }
        }
      ]
    }
  }
};

/**
 * 包规则
 */
export const package_schema: DataSchema = {
  title: 'NPM',
  description: '`NPM` 包管理规则。',
  rules: [package_field_schema]
};
