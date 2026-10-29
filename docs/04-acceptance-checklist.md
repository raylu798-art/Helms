# 04 - Helms 0.1 验收清单

> 本清单用于验收 Helms 白标化、汉化、Overlay/Patch 工程机制和 Codex 任务结果。

---

## 1. 仓库结构验收

| 检查项 | 标准 | 结果 |
|---|---|---|
| `vendor/clawith` | 作为 Git submodule 存在 | ☐ |
| `.gitmodules` | 正确记录 Clawith submodule | ☐ |
| `helms-overlay/` | 存在 | ☐ |
| `patches/` | 存在 | ☐ |
| `patches/series` | 存在 | ☐ |
| `scripts/` | 存在 | ☐ |
| `docs/` | 5 个基础文档存在 | ☐ |
| `AGENTS.md` | 根目录存在 | ☐ |
| `.work/` | 已加入 `.gitignore` | ☐ |

---

## 2. Submodule 干净度验收

| 检查项 | 命令 | 标准 | 结果 |
|---|---|---|---|
| submodule 状态 | `git submodule status` | 能显示 Clawith 指针 | ☐ |
| submodule 工作区 | `git -C vendor/clawith status --short` | 无业务文件改动 | ☐ |
| 主仓库状态 | `git status --short` | 不包含 `.work/` | ☐ |

---

## 3. Overlay 文件验收

| 文件 | 标准 | 结果 |
|---|---|---|
| `helms-overlay/frontend/src/helms/brand.config.ts` | 存在，包含 Helms 产品名 | ☐ |
| `helms-overlay/frontend/src/helms/terminology.zh-CN.ts` | 存在，包含“数字员工” | ☐ |
| `helms-overlay/frontend/src/helms/i18n-overrides.zh-CN.ts` | 存在，包含核心中文文案 | ☐ |
| `helms-overlay/frontend/src/helms/helms-ui-text.ts` | 存在或明确不需要 | ☐ |
| `helms-overlay/frontend/public/helms/logo.svg` | 存在 | ☐ |
| `helms-overlay/frontend/public/helms/logo-mark.svg` | 存在或明确不需要 | ☐ |
| `helms-overlay/frontend/public/helms/favicon.ico` | 存在或有占位说明 | ☐ |

---

## 4. Scripts 验收

| 脚本 | 标准 | 结果 |
|---|---|---|
| `scripts/prepare-helms-worktree.sh` | 可执行，可生成 `.work/clawith-helms` | ☐ |
| `scripts/apply-helms-overlay.sh` | 可执行，可复制 overlay | ☐ |
| `scripts/apply-helms-patches.sh` | 可执行，可按 `series` 应用 patch | ☐ |
| `scripts/build-helms.sh` | 可执行，能启动构建流程 | ☐ |
| `scripts/smoke-test-helms.sh` | 可执行，能检查核心品牌文件 | ☐ |
| `scripts/update-clawith-upstream.sh` | 可执行，支持更新 submodule | ☐ |

脚本基础要求：

- 使用 `set -euo pipefail`；
- 支持从仓库根目录运行；
- 不直接污染 `vendor/clawith`；
- 失败时有明确提示。

---

## 5. Patch 验收

| 检查项 | 标准 | 结果 |
|---|---|---|
| `patches/series` | patch 按顺序列出 | ☐ |
| Patch 命名 | 使用 `0001-xxx.patch` 格式 | ☐ |
| Patch 范围 | 每个 patch 只做一个目标 | ☐ |
| Patch 大小 | 没有大规模无关改动 | ☐ |
| Patch 内容 | 不修改 LICENSE/NOTICE | ☐ |
| Patch 应用 | 可通过脚本应用 | ☐ |
| Patch 失败 | 能定位失败 patch | ☐ |

---

## 6. 品牌化验收

