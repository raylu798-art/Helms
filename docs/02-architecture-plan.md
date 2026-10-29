# 02 - Helms Overlay/Patch 架构方案

> 当前架构目标：**Submodule + Overlay + Patch**。  
> Clawith 作为上游 submodule；Helms 只维护品牌、汉化、脚本、文档和少量入口 patch。

---

## 1. 架构原则

1. **上游独立**：Clawith 保持为 `vendor/clawith` submodule。
2. **自有改造独立**：Helms 改造集中在 `helms-overlay/`。
3. **入口修改最小化**：需要改 Clawith 的地方通过 `patches/` 表达。
4. **构建目录临时化**：在 `.work/clawith-helms` 中应用 overlay 和 patch，不污染 submodule。
5. **可删除可重建**：`.work/` 随时可以删除，通过脚本重建。
6. **可跟随更新**：Clawith 更新后，重新应用 Helms overlay 和 patch。

---

## 2. 仓库结构

```text
helms-platform/
  ├─ vendor/
  │   └─ clawith/                      # Clawith Git submodule，不直接提交改动
  │
  ├─ helms-overlay/
  │   ├─ frontend/
  │   │   ├─ public/
  │   │   │   └─ helms/
  │   │   │       ├─ logo.svg
  │   │   │       ├─ logo-mark.svg
  │   │   │       └─ favicon.ico
  │   │   └─ src/
  │   │       └─ helms/
  │   │           ├─ brand.config.ts
  │   │           ├─ terminology.zh-CN.ts
  │   │           ├─ i18n-overrides.zh-CN.ts
  │   │           └─ helms-ui-text.ts
  │   │
  │   └─ docs/
  │       ├─ helms-branding-guide.md
  │       └─ helms-i18n-guide.md
  │
  ├─ patches/
  │   ├─ series
  │   ├─ 0001-add-helms-brand-entry.patch
  │   ├─ 0002-add-helms-i18n-entry.patch
  │   └─ 0003-add-helms-build-env-support.patch
  │
  ├─ scripts/
  │   ├─ prepare-helms-worktree.sh
  │   ├─ apply-helms-overlay.sh
  │   ├─ apply-helms-patches.sh
  │   ├─ build-helms.sh
  │   ├─ smoke-test-helms.sh
  │   └─ update-clawith-upstream.sh
  │
  ├─ docs/
  │   ├─ 00-product-positioning.md
  │   ├─ 01-mvp-scope.md
  │   ├─ 02-architecture-plan.md
  │   ├─ 03-codex-rules.md
  │   └─ 04-acceptance-checklist.md
  │
  ├─ .work/                            # 临时构建目录，不提交
  │   └─ clawith-helms/
  │
  ├─ AGENTS.md
  ├─ .gitmodules
  ├─ .gitignore
  └─ README.md
```

---

## 3. 构建流程

```text
vendor/clawith 原始代码
  ↓
scripts/prepare-helms-worktree.sh
  ↓
.work/clawith-helms 临时工作目录
  ↓
scripts/apply-helms-overlay.sh
  ↓
复制 helms-overlay 到 .work/clawith-helms
  ↓
scripts/apply-helms-patches.sh
  ↓
应用 patches/series
  ↓
scripts/build-helms.sh
  ↓
生成 Helms 白标构建产物
  ↓
scripts/smoke-test-helms.sh
  ↓
验证品牌、汉化和构建结果
```

---

## 4. Submodule 管理

Clawith 作为 submodule 放在：

```text
vendor/clawith
```

使用方式：

```bash
git submodule add https://github.com/dataelement/Clawith.git vendor/clawith
```

建议锁定 tag，而不是长期直接追 main：

```bash
git -C vendor/clawith fetch --tags
git -C vendor/clawith checkout <stable-tag>
```

提交 submodule 指针：

```bash
git add .gitmodules vendor/clawith
git commit -m "chore: add/update Clawith submodule"
```

---

## 5. Overlay 设计

Overlay 只放 Helms 自有资产，不复制大量 Clawith 业务代码。

### 5.1 品牌配置

路径：

```text
helms-overlay/frontend/src/helms/brand.config.ts
```

内容职责：

- productName；
- productFullName；
- slogan；
- defaultLocale；
- logoPath；
- faviconPath；
- docsUrl；
- supportEmail。

---

### 5.2 术语表

路径：

```text
helms-overlay/frontend/src/helms/terminology.zh-CN.ts
```

职责：

- 统一 Agent/Workspace/Tool/Skill 等术语；
- 避免页面分散翻译；
- 保持术语一致。

