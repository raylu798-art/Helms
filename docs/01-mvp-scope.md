# 01 - Helms 0.1 MVP 范围说明

> 当前 MVP 范围已经调整：**只做品牌化、汉化、Overlay/Patch 工程机制和白标构建，不做深度功能改造。**

---

## 1. MVP 名称

**Helms 0.1：品牌化与汉化白标版**

---

## 2. MVP 目标

Helms 0.1 的目标是：

> 基于 Clawith 上游源码，通过独立 Overlay 和少量 Patch，生成 Helms 品牌版本，实现核心界面中文化，并建立可跟随 Clawith 高频更新的工程机制。

---

## 3. MVP 核心产出

Helms 0.1 必须产出：

1. `vendor/clawith` submodule；
2. `helms-overlay/` 品牌与汉化覆盖层；
3. `patches/` 最小入口补丁；
4. `scripts/` 构建、应用、测试、更新脚本；
5. `docs/` 开发说明和验收标准；
6. `AGENTS.md` Codex 项目指令；
7. 可以构建的 Helms 前端白标版本；
8. 可以跑通的基础冒烟测试。

---

## 4. MVP 做什么

## 4.1 品牌化

| 项目 | 说明 |
|---|---|
| 产品名 | 用户可见位置显示 Helms |
| 浏览器标题 | 显示 Helms AI数字员工工作台 |
| Logo | 使用 Helms Logo |
| Favicon | 使用 Helms 图标 |
| 登录页 | 显示 Helms 品牌表达 |
| 顶部导航 | 显示 Helms 或 Helms Logo |
| 欢迎语 | 使用中文企业软件表达 |
| 页脚/关于 | 保留必要开源声明，避免 Clawith 营销露出 |

---

## 4.2 汉化

优先汉化核心演示路径：

| 优先级 | 页面/模块 | 要求 |
|---|---|---|
| P0 | 登录页 | 中文标题、按钮、提示 |
| P0 | 首页/工作台 | 中文欢迎语、主要卡片 |
| P0 | 导航菜单 | 中文导航 |
| P0 | Agent 列表 | Agent 显示为数字员工 |
| P0 | Agent 详情 | 核心字段中文化 |
| P0 | Chat 页面 | 主要按钮、输入提示中文 |
| P1 | Workspace | 显示为工作区 |
| P1 | Tools/Skills | 显示为工具/技能 |
| P1 | Settings | 基础设置中文 |
| P2 | 低频高级页面 | 暂不强求 |

---

## 4.3 术语统一

必须建立集中术语表，而不是页面里随手翻译。

推荐文件：

```text
helms-overlay/frontend/src/helms/terminology.zh-CN.ts
```

术语优先级：

1. Agent → 数字员工；
2. Workspace → 工作区；
3. Tool → 工具；
4. Skill → 技能；
5. Crew → 数字员工小组；
6. Memory → 工作记忆；
7. Soul → 岗位设定；
8. Aware → 主动工作；
9. Trigger → 自动任务。

---

## 4.4 Overlay 工程机制

必须建立：

```text
helms-overlay/
  ├─ frontend/public/helms/
  └─ frontend/src/helms/
```

该目录只存放 Helms 自有资产：

- 品牌配置；
- 中文术语表；
- i18n 覆盖；
- Logo/Favicon；
- Helms 文案配置；
- 不直接复制 Clawith 大量业务组件。

---

## 4.5 Patch 工程机制

必须建立：

```text
patches/
  ├─ series
  ├─ 0001-add-helms-brand-entry.patch
  ├─ 0002-add-helms-i18n-entry.patch
  └─ 0003-add-helms-build-env-support.patch
```

Patch 只用于最小入口改造，例如：

- 接入品牌配置；
- 接入 i18n 覆盖；
- 替换 title/favicon/logo 入口；
- 支持 Helms 构建环境变量。

Patch 不用于大规模业务逻辑改造。

---

## 4.6 构建和更新脚本

必须建立：

```text
scripts/
  ├─ prepare-helms-worktree.sh
  ├─ apply-helms-overlay.sh
  ├─ apply-helms-patches.sh
  ├─ build-helms.sh
  ├─ smoke-test-helms.sh
  └─ update-clawith-upstream.sh
```

脚本目标：

1. `vendor/clawith` 保持干净；
2. 通过 `.work/clawith-helms` 临时目录构建；
3. 自动复制 overlay；
4. 自动应用 patches；
5. 自动检查品牌和汉化核心文件；
6. 支持未来更新 Clawith submodule。

---

## 5. MVP 不做什么

Helms 0.1 明确不做：

| 不做事项 | 说明 |
|---|---|
| 不新增任务中心 | 暂不建立新业务模型 |
| 不新增产物库 | 暂不新增 Artifact 数据模型 |
| 不重构知识库 | 暂不改 RAG/文件解析 |
| 不重构模型中心 | 暂不改模型调用链 |
| 不新增审批中心 | 暂不改权限/流程 |
| 不改后端数据库 | 避免升级冲突 |
| 不改 Agent Runtime | 保持上游能力 |
| 不改 A2A/Crew/Aware | 避免高频冲突 |
| 不改 Sandbox | 安全专项后置 |
| 不做全量汉化 | 先覆盖演示路径 |
| 不做全局搜索替换 | 避免误伤许可证和代码变量 |
| 不删除 Clawith attribution | 开源合规要求保留 |

---

## 6. MVP 文件边界

允许修改/新增：

```text
helms-overlay/
patches/
scripts/
docs/
AGENTS.md
README.md
.gitignore
.gitmodules
```

不允许直接修改：

```text
vendor/clawith/**
```

如果必须改变 Clawith 入口文件，只能通过 patch 文件表达。

---

## 7. MVP 验收标准

## 7.1 品牌验收

- 页面标题包含 Helms；
- 登录页显示 Helms；
- Logo 使用 Helms 资源；
- Favicon 使用 Helms 资源；
- 核心页面不再显示 Clawith 营销文案；
- 开源声明保留 Clawith 来源。

## 7.2 汉化验收

- 登录页中文；
- 主导航中文；
- Agent 显示为“数字员工”；
- Workspace 显示为“工作区”；
- Tool 显示为“工具”；
- Skill 显示为“技能”；
- 核心演示路径无明显英文阻断。

## 7.3 工程验收

- `vendor/clawith` 干净；
- `bash scripts/prepare-helms-worktree.sh` 可运行；
- `bash scripts/apply-helms-overlay.sh` 可运行；
- `bash scripts/apply-helms-patches.sh` 可运行；
- `bash scripts/build-helms.sh` 可运行或给出明确依赖提示；
- `bash scripts/smoke-test-helms.sh` 通过；
- `.work/` 不提交到 Git。

## 7.4 更新验收

- 能更新 Clawith submodule；
- 能重新应用 Helms overlay；
- 能重新应用 patches；
- patch 冲突能定位到具体 patch；
- 修复后能重新构建。

---

## 8. 后续阶段进入条件

只有当 Helms 0.1 满足以下条件后，才考虑进入 0.2：

1. 白标版本构建稳定；
2. 核心演示路径中文体验可接受；
3. 上游更新流程至少验证过一次；
4. patch 数量可控；
5. 演示客户对产品方向有正反馈。

---

## 9. MVP 总结

Helms 0.1 的 MVP 不是“做很多功能”，而是：

> **建立一种可持续跟随 Clawith 更新的白标化与汉化机制。**
