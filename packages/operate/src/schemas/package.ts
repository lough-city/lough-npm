import {
  PACKAGE_DEPENDENCIES_FIELD,
  PACKAGE_DESCRIPTION_FIELD,
  PACKAGE_LIFE_CYCLE,
  PACKAGE_NORM_FIELD,
  PACKAGE_PUBLISH_FIELD,
  PACKAGE_REQUIRED_FIELD,
  PACKAGE_SCRIPT_FIELD,
  PACKAGE_NPM_FIELD
} from '../constants/package';

enum SCHEMA_TYPE {
  string = 'string',
  number = 'number',
  boolean = 'boolean',
  object = 'object',
  array = 'array'
}

type SchemaBaseType = SCHEMA_TYPE;
type SchemaType = SchemaBaseType | Array<SchemaBaseType>;

interface BaseSchema {
  /**
   * 类型
   */
  type: SchemaType | SchemaType[];
  /**
   * 标题
   */
  title: string;
  /**
   * 描述
   */
  description: string;
  /**
   * 必需字段
   */
  required?: Array<string>;
  /**
   * 标签
   */
  tags?: Record<string, string>;
}

interface StringSchema extends BaseSchema {
  type: SCHEMA_TYPE.string | SchemaType[];
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

interface NumberSchema extends BaseSchema {
  type: SCHEMA_TYPE.number | SchemaType[];
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

interface BooleanSchema extends BaseSchema {
  type: SCHEMA_TYPE.boolean | SchemaType[];
  /**
   * 默认值
   */
  default?: boolean;
}

interface ObjectSchema extends BaseSchema {
  type: SCHEMA_TYPE.object | SchemaType[];
  /**
   * 对象属性
   */
  properties: Record<string, Schema>;
}

interface ArraySchema extends BaseSchema {
  type: SCHEMA_TYPE.array | SchemaType[];
  /**
   * 数组项
   */
  items: Schema;
}

type Schema = StringSchema | NumberSchema | BooleanSchema | ObjectSchema | ArraySchema;

type inferSchema<T> = T extends []
  ? unknown
  : T extends [infer H, ...infer Rest]
  ? H extends SCHEMA_TYPE.string
    ? StringSchema & inferSchema<Rest>
    : H extends SCHEMA_TYPE.number
    ? NumberSchema & inferSchema<Rest>
    : H extends SCHEMA_TYPE.boolean
    ? BooleanSchema & inferSchema<Rest>
    : H extends SCHEMA_TYPE.object
    ? ObjectSchema & inferSchema<Rest>
    : H extends SCHEMA_TYPE.array
    ? ArraySchema & inferSchema<Rest>
    : unknown
  : T extends SCHEMA_TYPE.string
  ? StringSchema
  : T extends SCHEMA_TYPE.number
  ? NumberSchema
  : T extends SCHEMA_TYPE.boolean
  ? BooleanSchema
  : T extends SCHEMA_TYPE.object
  ? ObjectSchema
  : T extends SCHEMA_TYPE.array
  ? ArraySchema
  : unknown;

const defineSchema = <T extends SCHEMA_TYPE | [SCHEMA_TYPE, ...SCHEMA_TYPE[]]>(
  type: T,
  schema: Omit<inferSchema<T>, 'type'>
) => {
  return { type, ...schema } as inferSchema<T>;
};

/**
 * 包字段规则
 */
export const package_field_schema: {
  [F in keyof typeof PACKAGE_NPM_FIELD]: Schema;
} = {
  /**
   * 名称
   */
  [PACKAGE_REQUIRED_FIELD.name]: defineSchema(SCHEMA_TYPE.string, {
    title: '名称',
    description: '包的名称。',
    range: {
      min: 1,
      max: 214
    },
    pattern: '/^(?:@[a-z0-9-*~][a-z0-9-*._~]*/)?[a-z0-9-~][a-z0-9-._~]*$/'
  }),
  /**
   * 版本
   */
  [PACKAGE_REQUIRED_FIELD.version]: defineSchema(SCHEMA_TYPE.string, {
    title: '版本',
    description: '版本必须可以被 node-semver 解析， node-semver 作为依赖项与 npm 捆绑在一起。'
  }),
  /**
   * 描述
   */
  [PACKAGE_DESCRIPTION_FIELD.description]: defineSchema(SCHEMA_TYPE.string, {
    title: '描述',
    description: '这有助于人们发现你的包，因为它列在 `npm search` 中。'
  }),
  /**
   * 关键词
   */
  [PACKAGE_DESCRIPTION_FIELD.keywords]: defineSchema(SCHEMA_TYPE.string, {
    title: '关键词',
    description: '这有助于人们发现你的包，因为它列在 `npm search` 中。'
  }),
  /**
   * 作者
   */
  [PACKAGE_DESCRIPTION_FIELD.author]: defineSchema([SCHEMA_TYPE.string, SCHEMA_TYPE.object], {
    title: '作者',
    description: '参与创建或维护此包的人员。',
    required: ['name'],
    properties: {
      name: defineSchema(SCHEMA_TYPE.string, { title: '名称', description: '作者名称。' }),
      url: defineSchema(SCHEMA_TYPE.string, { title: '主页', description: '作者主页地址。', format: 'uri' }),
      email: defineSchema(SCHEMA_TYPE.string, { title: '邮箱', description: '作者邮箱地址。', format: 'email' })
    }
  }),
  /**
   * 贡献者们
   */
  [PACKAGE_DESCRIPTION_FIELD.contributors]: defineSchema(SCHEMA_TYPE.array, {
    title: '贡献者们',
    description: '这是为这个计划出力的人的名单。',
    items: defineSchema([SCHEMA_TYPE.string, SCHEMA_TYPE.object], {
      title: '作者',
      description: '参与创建或维护此包的人员。',
      required: [],
      properties: {
        name: defineSchema(SCHEMA_TYPE.string, { title: '名称', description: '作者名称。' }),
        url: defineSchema(SCHEMA_TYPE.string, { title: '主页', description: '作者主页地址。', format: 'uri' }),
        email: defineSchema(SCHEMA_TYPE.string, { title: '邮箱', description: '作者邮箱地址。', format: 'email' })
      }
    })
  }),
  /**
   * 主页
   */
  [PACKAGE_DESCRIPTION_FIELD.homepage]: defineSchema(SCHEMA_TYPE.string, {
    title: '主页',
    description: '项目主页的 url。'
  }),
  /**
   * 仓库
   */
  [PACKAGE_DESCRIPTION_FIELD.repository]: defineSchema(SCHEMA_TYPE.object, {
    title: '仓库',
    description: '指定代码所在的位置。这对想要捐款的人很有帮助。',
    properties: {
      type: defineSchema(SCHEMA_TYPE.string, { title: '类型', description: '仓库类型。' }),
      url: defineSchema(SCHEMA_TYPE.string, { title: '地址', description: '仓库地址。' }),
      directory: defineSchema(SCHEMA_TYPE.string, { title: '目录', description: '仓库目录。' })
    }
  }),
  /**
   * 问题
   */
  [PACKAGE_DESCRIPTION_FIELD.bugs]: defineSchema([SCHEMA_TYPE.string, SCHEMA_TYPE.object], {
    title: '问题',
    description: '项目问题跟踪器的url和/或应报告问题的电子邮件地址。这对于遇到包问题的人很有帮助。',
    properties: {
      url: defineSchema(SCHEMA_TYPE.string, { title: '地址', description: '项目问题跟踪器的url。', format: 'uri' }),
      email: defineSchema(SCHEMA_TYPE.string, {
        title: '邮箱',
        description: '问题应报告到的电子邮件地址。',
        format: 'email'
      })
    }
  }),
  /**
   * 捐助
   */
  [PACKAGE_DESCRIPTION_FIELD.funding]: defineSchema(SCHEMA_TYPE.object, {
    title: '捐助',
    description: '说明如何资助该项目。',
    properties: {
      type: defineSchema(SCHEMA_TYPE.string, {
        title: '类型',
        description: '个人还是平台。',
        enum: ['individual', 'patreon']
      }),
      url: defineSchema(SCHEMA_TYPE.string, {
        title: '地址',
        description: '捐助地址。'
      })
    }
  }),
  /**
   * 类型
   */
  [PACKAGE_NORM_FIELD.type]: defineSchema(SCHEMA_TYPE.string, {
    title: '类型',
    description: '定义 `node` 环境下，包规范是 `module` 还是 `commonjs`。',
    enum: ['commonjs', 'module'],
    default: 'commonjs'
  }),
  /**
   * 包含文件
   * @description 包在发布时包含的文件。
   */
  [PACKAGE_NORM_FIELD.files]: defineSchema(SCHEMA_TYPE.array, {
    title: '包含文件',
    description: '包在发布时包含的文件。',
    items: defineSchema(SCHEMA_TYPE.string, {
      title: '文件',
      description: '包含的文件。'
    })
  }),
  /**
   * 入口
   */
  [PACKAGE_NORM_FIELD.main]: defineSchema(SCHEMA_TYPE.string, {
    title: '入口',
    description: '定义了 `NPM` 包的入口文件，`browser` 环境和 `node` 环境均可使用。'
  }),
  /**
   * 模块入口
   */
  [PACKAGE_NORM_FIELD.module]: defineSchema(SCHEMA_TYPE.string, {
    title: '模块入口',
    description: '定义 `NPM` 包在 `ES Module` 规范的入口文件，`browser` 环境和 `node` 环境均可使用。',
    tags: {
      tripartite: '构建工具'
    }
  }),
  /**
   * 类型入口
   */
  [PACKAGE_NORM_FIELD.types]: defineSchema(SCHEMA_TYPE.string, {
    title: '类型入口',
    description: '指定 `typescript` 类型入口文件，帮助包提供更好的类型服务。',
    tags: {
      tripartite: 'typescript'
    }
  }),
  /**
   * 分发入口
   */
  [PACKAGE_NORM_FIELD.unpkg]: defineSchema(SCHEMA_TYPE.string, {
    title: '分发入口',
    description: '提供一个给 [UNPKG](https://www.unpkg.com/)，用于支持 CDN 服务。',
    tags: {
      tripartite: 'unpkg'
    }
  }),
  /**
   * 可执行文件
   */
  [PACKAGE_NORM_FIELD.bin]: defineSchema(SCHEMA_TYPE.object, {
    title: '可执行文件',
    description: '指定可执行文件入口。',
    properties: {
      string: defineSchema(SCHEMA_TYPE.string, {
        title: '可执行文件路径',
        description: '可执行文件路径'
      })
    }
  }),
  /**
   * 工作区
   */
  [PACKAGE_NORM_FIELD.workspaces]: defineSchema(SCHEMA_TYPE.string, {
    title: '工作区',
    description:
      '允许一个目录内的包使用本地文件的直接链接相互依赖。此外，在可能的情况下，工作空间内的依赖关系被提升到工作空间根目录，以减少重复。'
  }),
  /**
   * 脚本
   */
  [PACKAGE_SCRIPT_FIELD.scripts]: defineSchema(SCHEMA_TYPE.object, {
    title: '脚本',
    description: '包含在包生命周期的不同时间运行的脚本命令。',
    properties: {
      [PACKAGE_LIFE_CYCLE.prepare]: defineSchema(SCHEMA_TYPE.string, {
        title: '准备好前',
        description:
          '在包打包和发布之前运行，在本地 `npm install` 上运行，不带任何参数。这是在预发布之后运行，但在预发布之前。'
      }),
      [PACKAGE_LIFE_CYCLE.prepublish]: defineSchema(SCHEMA_TYPE.string, {
        title: '发布前',
        description: '在包发布之前运行(也可以在不带任何参数的本地 `npm install` 上运行)。'
      }),
      [PACKAGE_LIFE_CYCLE.prepublishOnly]: defineSchema(SCHEMA_TYPE.string, {
        title: '只是发布前',
        description: '在包准备和打包之前运行，只在 `NPM` 发布时运行。'
      }),
      [PACKAGE_LIFE_CYCLE.prepack]: defineSchema(SCHEMA_TYPE.string, {
        title: '打包前',
        description: '在 `tarball` 被打包之前运行(在npm pack, npm publish和安装git依赖项时)。'
      }),
      [PACKAGE_LIFE_CYCLE.postpack]: defineSchema(SCHEMA_TYPE.string, {
        title: '打包后',
        description: '在生成 `tarball` 并将其移动到最终目的地后运行。'
      }),
      string: defineSchema(SCHEMA_TYPE.string, {
        title: '脚本命令',
        description: '自定义的脚本命令。'
      })
    }
  }),
  /**
   * 配置
   */
  [PACKAGE_SCRIPT_FIELD.config]: defineSchema(SCHEMA_TYPE.object, {
    title: '配置',
    description: '存在一个包含 `npm_package_config_*` 环境变量的启动命令',
    properties: {
      string: defineSchema(SCHEMA_TYPE.string, {
        title: '环境变量',
        description: '附带环境变量项。'
      })
    }
  }),
  /**
   * 生产依赖
   */
  [PACKAGE_DEPENDENCIES_FIELD.dependencies]: defineSchema(SCHEMA_TYPE.object, {
    title: '生产依赖',
    description:
      '生产依赖，默认被打包到项目中。请不要将测试工具、编译器或其他 **开发** 时工具放在 `dependencies` 对象中，应该放在 `devDependencies` 中。',
    properties: {
      string: defineSchema(SCHEMA_TYPE.string, {
        title: '依赖项',
        description:
          '依赖项由包名到版本范围的简单散列指定。版本范围是一个字符串，它有一个或多个空格分隔的描述符。依赖关系也可以用 `tarball` 或 `Git URL` 来标识。'
      })
    }
  }),
  /**
   * 开发依赖
   */
  [PACKAGE_DEPENDENCIES_FIELD.devDependencies]: defineSchema(SCHEMA_TYPE.object, {
    title: '开发依赖',
    description: '开发依赖，不会被打包到项目中。',
    properties: {
      string: defineSchema(SCHEMA_TYPE.string, {
        title: '依赖项',
        description:
          '依赖项由包名到版本范围的简单散列指定。版本范围是一个字符串，它有一个或多个空格分隔的描述符。依赖关系也可以用 `tarball` 或 `Git URL` 来标识。'
      })
    }
  }),
  /**
   * 同等依赖
   */
  [PACKAGE_DEPENDENCIES_FIELD.peerDependencies]: defineSchema(SCHEMA_TYPE.object, {
    title: '同等依赖',
    description: '用于指定当前包（也就是你写的包）兼容的宿主版本。',
    properties: {
      string: defineSchema(SCHEMA_TYPE.string, {
        title: '依赖项',
        description:
          '依赖项由包名到版本范围的简单散列指定。版本范围是一个字符串，它有一个或多个空格分隔的描述符。依赖关系也可以用 `tarball` 或 `Git URL` 来标识。'
      })
    }
  }),
  /**
   * 私有的
   */
  [PACKAGE_PUBLISH_FIELD.private]: defineSchema(SCHEMA_TYPE.boolean, {
    title: '私有的',
    description: '如果你在包中设置了 `true`。那么 NPM 将拒绝发布它。',
    default: false
  }),
  /**
   * 发布配置
   */
  [PACKAGE_PUBLISH_FIELD.publishConfig]: defineSchema(SCHEMA_TYPE.object, {
    title: '发布配置',
    description: '如果你在包中设置了 `true`，那么 NPM 将拒绝发布它。',
    properties: {
      access: defineSchema(SCHEMA_TYPE.string, {
        title: '作用域',
        description: '表明包发布后是公开还是受限的。',
        enum: ['public', 'restricted']
      }),
      registry: defineSchema(SCHEMA_TYPE.string, {
        title: '注册表',
        description: '表示发布到的注册表地址',
        format: 'uri'
      })
    }
  }),
  /**
   * 许可证
   */
  [PACKAGE_PUBLISH_FIELD.license]: defineSchema(SCHEMA_TYPE.string, {
    title: '许可证',
    description: '您应该为您的包指定一个许可证，以便人们知道如何允许他们使用它，以及您对它施加的任何限制。'
  }),
  /**
   * 操作系统
   */
  [PACKAGE_PUBLISH_FIELD.os]: defineSchema(SCHEMA_TYPE.array, {
    title: '操作系统',
    description: '指定模块将运行在哪些操作系统上。',
    items: defineSchema(SCHEMA_TYPE.string, {
      title: 'os',
      description: '指定系统。',
      enum: ['aix', 'android', 'darwin', 'freebsd', 'haiku', 'linux', 'openbsd', 'sunos', 'win32', 'cygwin', 'netbsd']
    })
  }),
  /**
   * 主机架构
   */
  [PACKAGE_PUBLISH_FIELD.cpu]: defineSchema(SCHEMA_TYPE.array, {
    title: '主机架构',
    description: '指定你的代码只在特定的 `cpu` 架构上运行。',
    items: defineSchema(SCHEMA_TYPE.string, {
      title: '架构',
      description: '指定架构。',
      enum: ['arm', 'arm64', 'ia32', 'mips', 'mipsel', 'ppc', 'ppc64', 's390', 's390x', 'x64']
    })
  }),
  /**
   * 工作环境
   */
  [PACKAGE_PUBLISH_FIELD.engines]: defineSchema(SCHEMA_TYPE.object, {
    title: '工作环境',
    description: '指定运行代码需要依赖哪些工作环境。',
    properties: {
      node: defineSchema(SCHEMA_TYPE.string, {
        title: 'Node',
        description: '指定 `Node` 版本。'
      }),
      npm: defineSchema(SCHEMA_TYPE.string, {
        title: 'NPM',
        description: '指定 `NPM` 版本。'
      }),
      string: defineSchema(SCHEMA_TYPE.string, {
        title: '环境',
        description: '指定环境版本。'
      })
    }
  })
};

/**
 * 包规则
 */
export const package_schema: ObjectSchema = {
  type: SCHEMA_TYPE.object,
  title: 'NPM',
  description: '`NPM` 包管理规则。',
  required: Object.keys(PACKAGE_REQUIRED_FIELD),
  properties: package_field_schema
};
