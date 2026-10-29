# Helms Agent Instructions

You are working on **Helms**, an enterprise AI digital employee workbench based on the open-source project **Clawith**.

The current phase is **Helms 0.1: Branding + Chinese Localization White-label Version**.

Helms currently uses a **Submodule + Overlay + Patch** approach.

---

## 1. Read these files before every task

Before starting any task, read:

1. `docs/00-product-positioning.md`
2. `docs/01-mvp-scope.md`
3. `docs/02-architecture-plan.md`
4. `docs/03-codex-rules.md`
5. `docs/04-acceptance-checklist.md`

If the task involves overlay, patches, scripts, or upstream update, also inspect the relevant files before editing.

---

## 2. Current project strategy

Helms is **not** currently doing deep feature development.

The current strategy is:

```text
Clawith upstream source
  +
Helms overlay
  +
Helms patches
  +
Helms build/update/smoke-test scripts
```

Meaning:

- `vendor/clawith` is the upstream source base.
- `helms-overlay/` contains Helms-owned branding and localization assets.
- `patches/` contains minimal entry patches needed to connect Helms overlay to Clawith.
- `scripts/` contains build, update, overlay, patch, and smoke-test workflows.
- `docs/` contains product, architecture, rules, and acceptance documentation.

---

## 3. Product direction

Helms is positioned as:

> Helms AI数字员工工作台

Current product focus:

1. Branding Clawith as Helms.
2. Localizing the core user-facing path into Chinese.
3. Translating key concepts into Chinese enterprise software language.
4. Keeping Helms modifications independent from Clawith upstream.
5. Supporting future Clawith updates with minimal maintenance cost.

Key terminology:

| Clawith term | Helms display term |
|---|---|
| Agent | 数字员工 |
| AI Agent | AI数字员工 |
| Workspace | 工作区 |
| Tool | 工具 |
| Skill | 技能 |
| Crew | 数字员工小组 |
| Memory | 工作记忆 |
| Soul | 岗位设定 |
| Aware | 主动工作 |
| Trigger | 自动任务 |
| Dashboard | 工作台 |
| Settings | 设置 |
| Chat | 对话 |

---

## 4. Important boundaries

### Allowed to edit

You may edit:

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

### Do not directly edit

Do not directly edit:

```text
vendor/clawith/**
```

`vendor/clawith` is a Git submodule and should remain clean.

If changes to Clawith source are required, they must be done in `.work/clawith-helms` and exported as a patch under `patches/`.

---

## 5. Current phase: allowed work

You may perform the following work:

1. Create or improve Helms overlay structure.
2. Create or improve branding configuration.
3. Create or improve Chinese terminology configuration.
4. Create or improve i18n override files.
5. Create or improve logo/favicon placeholder assets.
6. Create or improve patch files.
7. Create or improve build/update/smoke-test scripts.
8. Generate reports by reading `vendor/clawith`.
9. Refresh patches after upstream Clawith updates.
10. Improve documentation for the white-label workflow.

---

## 6. Current phase: prohibited work

Do not do the following unless explicitly requested:

1. Do not implement a task center.
2. Do not implement an artifact library.
3. Do not implement a model gateway.
4. Do not redesign the knowledge base.
5. Do not modify database models.
6. Do not modify backend Agent Runtime.
7. Do not modify A2A, Crew, Aware, Sandbox, or permission systems.
8. Do not introduce new backend services.
9. Do not perform global search-and-replace across the entire codebase.
10. Do not remove Clawith attribution, LICENSE, NOTICE, or third-party copyright statements.
11. Do not commit `.work/`.
12. Do not hardcode secrets, passwords, API keys, tokens, or customer data.

---

## 7. Patch rules

Patch files must be small and focused.

Good patch examples:

```text
0001-add-helms-brand-entry.patch
0002-add-helms-i18n-entry.patch
0003-add-helms-build-env-support.patch
```

Bad patch examples:

```text
0001-change-everything.patch
0002-translate-whole-app.patch
0003-rewrite-frontend.patch
```

Patch requirements:

1. Each patch should have one clear purpose.
2. Patch files must be listed in `patches/series`.
3. Patch files must not modify license or attribution files.
4. Patch files must avoid backend and database changes in Helms 0.1.
5. Patch failure must be easy to diagnose.

---

## 8. Script rules

Scripts should:

1. Use `set -euo pipefail`.
2. Work from the repository root.
3. Avoid hardcoded local user paths.
4. Write temporary build output to `.work/`.
5. Avoid modifying `vendor/clawith`.
6. Print clear progress messages.
7. Fail fast with useful errors.

Expected scripts:

```text
scripts/prepare-helms-worktree.sh
scripts/apply-helms-overlay.sh
scripts/apply-helms-patches.sh
scripts/build-helms.sh
scripts/smoke-test-helms.sh
scripts/update-clawith-upstream.sh
```

---

## 9. Task execution format

For every task, output:

1. Summary of what changed.
2. List of changed files.
3. Whether `vendor/clawith` was modified.
4. How to test.
5. Test results.
6. Known risks.
7. Suggested next step.

If tests were not run, explain why.

---

## 10. Review checklist

Before considering any task complete, verify:

1. The change stays within Helms 0.1 scope.
2. `vendor/clawith` remains clean.
3. `.work/` is not committed.
4. LICENSE/NOTICE/attribution files are not removed.
5. No secrets are introduced.
6. Scripts are safe and repeatable.
7. Patches are small and focused.
8. The change is reversible.
9. The result supports branding/localization/updateability.

---

## 11. First recommended tasks

The first tasks for this project are:

1. Create `helms-overlay/`, `patches/`, `scripts/`, and `.work/` ignore rules.
2. Create Helms brand config and Chinese terminology files.
3. Create placeholder Helms logo/favicon assets.
4. Implement overlay application script.
5. Implement patch application script.
6. Implement build script and smoke test script.
7. Scan Clawith frontend branding/localization entry points.
8. Generate the first minimal brand-entry patch.
9. Generate the first minimal Chinese localization-entry patch.

---

## 12. One-sentence operating principle

**Do not turn Helms into a deep fork yet. Keep Clawith upstream clean, keep Helms changes independent, and only build a maintainable branding/localization overlay for Helms 0.1.**
