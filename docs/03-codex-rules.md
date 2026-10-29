# 03 - Codex 开发规则

> 本文件用于指导 Codex 在 Helms 仓库中的行为。  
> 当前阶段只做 **Submodule + Overlay + Patch**，不做深度功能改造。

---

## 1. 项目背景

Helms 是基于 Clawith 的企业 AI数字员工工作台。

当前阶段目标不是深度重构 Clawith，而是：

1. 使用 Clawith 作为上游 submodule；
2. 使用 Helms Overlay 做品牌化和汉化；
3. 使用少量 Patch 接入品牌和汉化入口；
4. 使用 Scripts 实现构建、更新和冒烟测试；
5. 保持 Helms 改造可持续跟随 Clawith 高频更新。

---

## 2. Codex 每次任务前必须阅读

每次任务开始前，必须阅读：

1. `AGENTS.md`
2. `docs/00-product-positioning.md`
3. `docs/01-mvp-scope.md`
4. `docs/02-architecture-plan.md`
5. `docs/03-codex-rules.md`
6. `docs/04-acceptance-checklist.md`

如果任务涉及具体 overlay 或 patch，还要阅读相关文件。

---

## 3. 当前阶段允许做的事

Codex 可以做：

| 类型 | 说明 |
|---|---|
| 文档 | 完善 `docs/` |
| Overlay | 新增/修改 `helms-overlay/` |
| Patch | 新增/刷新 `patches/` |
| 脚本 | 新增/修改 `scripts/` |
| 品牌配置 | 修改 `brand.config.ts` |
| 汉化配置 | 修改 `terminology.zh-CN.ts`、`i18n-overrides.zh-CN.ts` |
| 冒烟测试 | 修改 `smoke-test-helms.sh` |
| 更新流程 | 修改 `update-clawith-upstream.sh` |
| 只读扫描 | 读取 `vendor/clawith` 并生成报告 |

---

## 4. 当前阶段禁止做的事

Codex 不得做：

| 禁止事项 | 原因 |
|---|---|
| 直接提交 `vendor/clawith/**` 修改 | 会污染上游 submodule |
| 修改数据库模型 | 影响后续上游更新 |
| 修改后端 Agent Runtime | 风险高 |
| 修改 A2A/Crew/Aware | 上游更新频繁 |
| 修改权限体系 | 安全风险高 |
| 修改 Sandbox/代码执行 | 需要专项安全设计 |
| 新增任务中心 | 不属于 0.1 MVP |
| 新增产物库 | 不属于 0.1 MVP |
| 重构知识库 | 不属于 0.1 MVP |
| 重构模型网关 | 不属于 0.1 MVP |
| 删除 LICENSE/NOTICE | 开源合规风险 |
| 全局搜索替换 Clawith | 容易误伤代码和许可证 |
| 大范围改 UI 组件 | 后续冲突高 |
| 引入大型新依赖 | 增加维护成本 |

---

## 5. 对 `vendor/clawith` 的规则

`vendor/clawith` 是上游源码 submodule。

### 5.1 允许

- 读取；
- 搜索；
- 分析；
- 生成扫描报告；
- 在 `.work/clawith-helms` 中临时修改以生成 patch。

### 5.2 禁止

- 直接在 `vendor/clawith` 中改文件；
- 直接提交 `vendor/clawith` 里的业务代码变更；
- 删除或修改上游许可证；
- 把 Helms 自有代码直接写进 submodule。

---

## 6. 对 `.work/` 的规则

`.work/` 是临时构建目录。

允许：

- 脚本生成；
- 本地构建；
- 临时修改；
- 生成 patch。

禁止：

- 提交 `.work/` 到 Git；
- 把 `.work/` 当成长期开发目录；
- 在 `.work/` 修改后忘记生成 patch。

---

## 7. Patch 规则

### 7.1 Patch 命名

使用格式：

```text
0001-add-helms-brand-entry.patch
0002-add-helms-i18n-entry.patch
0003-add-helms-build-env-support.patch
```

### 7.2 Patch 原则

1. 一个 patch 只做一个目标；
2. patch 尽量小；
3. patch 必须可重复应用；
4. patch 不修改许可证；
5. patch 不修改后端核心；
6. patch 失败必须清晰报错；
7. patch 必须写入 `patches/series`。

### 7.3 Patch 数量控制

Helms 0.1 阶段 patch 数量建议不超过 6 个。

如果超过 10 个，要重新评估是否改动过散。

---

## 8. Overlay 规则

Overlay 目录是 Helms 自有资产：

```text
helms-overlay/
```

允许存放：

- 品牌配置；
- 中文术语；
- i18n 覆盖；
- Logo/Favicon；
- Helms 文案；
- Helms 文档。

不允许存放：

- 大量复制的 Clawith 页面组件；
- 后端业务逻辑；
- 数据库模型；
- 客户真实数据；
- 密钥；
- 私密配置。

---

## 9. 脚本规则

所有脚本必须：

1. 使用 `set -euo pipefail`；
2. 支持从仓库根目录运行；
3. 有清晰输出；
4. 失败时返回非 0；
5. 不硬编码用户本地路径；
6. 不写入 `vendor/clawith`；
7. 默认操作 `.work/clawith-helms`。

---

## 10. 品牌和汉化规则

### 10.1 品牌

用户可见品牌统一使用：

```text
Helms
Helms AI数字员工工作台
```

### 10.2 中文术语

优先使用：

| 英文 | 中文 |
|---|---|
| Agent | 数字员工 |
| Workspace | 工作区 |
| Tool | 工具 |
| Skill | 技能 |
| Crew | 数字员工小组 |
| Memory | 工作记忆 |
| Soul | 岗位设定 |
| Aware | 主动工作 |
| Trigger | 自动任务 |
| Settings | 设置 |
| Dashboard | 工作台 |

### 10.3 禁止事项

不要修改：

- 代码变量名；
- API 路径；
- 数据库字段；
- 后端类名；
- 第三方包名；
- 许可证文本。

---

## 11. 每个 Codex 任务的输出要求

每个任务完成后必须输出：

1. 修改摘要；
2. 修改文件列表；
3. 是否修改了 `vendor/clawith`；
4. 如何测试；
5. 测试结果；
6. 已知风险；
7. 下一步建议。

如果没有运行测试，必须说明原因。

---

## 12. 推荐任务粒度

好的任务：

- “创建 helms-overlay 目录和品牌配置文件”
- “生成品牌入口扫描报告”
- “实现 apply-helms-overlay.sh”
- “生成第一个品牌入口 patch”
- “刷新 i18n patch 以适配新上游版本”

不好的任务：

- “把 Clawith 改成 Helms”
- “汉化所有页面”
- “重构整个前端”
- “做一个完整任务中心”
- “让系统变成企业级产品”

---

## 13. 代码审查重点

每个 PR 审查：

1. 是否违反 MVP 范围；
2. 是否直接改了 `vendor/clawith`；
3. 是否误删开源声明；
4. 是否 patch 过大；
5. 是否脚本可重复运行；
6. 是否 `.work/` 被提交；
7. 是否引入无关依赖；
8. 是否可回滚；
9. 是否符合 Helms 品牌和中文术语。

---

## 14. 当前阶段一句话原则

**Codex 当前只服务 Helms 白标化、汉化和 Overlay/Patch 工程机制，不参与深度功能改造。**
