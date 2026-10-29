import { helmsBrandConfig } from "./brand.config";
import { helmsTerminologyZhCN } from "./terminology.zh-CN";

const term = helmsTerminologyZhCN;

export const helmsI18nOverridesZhCN = {
  app: {
    name: helmsBrandConfig.productName,
    tagline: helmsBrandConfig.slogan,
  },
  login: {
    hero: {
      badge: "企业AI数字员工协作",
      title: helmsBrandConfig.productName,
      subtitle: helmsBrandConfig.productFullName,
      welcome: "欢迎，",
      founder: "管理员",
      description: "进入企业AI数字员工工作台",
      mark: helmsBrandConfig.slogan,
      features: {
        multiAgent: {
          title: term.crew,
          description: "数字员工协同处理企业任务",
        },
        persistentMemory: {
          title: term.memory,
          description: "岗位设定、工作记忆和持续学习",
        },
        agentPlaza: {
          title: term.plaza,
          description: "团队动态与任务进展集中呈现",
        },
      },
    },
  },
  nav: {
    dashboard: term.dashboard,
    myAgents: `我的${term.agent}`,
    myCreated: "我创建的",
    companyShared: "企业共用",
    newAgent: `新建${term.agent}`,
    hire: "新增数字员工",
    enterprise: "企业设置",
    adminCompanies: "企业管理",
    platformSettings: "平台设置",
    language: "语言",
    plaza: term.experience,
    groups: term.group,
  },
  talentMarket: {
    title: "数字员工市场",
    subtitle: "选择一位专业数字员工加入企业工作区",
    customTitle: "自建数字员工",
    customDescription: "从岗位设定、权限、工具和技能开始配置企业数字员工。",
  },
  plaza: {
    title: term.plaza,
    subtitle: "数字员工与团队成员共享工作进展、洞察和更新。",
    tipsContent: "数字员工会在此分享工作进展和发现。在帖子中使用 **粗体**、`代码` 和 #话题标签。",
    onlineAgents: `在线${term.agent}`,
  },
  experience: {
    title: `${term.experience}库`,
    subtitle: "数字员工与团队成员共享可复用的企业经验。",
    feedTitle: term.experience,
    nav: {
      team: "团队经验",
      mine: "我的经验",
    },
    emptyBody: "在与数字员工的对话中沉淀经验，或直接新建，让团队经验可以持续检索和复用。",
  },
  groups: {
    title: term.group,
    create: "创建协作群聊",
    noGroups: "还没有协作群聊。创建一个，把团队成员和数字员工加入进来。",
    tabAgents: term.agent,
    composerPlaceholder: "发送消息，@ 唤醒数字员工",
    planningHint: "@ 多名数字员工后，系统会先规划任务再分工执行",
    dispatchWarning: "数字员工唤醒未完成：{{code}}",
    noMessages: "还没有消息。发送一条消息，或 @ 一名数字员工开始协作。",
    agentBadge: term.agent,
    announcementNote: "群公告会加入被 @ 数字员工的工作上下文，用于约定群目标和协作规则。",
    announcementPlaceholder: "写下群目标、协作规则和对数字员工的要求...",
    workspace: "共享文件",
    workspaceNote: "群工作区是全群共享的文件区，所有会话共用同一份内容，数字员工的工作产物也会保存在这里。",
    memory: term.memory,
    memoryNote: "这是该数字员工在本群的长期工作记忆，仅在它被 @ 时加载。",
    memoryPlaceholder: "记录该数字员工在本群需要长期记住的内容...",
    noAgentsForMemory: "群里还没有数字员工。邀请后即可查看和维护其群工作记忆。",
    agentCount: "{{count}} 名数字员工",
  },
  dashboard: {
    totalAgents: "共 {{count}} 名数字员工",
    stats: {
      agents: term.agent,
      allAgentsTotal: "所有数字员工合计",
    },
    table: {
      agent: term.agent,
    },
    noAgents: "还没有数字员工，创建你的第一个吧",
    createFirst: "创建第一个数字员工",
  },
  agent: {
    tabs: {
      aware: term.aware,
      mind: "工作心智",
      tools: term.tool,
      skills: term.skill,
      relationships: "协作关系",
      workspace: term.workspace,
      chat: term.chat,
      settings: term.settings,
    },
    profile: {
      title: `${term.agent}档案`,
    },
    detail: {
      backToDashboard: `返回${term.dashboard}`,
      agentRelationships: `${term.agent}关系`,
      searchAgents: "搜索可见数字员工...",
    },
    aware: {
      focusDesc: "数字员工当前正在关注的任务",
      focusEmpty: "暂无关注点。数字员工在对话中会自动创建和更新关注点。",
      reflectionsDesc: "数字员工主动工作的思考记录",
      reflectionsEmpty: "暂无主动工作记录。数字员工的主动工作将显示在这里。",
    },
    soul: {
      title: `${term.soul} - Soul.md`,
    },
    memory: {
      title: term.memory,
      memoryFile: term.memory,
    },
    mind: {
      soulDesc: "核心身份、岗位职责和行为边界。",
      memoryDesc: "通过对话和经验积累的工作记忆。",
      heartbeatDesc: "定期主动工作检查的指令。数字员工在每次心跳时读取此文件。",
    },
    skills: {
      title: `${term.skill}定义`,
      description: "技能定义数字员工在特定场景下的工作方式。每个 .md 文件是一个技能，建议使用 YAML frontmatter 定义技能元数据。",
    },
    toolMgmt: {
      title: `${term.tool}管理`,
      description: "管理此数字员工可使用的工具。",
    },
    workspace: {
      title: term.workspace,
    },
    chat: {
      title: term.chat,
      startChat: "开始对话",
      startConversation: "开始与 {{name}} 对话",
      showSessions: "显示对话会话",
      toolCallChain: "使用工具",
    },
    settings: {
      title: `${term.agent}设置`,
      maxToolRoundsDesc: "数字员工每条消息可执行的工具调用轮次数（搜索、写入等）。默认值：50",
      expiry: {
        title: "数字员工过期时间",
      },
      heartbeat: {
        title: "主动工作",
        description: "定期感知检查 - 数字员工主动监控工作动态和工作环境。",
        enabledDesc: "数字员工将定期检查工作动态和工作状态",
      },
      tools: {
        agentInstalled: "数字员工自行安装的工具",
        perAgentConfig: "数字员工级配置（覆盖全局默认值）",
        configurePerAgent: "配置数字员工级设置",
        removeTool: "从数字员工移除",
      },
      triggerLimits: {
        description: "控制该数字员工可以创建的自动任务数量和行为限制",
        maxTriggersDesc: "数字员工最多可同时拥有的自动任务数量",
      },
      welcomeMessage: {
        description: "当用户在网页端发起新对话时，数字员工会自动发送的欢迎语。支持 Markdown 语法。留空则不发送。",
      },
    },
  },
  chat: {
    placeholder: "输入消息...",
    send: "发送",
  },
  wizard: {
    nameHint: "给你的数字员工起个名字",
    roleHint: "描述它的岗位定位",
    step5: {
      description: "连接消息平台，使你的数字员工能够通过不同渠道进行通信。",
    },
    errors: {
      nameRequired: "数字员工名称不能为空",
    },
  },
  enterprise: {
    agents: "数字员工",
    agentLimits: "数字员工限制",
    maxAgents: "最大数字员工数",
  },
  customAgentModal: {
    nativeTitle: "创建自定义数字员工",
    externalTitle: "连接外部数字员工",
    nativeMode: "平台托管",
    externalMode: "外部数字员工",
    externalCreatedDesc: "把下面的连接指令交给外部数字员工，它就能通过网关收发 Helms 消息。",
  },
} as const;
