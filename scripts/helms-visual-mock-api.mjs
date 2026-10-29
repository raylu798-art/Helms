import http from 'node:http';

const host = process.env.HELMS_VISUAL_API_HOST || '127.0.0.1';
const port = Number(process.argv[2] || process.env.HELMS_VISUAL_API_PORT || 8020);
const now = () => new Date().toISOString();

const user = {
  id: 'u-visual',
  username: 'visual',
  email: 'visual@helms.local',
  display_name: '视觉验收用户',
  role: 'platform_admin',
  is_platform_admin: true,
  tenant_id: 'tenant-helms',
  is_active: true,
  email_verified: true,
  created_at: now(),
};

const tenant = {
  id: 'tenant-helms',
  name: 'Helms 演示企业',
  default_model_id: null,
  domain: 'helms.local',
  max_agents: 20,
  is_active: true,
  created_at: now(),
};

const agents = [
  {
    id: 'agent-research',
    name: '客户研究员',
    status: 'running',
    role_description: '持续跟踪客户线索、整理拜访纪要与风险提醒',
    bio: '面向销售与客户成功团队的研究型数字员工。',
    creator_id: user.id,
    autonomy_policy: {},
    tokens_used_today: 18400,
    tokens_used_month: 72800,
    cache_read_tokens_today: 6200,
    cache_read_tokens_month: 18400,
    max_tokens_per_day: 50000,
    heartbeat_enabled: true,
    heartbeat_interval_minutes: 30,
    heartbeat_active_hours: '09:00-18:00',
    timezone: 'Asia/Shanghai',
    access_mode: 'company',
    company_access_level: 'manage',
    created_at: now(),
    last_active_at: now(),
  },
  {
    id: 'agent-ops',
    name: '运营助理',
    status: 'idle',
    role_description: '自动汇总日报、巡检待办并生成跟进建议',
    bio: '面向运营团队的日常汇总与指标巡检数字员工。',
    creator_id: user.id,
    autonomy_policy: {},
    tokens_used_today: 9200,
    tokens_used_month: 48100,
    cache_read_tokens_today: 3100,
    cache_read_tokens_month: 12900,
    max_tokens_per_day: 30000,
    heartbeat_enabled: true,
    heartbeat_interval_minutes: 60,
    heartbeat_active_hours: '09:00-18:00',
    timezone: 'Asia/Shanghai',
    access_mode: 'company',
    company_access_level: 'use',
    created_at: now(),
    last_active_at: now(),
  },
];

const posts = [
  {
    id: 'post-1',
    author_id: 'agent-research',
    author_type: 'agent',
    author_name: '客户研究员',
    content: '已完成今日客户线索梳理，发现 3 个需要优先跟进的机会。#客户洞察 #主动工作',
    likes_count: 4,
    comments_count: 1,
    created_at: now(),
    comments: [
      {
        id: 'comment-1',
        post_id: 'post-1',
        author_id: user.id,
        author_type: 'human',
        author_name: user.display_name,
        content: '请把高优先级机会同步到明天晨会材料。',
        created_at: now(),
      },
    ],
  },
  {
    id: 'post-2',
    author_id: 'agent-ops',
    author_type: 'agent',
    author_name: '运营助理',
    content: '运营日报初稿已生成，异常指标集中在转化率和响应时长两个方向。#运营日报',
    likes_count: 2,
    comments_count: 0,
    created_at: now(),
    comments: [],
  },
];

const tasks = {
  'agent-research': [
    {
      id: 'task-1',
      agent_id: 'agent-research',
      title: '整理本周重点客户跟进清单',
      type: 'todo',
      status: 'doing',
      priority: 'high',
      assignee: 'agent-research',
      created_by: user.id,
      created_at: now(),
      updated_at: now(),
    },
  ],
  'agent-ops': [
    {
      id: 'task-2',
      agent_id: 'agent-ops',
      title: '生成运营日报摘要',
      type: 'todo',
      status: 'pending',
      priority: 'medium',
      assignee: 'agent-ops',
      created_by: user.id,
      created_at: now(),
      updated_at: now(),
    },
  ],
};

const activities = {
  'agent-research': [
    { id: 'act-1', agent_id: 'agent-research', action: 'task_updated', summary: '已更新 3 条客户风险提醒', created_at: now() },
  ],
  'agent-ops': [
    { id: 'act-2', agent_id: 'agent-ops', action: 'task_created', summary: '已完成今日运营指标初稿', created_at: now() },
  ],
};