| 检查项 | 标准 | 结果 |
|---|---|---|
| 产品名 | 用户可见核心路径显示 Helms | ☐ |
| 浏览器标题 | 显示 Helms 或 Helms AI数字员工工作台 | ☐ |
| Logo | 使用 Helms logo | ☐ |
| Favicon | 使用 Helms favicon | ☐ |
| 登录页 | 显示 Helms 品牌 | ☐ |
| 首页/工作台 | 有 Helms 中文表达 | ☐ |
| Clawith 营销文案 | 核心演示路径不明显出现 | ☐ |
| 开源 attribution | 必要声明保留 | ☐ |

---

## 7. 汉化验收

| 检查项 | 标准 | 结果 |
|---|---|---|
| 登录页 | 基本中文 | ☐ |
| 主导航 | 基本中文 | ☐ |
| Agent | 显示为“数字员工” | ☐ |
| Workspace | 显示为“工作区” | ☐ |
| Tool | 显示为“工具” | ☐ |
| Skill | 显示为“技能” | ☐ |
| Settings | 显示为“设置” | ☐ |
| Chat | 显示为“对话”或中文提示 | ☐ |
| 核心演示路径 | 无明显英文阻断 | ☐ |

允许：

- 低频高级页面暂时保留英文；
- 开发者调试页面暂时保留英文；
- 代码变量名仍为英文。

---

## 8. 构建验收

| 检查项 | 标准 | 结果 |
|---|---|---|
| 准备 worktree | `prepare-helms-worktree.sh` 成功 | ☐ |
| 应用 overlay | `apply-helms-overlay.sh` 成功 | ☐ |
| 应用 patches | `apply-helms-patches.sh` 成功 | ☐ |
| 前端构建 | `build-helms.sh` 成功或明确依赖缺失 | ☐ |
| 冒烟测试 | `smoke-test-helms.sh` 通过 | ☐ |

---

## 9. 更新机制验收

模拟一次上游更新或同版本重建：

| 检查项 | 标准 | 结果 |
|---|---|---|
| 删除 `.work/` | 可删除 | ☐ |
| 重新准备 worktree | 成功 | ☐ |
| 重新应用 overlay | 成功 | ☐ |
| 重新应用 patches | 成功 | ☐ |
| 重新构建 | 成功 | ☐ |
| 重新冒烟测试 | 通过 | ☐ |
| `vendor/clawith` | 仍保持干净 | ☐ |

---

## 10. Codex 任务验收

每个 Codex PR 必须检查：

| 检查项 | 标准 | 结果 |
|---|---|---|
| 范围 | 只完成当前任务 | ☐ |
| 文件 | 没有无关文件改动 | ☐ |
| submodule | 没有直接提交 `vendor/clawith` 业务变更 | ☐ |
| 安全 | 没有密钥、密码、API Key | ☐ |
| 许可证 | 没有删除开源声明 | ☐ |
| 测试 | 有测试方式或说明 | ☐ |
| 回滚 | 改动可回滚 | ☐ |
| 总结 | 有修改摘要和风险说明 | ☐ |

---

## 11. Helms 0.1 总体验收

Helms 0.1 可以认为完成，当以下全部满足：

1. 仓库结构符合 Submodule + Overlay + Patch；
2. Clawith submodule 干净；
3. Helms overlay 文件完整；
4. scripts 可运行；
5. patches 可应用；
6. 品牌化核心路径完成；
7. 汉化核心路径完成；
8. 冒烟测试通过；
9. 保留开源声明；
10. 能说明如何更新 Clawith 上游并重新构建 Helms。

---

## 12. 不通过情况

出现以下任一情况，不允许合并或发布：

- 直接改了 `vendor/clawith` 业务代码；
- `.work/` 被提交；
- 删除或修改 LICENSE/NOTICE；
- patch 大到无法审查；
- 任务超出 Helms 0.1 MVP；
- 引入不必要依赖；
- 脚本会删除用户本地重要文件；
- 构建过程依赖硬编码本地路径；
- 出现明文 API Key/密码；
- 无法重新应用 overlay/patch。

---

## 13. 最终验收口径

Helms 0.1 不是功能验收，而是机制验收：

> **能否在不污染 Clawith 上游源码的前提下，稳定构建出 Helms 品牌化、中文化版本。**
