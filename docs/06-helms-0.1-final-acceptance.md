# 06 - Helms 0.1 最终验收记录

本文件记录 Helms 0.1 视觉验收后的收口状态。Helms 0.1 的验收目标是品牌化、中文化、可构建、可重建、可冒烟测试，不包含真实后端业务能力验收。

## 1. 验收结论

截至 2026-07-21，Helms 0.1 已完成 Clawith `v1.11.1` 上游同步并进入可固化状态：

- 品牌入口已接入 Helms title、favicon、logo 和登录页品牌。
- 中文术语/i18n 覆盖已接入 Clawith 前端入口。
- 本地视觉验收已覆盖核心演示路径，并通过用户浏览器复查。
- Helms Logo 已切换为自有几何 SVG 资产，登录页左上角使用黑色 mark + HELMS 字标。
- Favicon 已切换为蓝底白色 mark，并通过 `?v=20260622` 版本参数规避浏览器标签缓存。
- 真实部署包已可生成，并已在本地 `3008` 前端容器验证 title、logo 和 favicon 静态资源更新。
- `vendor/clawith` 保持上游 submodule，不直接承载 Helms 业务修改。
- `.work/` 为可删除、可重建的临时工作目录，不进入 Git 交付状态。
- Clawith submodule 基线已更新为 `v1.11.1`（`c8ae41c`），Helms overlay/patch 可从该基线完整重建。
- 新增的多数字员工协作与企业经验入口已纳入 Helms 中文术语覆盖；未改动上游后端实现。

## 2. 已通过的视觉路径

本地视觉验收使用 `scripts/start-helms-visual-check.sh` 启动前端和 mock API。已通过路径包括：

- `/login`
- `/plaza`
- `/dashboard`
- `/agents/agent-research/chat`
- `/agents/agent-research/settings`
- `/agents/agent-research/settings#tools`
- `/agents/agent-research/settings#relationships`
- `/agents/agent-research/settings#settings`
- `/agents/agent-research/settings#approvals`
- `/enterprise`
- `/enterprise#users`
- `/enterprise#tools`
- `/enterprise#skills`
- `/admin/platform-settings`

## 3. 可复现验收命令

机制验收：

```bash
bash scripts/prepare-helms-worktree.sh
bash scripts/apply-helms-overlay.sh
bash scripts/apply-helms-patches.sh
bash scripts/smoke-test-helms.sh
```

构建验收：

```bash
bash scripts/build-helms.sh
```

视觉验收：

```bash
bash scripts/start-helms-visual-check.sh
```

静态验收：

```bash
git -C vendor/clawith status --short
git status --short -- .work
```

## 4. 本轮复测结果

2026-07-21 上游同步复测结果：

| 检查项 | 命令 | 结果 |
|---|---|---|
| 准备 worktree | `bash scripts/prepare-helms-worktree.sh` | 通过 |
| 应用 overlay | `bash scripts/apply-helms-overlay.sh` | 通过 |
| 应用 patches | `bash scripts/apply-helms-patches.sh` | 通过 |
| 冒烟测试 | `bash scripts/smoke-test-helms.sh` | 通过 |
| 前端构建 | `bash scripts/build-helms.sh` | 通过 |
| 上游前端测试 | `cd .work/clawith-helms/frontend && npm test` | 通过，63 项全部通过 |
| 部署包生成 | `bash scripts/create-helms-deploy-package.sh` | 通过 |
| Compose 配置 | `docker compose config --quiet` | 通过 |
| 上游版本记录 | `cat .work/helms-deploy-package/HELMS-UPSTREAM-REVISION` | `c8ae41ca487b5c1fd98b5f5b19f866fc1fef4388` |
| 隔离真实部署 | `docker compose -p helms-v111-check up -d` | 通过，Alembic、Checkpoint、Durable Runtime 均正常 |
| 现有实例升级 | `docker compose -p helms-deploy-package up -d` | 通过，`3018` 前后端已切换到新镜像 |
| 真实数据保留 | PostgreSQL 与 `/data/agents` 只读核对 | 通过，3 个用户、14 个数字员工、6337 个 Agent 文件 |
| 升级前备份 | `.work/backups/helms-pre-v111-20260721/` | 通过，数据库与 Agent 文件均已生成 SHA-256 |
| 视觉脚本 dry-run | `HELMS_VISUAL_DRY_RUN=1 bash scripts/start-helms-visual-check.sh` | 通过 |
| 本地真实部署 | `docker compose build frontend && docker compose up -d frontend` | 通过，`3008` 前端容器返回新版静态资源 |
| 版本化 favicon | `curl http://127.0.0.1:3008/login` | 通过，包含 `/helms/favicon.svg?v=20260622` |
| submodule 干净度 | `git -C vendor/clawith status --short` | 通过，输出为空 |
| `.work/` Git 状态 | `git status --short -- .work` | 通过，输出为空 |
| 开源声明 | `find vendor/clawith -maxdepth 2 ...` | 通过，存在 `vendor/clawith/LICENSE` |
| 常见密钥模式扫描 | `rg` 扫描 Helms 自有文件 | 通过，未命中 |

## 5. Mock API 边界

`scripts/helms-visual-mock-api.mjs` 只用于本地视觉验收：

- 用来验证 Helms 品牌、中文术语、核心页面渲染和前端接口数据形状。
- 不代表真实 Clawith 后端功能验收。
- 不作为 Helms 产品公共 API。
- 如果接入真实后端后仍出现页面错误，再评估是否需要最小防御 patch。

## 6. 已知保留项

Helms 0.1 允许保留以下内容：

- 低频高级页面、开发者配置项、技术生态名称中的英文。
- Clawith、OpenClaw、AgentBay、ClawHub 等技术或开源生态名称。
- LICENSE、NOTICE、README 或第三方 attribution 中的 Clawith 来源声明。
- `favicon.ico` 继续使用说明文件保留生成指引；当前浏览器入口使用已确认的 `favicon.svg`。
- Logo 资产为手工复刻 SVG，后续若取得正式设计源文件，可无损替换 overlay 下同名资产。
- Clawith `v1.11.1` tag 中前后端 `VERSION` 文件仍显示 `1.11.0`，Helms 以 submodule commit 和部署包中的 `HELMS-UPSTREAM-REVISION` 作为准确构建基线。
- 多数字员工群聊的规划与上下文压缩需要在平台设置中配置可用模型；未配置时不应把群聊规划纳入生产验收。
- 从 `v1.10.x` 升级真实数据前必须备份 PostgreSQL 和 Agent 文件/对象存储，并验证 Alembic 与 LangGraph Checkpoint schema 初始化。

## 7. 不属于 Helms 0.1

以下事项明确不在 Helms 0.1 中实施：

- 后端 API、数据库模型、权限系统、Agent Runtime 改造。
- A2A、Crew、Aware、Sandbox、执行环境等深层能力改造。
- 任务中心、产物库、模型网关、知识库重构。
- 全量汉化或全局搜索替换 Clawith 文案。