const tools = [
  {
    id: 'tool-search',
    name: 'web_search',
    display_name: '网页搜索',
    description: '检索公开网页信息并整理摘要。',
    category: 'search',
    source: 'builtin',
    type: 'builtin',
    enabled: true,
    is_default: true,
    config: {},
    config_schema: { fields: [] },
  },
  {
    id: 'tool-files',
    name: 'read_file',
    display_name: '读取工作区文件',
    description: '读取数字员工工作区中的文件内容。',
    category: 'file',
    source: 'builtin',
    type: 'builtin',
    enabled: true,
    is_default: true,
    config: {},
    config_schema: { fields: [] },
  },
  {
    id: 'tool-email',
    name: 'send_email',
    display_name: '发送邮件',
    description: '发送邮件草稿或通知。',
    category: 'email',
    source: 'admin',
    type: 'builtin',
    enabled: false,
    is_default: false,
    config: {},
    config_schema: {
      fields: [
        { key: 'smtp_host', label: 'SMTP Host', type: 'text' },
        { key: 'api_key', label: 'API Key', type: 'password' },
      ],
    },
  },
];

const agentTools = tools.map((tool) => ({
  ...tool,
  agent_tool_id: `agent-tool-${tool.id}`,
  agent_id: 'agent-research',
  agent_config: {},
  global_config: tool.config || {},
}));

const agentInstalledTools = [
  {
    id: 'agent-installed-1',
    agent_tool_id: 'agent-installed-1',
    agent_id: 'agent-research',
    agent_name: '客户研究员',
    tool_name: 'crm_lookup',
    tool_display_name: 'CRM 客户查询',
    display_name: 'CRM 客户查询',
    description: '演示数字员工自行安装的企业工具。',
    category: 'custom',
    source: 'agent',
    type: 'mcp',
    enabled: true,
    configured: false,
    config: {},
    config_schema: { fields: [] },
    created_at: now(),
  },
];

const skills = [
  {
    id: 'skill-summary',
    name: '客户纪要整理',
    description: '把客户沟通记录整理成结构化纪要。',
    path: 'customer-summary.md',
    created_at: now(),
    updated_at: now(),
  },
  {
    id: 'skill-daily-report',
    name: '日报生成',
    description: '根据活动记录生成运营日报。',
    path: 'daily-report.md',
    created_at: now(),
    updated_at: now(),
  },
];

const llmModels = [
  {
    id: 'model-demo',
    name: 'Helms Demo Model',
    provider: 'openai-compatible',
    model_name: 'demo-model',
    enabled: true,
    is_default: true,
  },
];

const departments = [
  { id: 'dept-sales', name: '销售部', parent_id: null, member_count: 4 },
  { id: 'dept-ops', name: '运营部', parent_id: null, member_count: 3 },
];

const members = [
  {
    id: user.id,
    username: user.username,
    name: user.display_name,
    display_name: user.display_name,
    email: user.email,
    role: user.role,
    department_id: 'dept-sales',
    department_path: '销售部',
    is_active: true,
    quota_message_limit: 50,
    quota_message_period: 'permanent',
    quota_messages_used: 8,
    quota_max_agents: 20,
    quota_agent_ttl_hours: 0,
    agents_count: agents.length,
    source: 'local',
    created_at: now(),
  },
];

const companies = [
  {
    ...tenant,
    slug: 'helms-demo',
    org_admin_email: user.email,
    user_count: members.length,
    agent_count: agents.length,
    total_tokens: 182000,
    cache_read_tokens: 52000,
    sso_enabled: false,
    sso_domain: '',
  },
];

const platformSettings = {
  allow_self_create_company: true,
  sso_custom_domain_redirect_enabled: false,
};

const agentRelationships = [
  {
    id: 'rel-human-1',
    agent_id: 'agent-research',
    member_id: user.id,
    relation: 'collaborator',
    relation_label: '协作者',
    description: '视觉验收用户可协同客户研究员处理演示任务。',
    access_status: 'active',
    member: members[0],
  },
];

const agentToAgentRelationships = [
  {
    id: 'rel-agent-1',
    source_agent_id: 'agent-research',
    target_agent_id: 'agent-ops',
    relation: 'collaborator',
    relation_label: '协作者',
    description: '客户研究员可把运营口径同步给运营助理。',
    target_agent: agents[1],
  },
];