---

### 5.3 i18n 覆盖

路径：

```text
helms-overlay/frontend/src/helms/i18n-overrides.zh-CN.ts
```

职责：

- 覆盖核心页面中文文案；
- 优先服务演示路径；
- 不追求第一阶段全量翻译。

---

### 5.4 品牌资源

路径：

```text
helms-overlay/frontend/public/helms/
```

职责：

- Logo；
- Favicon；
- Logo mark；
- 其他品牌图片。

---

## 6. Patch 设计

Patch 只做最小入口改造。

### 6.1 Patch 原则

1. 每个 patch 只解决一个问题；
2. patch 数量控制在 3–6 个；
3. 不做大规模全局替换；
4. 不修改数据库；
5. 不修改后端核心；
6. 不修改许可证；
7. patch 必须可重复应用；
8. patch 失败时能定位具体文件。

---

### 6.2 建议 patch

| Patch | 目的 |
|---|---|
| `0001-add-helms-brand-entry.patch` | 接入 Helms 品牌配置，替换 title/logo/favicon/登录页产品名 |
| `0002-add-helms-i18n-entry.patch` | 接入 Helms 中文术语和核心页面汉化 |
| `0003-add-helms-build-env-support.patch` | 支持 Helms 构建环境变量 |

---

## 7. 脚本职责

### 7.1 `prepare-helms-worktree.sh`

职责：

- 删除旧 `.work/clawith-helms`；
- 从 `vendor/clawith` 创建干净临时目录；
- 确保 submodule 不被污染。

---

### 7.2 `apply-helms-overlay.sh`

职责：

- 复制 `helms-overlay/frontend/public/helms`；
- 复制 `helms-overlay/frontend/src/helms`；
- 支持传入目标目录；
- 默认目标为 `.work/clawith-helms`。

---

### 7.3 `apply-helms-patches.sh`

职责：

- 读取 `patches/series`；
- 按顺序应用 patch；
- patch 失败立即停止；
- 输出失败 patch 名称。

---

### 7.4 `build-helms.sh`

职责：

- 准备 worktree；
- 应用 overlay；
- 应用 patches；
- 设置 Helms 环境变量；
- 执行前端构建；
- 输出构建结果。

---

### 7.5 `smoke-test-helms.sh`

职责：

- 静态检查 overlay 文件是否存在；
- 检查构建目录是否包含 Helms 配置；
- 检查术语表是否包含“数字员工”；
- 后续可升级为浏览器自动化测试。

---

### 7.6 `update-clawith-upstream.sh`

职责：

- 更新 `vendor/clawith` 到指定 tag/commit；
- 提交 submodule 指针；
- 提醒重新 build 和 smoke test。

---

## 8. 上游更新流程

```text
选择 Clawith 新 tag
  ↓
update-clawith-upstream.sh <tag>
  ↓
build-helms.sh
  ↓
如果 patch 成功，运行 smoke test
  ↓
如果 patch 失败，修复对应 patch
  ↓
重新 build
  ↓
提交 Helms 更新 PR
```

每次上游更新建议单独提交：

```text
chore: update Clawith upstream to <tag>
```

如果 patch 需要调整，另起提交：

```text
patch: refresh Helms brand patch for Clawith <tag>
```

---

## 9. 文件边界

## 9.1 允许 Codex 修改

```text
helms-overlay/**
patches/**
scripts/**
docs/**
AGENTS.md
README.md
.gitignore
.gitmodules
```

## 9.2 原则上禁止 Codex 直接修改

```text
vendor/clawith/**
```

## 9.3 例外

如果需要生成 patch，可以在 `.work/clawith-helms` 中临时修改，然后通过 `git diff` 生成 patch。生成后只提交 patch 文件，不提交 `.work/`。

---

## 10. Patch 生成流程

```bash
bash scripts/prepare-helms-worktree.sh
bash scripts/apply-helms-overlay.sh

cd .work/clawith-helms

# 手工或让 Codex 修改入口文件

git diff --binary > ../../patches/0001-add-helms-brand-entry.patch

cd ../..

# 更新 patches/series
git add patches/0001-add-helms-brand-entry.patch patches/series
git commit -m "patch: add Helms brand entry"
```

验证：

```bash
bash scripts/build-helms.sh
bash scripts/smoke-test-helms.sh
```

---

## 11. 当前阶段架构总结

Helms 当前架构不追求功能重构，追求的是：

> **在最大限度保留 Clawith 上游更新能力的前提下，建立 Helms 独立白标化和汉化机制。**
