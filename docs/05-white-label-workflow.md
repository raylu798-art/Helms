# 05 - Helms 白标构建工作流

本文件说明 Helms 0.1 的 Submodule + Overlay + Patch 骨架如何使用。

## 1. 初始化上游

Clawith 必须以 submodule 形式存在于：

```text
vendor/clawith
```

首次初始化：

```bash
git init
git submodule add https://github.com/dataelement/Clawith.git vendor/clawith
```

已有 submodule 时：

```bash
git submodule update --init --recursive
```

## 2. 生成临时工作目录

```bash
bash scripts/prepare-helms-worktree.sh
```

该脚本会从 `vendor/clawith` 生成 `.work/clawith-helms`。`.work/` 是临时目录，不应提交。

## 3. 应用 Helms Overlay

```bash
bash scripts/apply-helms-overlay.sh
```

该脚本会复制：

- `helms-overlay/frontend/public/helms` 到 `.work/clawith-helms/frontend/public/helms`
- `helms-overlay/frontend/src/helms` 到 `.work/clawith-helms/frontend/src/helms`

## 4. 应用 Patch

```bash
bash scripts/apply-helms-patches.sh
```

脚本按 `patches/series` 顺序应用 patch。当前骨架阶段允许 `series` 为空。

当前 Helms 0.1 已启用的入口 patch：

- `0001-add-helms-brand-entry.patch`：接入 Helms title、favicon 和登录页品牌标识。
- `0002-add-helms-i18n-entry.patch`：接入 Helms 中文术语和 i18n 覆盖。

## 5. 构建与冒烟测试

```bash
bash scripts/build-helms.sh
bash scripts/smoke-test-helms.sh
```

构建脚本会准备 worktree、应用 overlay、应用 patches，并根据 lockfile 选择包管理器执行前端构建。

## 6. 本地浏览器视觉验收

完成构建和冒烟测试后，可以启动本地视觉验收环境：

```bash
bash scripts/start-helms-visual-check.sh
```

脚本会：

- 检查 `.work/clawith-helms/frontend` 是否存在，不存在则重新准备 worktree、应用 overlay 和 patches；
- 启动本地 mock API，默认地址为 `http://127.0.0.1:8020`；
- 启动 Helms 前端 dev server，默认地址为 `http://127.0.0.1:3020`；
- 打印带临时 token 的登录后验收入口。

默认打开：

```text
http://127.0.0.1:3020/?token=visual-check
```

建议验收路径：

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

如端口被占用，可覆盖默认端口：

```bash
HELMS_VISUAL_API_PORT=8030 HELMS_VISUAL_FRONTEND_PORT=3030 bash scripts/start-helms-visual-check.sh
```

视觉验收 mock API 只用于验证 Helms 品牌、中文术语和核心页面渲染，不代表真实后端功能验收。若页面出现 `xxx.filter is not a function`、`Cannot read properties of undefined` 等错误，优先检查 `scripts/helms-visual-mock-api.mjs` 是否缺少对应接口形状；只有在接入真实 Clawith 后端后仍可复现，才考虑生成最小防御 patch。

如果修改了 `scripts/helms-visual-mock-api.mjs`，需要停止并重新运行 `bash scripts/start-helms-visual-check.sh`，已启动的 mock API 不会自动加载新端点。

视觉验收通过后的最终收口记录见：

- `docs/06-helms-0.1-final-acceptance.md`
- `docs/07-helms-0.2-backlog.md`

## 7. 后续生成入口 Patch

当需要接入品牌入口或 i18n 入口时：

1. 运行 `prepare-helms-worktree.sh` 和 `apply-helms-overlay.sh`。
2. 只在 `.work/clawith-helms` 中修改 Clawith 入口文件。
3. 对比 `vendor/clawith` 原始文件和 `.work/clawith-helms` 修改后的文件，生成 focused patch。
4. 将 patch 放入 `patches/` 并加入 `patches/series`。
5. 重新运行构建和冒烟测试。