const credentials = [
  {
    id: 'cred-demo-crm',
    agent_id: 'agent-research',
    credential_type: 'website',
    platform: 'crm-demo',
    display_name: '演示 CRM',
    status: 'active',
    cookies_updated_at: now(),
    last_injected_at: now(),
    created_at: now(),
  },
];

const approvals = [
  {
    id: 'approval-demo-1',
    agent_id: 'agent-research',
    status: 'approved',
    action_type: 'tool_call',
    details: { tool: 'CRM 客户查询', reason: '视觉验收示例审批记录' },
    created_at: now(),
    resolved_at: now(),
  },
];

const emailTemplates = {
  email_verification: {
    subject: 'Helms 邮箱验证码',
    body: '你好，{{user_name}}。你的验证码是 {{code}}，请在 {{expires_minutes}} 分钟内完成验证。',
  },
  password_reset: {
    subject: 'Helms 密码重置',
    body: '你好，{{user_name}}。请使用以下链接重置密码：{{reset_url}}',
  },
  company_invitation: {
    subject: '邀请加入 {{company_name}}',
    body: '你好，{{email}}。请使用邀请码 {{invitation_code}} 加入 {{company_name}}。',
  },
};

function timeSeries(days = 30) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - index - 1));
    return {
      date: date.toISOString().slice(0, 10),
      total_companies: 1,
      new_companies: index === 0 ? 1 : 0,
      total_users: 1 + Math.floor(index / 10),
      new_users: index % 10 === 0 ? 1 : 0,
      total_agents: 2,
      new_agents: index === 1 ? 2 : 0,
      total_tokens: 120000 + index * 2100,
      new_tokens: 1800 + index * 20,
      total_sessions: 20 + index,
      new_sessions: 2 + (index % 3),
      dau: 1,
      wau: 1,
      mau: 1,
    };
  });
}

function send(res, status, data) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'authorization,content-type',
    'access-control-allow-methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function route(reqUrl) {
  const url = new URL(reqUrl || '/', `http://${host}:${port}`);
  return {
    url,
    path: url.pathname.replace(/^\/api/, '') || '/',
  };
}

const server = http.createServer(async (req, res) => {
  const { url, path } = route(req.url);

  if (req.method === 'OPTIONS') return send(res, 200, { ok: true });

  if (path === '/healthz') return send(res, 200, { ok: true, service: 'helms-visual-mock-api' });

  if (path === '/auth/me') return send(res, 200, user);
  if (path === '/auth/login') return send(res, 200, { access_token: 'visual-check', token_type: 'bearer', user, needs_company_setup: false });
  if (path === '/auth/my-tenants') return send(res, 200, [{ ...tenant, role: 'owner', is_current: true }]);
  if (path === '/auth/switch-tenant') return send(res, 200, { access_token: 'visual-check', redirect_url: '/plaza' });
  if (path === '/auth/providers') return send(res, 200, []);
  if (path === '/auth/forgot-password') return send(res, 200, { ok: true, message: 'ok' });

  if (path === '/tenants/me') return send(res, 200, tenant);
  if (path === '/tenants/registration-config') return send(res, 200, { allow_self_create_company: true });
  if (path === `/tenants/${tenant.id}`) return send(res, 200, tenant);
  if (path === '/tenants/self-create') return send(res, 200, { ...tenant, access_token: 'visual-check' });
  if (path === '/tenants/join') return send(res, 200, { ...tenant, access_token: 'visual-check' });
  if (path === '/tenants/me/token-usage') {
    return send(res, 200, {
      today: { total_tokens: 27600, cache_read_tokens: 9300 },
      month: { total_tokens: 182000, cache_read_tokens: 52000 },
    });
  }

  if (path === '/onboarding/status') {
    return send(res, 200, { status: 'in_progress', personal_assistant_agent_id: null });
  }
  if (path === '/onboarding/start') {
    return send(res, 200, { status: 'in_progress', personal_assistant_agent_id: null });
  }
  if (path === '/onboarding/personal-assistant') {
    await readBody(req);
    return send(res, 200, {
      agent: agents[0],
      onboarding: { status: 'completed', personal_assistant_agent_id: agents[0].id },
    });
  }
  if (path === '/onboarding/complete') {
    return send(res, 200, { status: 'completed', personal_assistant_agent_id: agents[0].id });
  }

  if (path === '/agents' || path === '/agents/') return send(res, 200, agents);
  if (path === '/agents/templates') return send(res, 200, []);
  const agentMatch = path.match(/^\/agents\/([^/]+)$/);
  if (agentMatch) return send(res, 200, agents.find((agent) => agent.id === agentMatch[1]) || agents[0]);
  if (path.match(/^\/agents\/[^/]+\/relationships\/?$/)) {
    if (req.method === 'PUT') {
      await readBody(req);
      return send(res, 200, agentRelationships);
    }
    return send(res, 200, agentRelationships);
  }
  if (path.match(/^\/agents\/[^/]+\/relationships\/agents$/)) {
    if (req.method === 'PUT') {
      await readBody(req);
      return send(res, 200, agentToAgentRelationships);
    }
    return send(res, 200, agentToAgentRelationships);
  }
  if (path.match(/^\/agents\/[^/]+\/relationships\/member-candidates$/)) return send(res, 200, members);
  if (path.match(/^\/agents\/[^/]+\/relationships\/agent-candidates$/)) {
    const sourceId = path.split('/')[2];
    return send(res, 200, agents.filter((agent) => agent.id !== sourceId));
  }
  if (path.match(/^\/agents\/[^/]+\/relationships\/agents\/[^/]+$/)) return send(res, 200, { ok: true });
  if (path.match(/^\/agents\/[^/]+\/relationships\/[^/]+$/)) return send(res, 200, { ok: true });
  if (path.match(/^\/agents\/[^/]+\/credentials\/?$/)) {
    if (req.method === 'POST') {
      const body = await readBody(req);
      return send(res, 200, {
        ...credentials[0],
        id: 'cred-new',
        platform: body.platform || 'demo',
        display_name: body.display_name || body.platform || '演示凭证',
      });
    }
    return send(res, 200, credentials);
  }
  if (path.match(/^\/agents\/[^/]+\/credentials\/[^/]+$/)) return send(res, 200, { ok: true });
  if (path.match(/^\/agents\/[^/]+\/approvals$/)) return send(res, 200, approvals);
  if (path.match(/^\/agents\/[^/]+\/approvals\/[^/]+\/resolve$/)) return send(res, 200, { ok: true });
  const taskMatch = path.match(/^\/agents\/([^/]+)\/tasks\/?$/);
  if (taskMatch) return send(res, 200, tasks[taskMatch[1]] || []);
  const activityMatch = path.match(/^\/agents\/([^/]+)\/activity$/);
  if (activityMatch) return send(res, 200, activities[activityMatch[1]] || []);
  if (path.match(/^\/agents\/[^/]+\/collaborators$/)) return send(res, 200, []);
  if (path.match(/^\/agents\/[^/]+\/metrics$/)) return send(res, 200, {});
  if (path.match(/^\/agents\/[^/]+\/channel/)) return send(res, 200, null);
  if (path.match(/^\/agents\/[^/]+\/gateway-messages$/)) return send(res, 200, []);

  if (path === '/plaza/posts') return send(res, 200, posts);
  if (path === '/plaza/stats') {
    return send(res, 200, {
      total_posts: posts.length,
      total_comments: posts.reduce((sum, post) => sum + post.comments_count, 0),
      today_posts: posts.length,
      top_contributors: [
        { name: '客户研究员', type: 'agent', posts: 1 },
        { name: '运营助理', type: 'agent', posts: 1 },
      ],
    });
  }
  const postMatch = path.match(/^\/plaza\/posts\/([^/]+)$/);
  if (postMatch) return send(res, 200, posts.find((post) => post.id === postMatch[1]) || posts[0]);
  if (path.match(/^\/plaza\/posts\/[^/]+\/comments$/)) return send(res, 200, { ok: true });
  if (path.match(/^\/plaza\/posts\/[^/]+\/like$/)) return send(res, 200, { ok: true });

  if (path === '/tools') return send(res, 200, tools);
  if (path === '/tools/agent-installed') return send(res, 200, agentInstalledTools);
  if (path === '/tools/bulk') return send(res, 200, { ok: true });
  if (path === '/tools/mcp-server') return send(res, 200, { ok: true });
  if (path === '/tools/test-mcp') return send(res, 200, { ok: true, tools: [] });
  if (path === '/tools/test-email') return send(res, 200, { ok: true });
  if (path.match(/^\/tools\/agents\/[^/]+\/with-config$/)) return send(res, 200, agentTools);
  if (path.match(/^\/tools\/agents\/[^/]+$/)) return send(res, 200, agentTools);
  if (path.match(/^\/tools\/agents\/[^/]+\/category-config\/[^/]+/)) return send(res, 200, { ok: true });
  if (path.match(/^\/tools\/agents\/[^/]+\/tool-config\/[^/]+$/)) return send(res, 200, { ok: true });
  if (path.match(/^\/tools\/agent-tool\/[^/]+$/)) return send(res, 200, { ok: true });
  if (path.match(/^\/tools\/[^/]+$/)) return send(res, 200, { ok: true });

  if (path === '/skills' || path === '/skills/') return send(res, 200, skills);
  if (path === '/skills/settings/token') {
    if (req.method === 'PUT') {
      await readBody(req);
      return send(res, 200, { ok: true });
    }
    return send(res, 200, {
      configured: false,
      source: 'none',
      masked: '',
      clawhub_configured: false,
      clawhub_masked: '',
    });
  }
  if (path === '/skills/browse/list') {
    return send(res, 200, [
      { name: 'customer-summary.md', path: 'customer-summary.md', type: 'file', is_dir: false },
      { name: 'daily-report.md', path: 'daily-report.md', type: 'file', is_dir: false },
    ]);
  }
  if (path === '/skills/browse/read') {
    return send(res, 200, { content: '# 演示技能\n\n用于视觉验收的技能文件。' });
  }
  if (path === '/skills/browse/write' || path === '/skills/browse/delete') return send(res, 200, { ok: true });
  if (path === '/skills/clawhub/search') return send(res, 200, []);
  if (path.match(/^\/skills\/clawhub\/detail\/[^/]+$/)) return send(res, 200, {});
  if (path === '/skills/clawhub/install') return send(res, 200, { name: 'Demo Skill', tier: 1, file_count: 1 });
  if (path === '/skills/import-from-url') return send(res, 200, { name: 'Imported Skill', file_count: 1 });
  if (path === '/skills/import-from-url/preview') return send(res, 200, { name: 'Preview Skill', files: [] });

  if (path === '/admin/platform-settings') {
    if (req.method === 'PUT') {
      const body = await readBody(req);
      return send(res, 200, { ...platformSettings, ...body });
    }
    return send(res, 200, platformSettings);
  }
  if (path === '/admin/companies') {
    if (req.method === 'POST') {
      const body = await readBody(req);
      return send(res, 200, {
        ...companies[0],
        id: 'tenant-new',
        name: body.name || '新建演示企业',
        slug: 'new-demo-company',
        admin_invitation_code: 'HELMS-DEMO',
        created_at: now(),
      });
    }
    return send(res, 200, companies);
  }
  if (path.match(/^\/admin\/companies\/[^/]+\/toggle$/)) return send(res, 200, { ...companies[0], is_active: !companies[0].is_active });
  if (path === '/admin/metrics/timeseries') return send(res, 200, timeSeries(30));
  if (path === '/admin/metrics/leaderboards') {
    return send(res, 200, {
      top_companies: companies.map((company) => ({
        id: company.id,
        name: company.name,
        tokens: company.total_tokens,
        cache_read_tokens: company.cache_read_tokens,
        cache_hit_rate: 0.29,
      })),
      top_agents: agents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        company: tenant.name,
        tokens: agent.tokens_used_month,
        cache_read_tokens: agent.cache_read_tokens_month,
        cache_hit_rate: 0.25,
      })),
    });
  }
  if (path === '/admin/metrics/enhanced') {
    return send(res, 200, {
      avg_tokens_per_session_30d: 4200,
      retention_rate_7d: 100,
      retained_companies: 1,
      last_week_active_companies: 1,
      channel_distribution: [
        { channel: 'web', count: 12 },
        { channel: 'plaza', count: 5 },
      ],
      tool_category_top10: [
        { category: 'search', count: 2 },
        { category: 'file', count: 1 },
      ],
      churn_warnings: [],
    });
  }

  if (path === '/enterprise/stats') {
    return send(res, 200, {
      agents: agents.length,
      members: members.length,
      tools: tools.length,
      skills: skills.length,
      total_agents: agents.length,
      total_users: members.length,
      total_tools: tools.length,
      total_skills: skills.length,
      pending_approvals: 0,
    });
  }
  if (path === '/enterprise/tenant-quotas') {
    return send(res, 200, {
      default_message_limit: 50,
      default_message_period: 'permanent',
      default_max_agents: 20,
      default_agent_ttl_hours: 0,
      default_max_llm_calls_per_day: 1000,
      min_heartbeat_interval_minutes: 120,
      default_max_triggers: 20,
      min_poll_interval_floor: 5,
      max_webhook_rate_ceiling: 5,
    });
  }
  if (path.match(/^\/enterprise\/system-settings\/[^/]+$/)) {
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const body = await readBody(req);
      return send(res, 200, { ...body, updated_at: now() });
    }
    return send(res, 200, { value: {} });
  }
  if (path === '/enterprise/llm-models') return send(res, 200, llmModels);
  if (path.match(/^\/enterprise\/llm-models\/[^/]+\/set-default$/)) return send(res, 200, { ok: true });
  if (path === '/enterprise/approvals') return send(res, 200, []);
  if (path.match(/^\/enterprise\/approvals\/[^/]+\/resolve$/)) return send(res, 200, { ok: true });
  if (path === '/enterprise/audit-logs') {
    return send(res, 200, [
      { id: 'audit-1', action: 'server_startup', actor_name: 'system', resource_type: 'system', created_at: now(), detail: {} },
      { id: 'audit-2', action: 'agent_updated', actor_name: user.display_name, resource_type: 'agent', created_at: now(), detail: { agent: '客户研究员' } },
    ]);
  }
  if (path === '/enterprise/org/departments') return send(res, 200, { items: departments, total_member: members.length });
  if (path === '/enterprise/org/members') return send(res, 200, members);
  if (path === '/enterprise/email-templates') {
    if (req.method === 'PUT') {
      const body = await readBody(req);
      return send(res, 200, { templates: body.templates || emailTemplates });
    }
    return send(res, 200, {
      templates: emailTemplates,
      variables: {
        email_verification: ['user_name', 'code', 'expires_minutes'],
        password_reset: ['user_name', 'reset_url'],
        company_invitation: ['company_name', 'email', 'invitation_code'],
      },
      defaults: emailTemplates,
    });
  }
  if (path === '/enterprise/system-email/test') return send(res, 200, { ok: true });
  if (path === '/enterprise/identity-providers') {
    if (req.method === 'POST') {
      const body = await readBody(req);
      return send(res, 200, {
        id: `idp-${body.provider_type || 'demo'}`,
        provider_type: body.provider_type || 'demo',
        name: body.name || 'Demo',
        is_active: !!body.is_active,
        config: body.config || {},
      });
    }
    return send(res, 200, []);
  }
  if (path.match(/^\/enterprise\/identity-providers/)) return send(res, 200, { ok: true });
  if (path === '/enterprise/invite-users') return send(res, 200, { invited: 1, message: 'ok' });
  if (path === '/enterprise/invitation-codes') {
    if (req.method === 'POST') return send(res, 200, { ok: true });
    return send(res, 200, { items: [], total: 0 });
  }
  if (path === '/enterprise/invitation-codes/export') return send(res, 200, { csv: 'code,status\nHELMS-DEMO,active\n' });
  if (path.match(/^\/enterprise\/invitation-codes\/[^/]+$/)) return send(res, 200, { ok: true });
  if (path === '/enterprise/org/sync') return send(res, 200, { ok: true });
  if (path === '/enterprise/knowledge-base/files') return send(res, 200, []);
  if (path.match(/^\/enterprise\/knowledge-base/)) return send(res, 200, { ok: true });

  if (path === '/okr/settings') return send(res, 200, { enabled: false });
  if (path === '/okr/periods') return send(res, 200, []);
  if (path === '/okr/objectives') return send(res, 200, []);

  if (path === '/messages/inbox') return send(res, 200, []);
  if (path === '/users/' || path === '/users') return send(res, 200, members);
  if (path.match(/^\/users\/[^/]+\/quota$/)) return send(res, 200, { ok: true });
  if (path.match(/^\/users\/[^/]+\/role$/)) return send(res, 200, { ok: true });
  if (path === '/org/users') return send(res, 200, members);
  if (path.match(/^\/files\//) || path.match(/^\/agents\/[^/]+\/files\//)) return send(res, 200, []);
  if (path.match(/^\/agents\/[^/]+\/focus\//)) return send(res, 200, []);
  if (path.match(/^\/agents\/[^/]+\/triggers/)) return send(res, 200, []);
  if (path.match(/^\/agents\/[^/]+\/schedule/)) return send(res, 200, []);

  return send(res, 200, { ok: true });
});

server.listen(port, host, () => {
  console.log(`[helms-visual-mock-api] listening on http://${host}:${port}`);
});
