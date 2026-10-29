# Helms Patch Workflow

Patch files are the only place Helms should express required changes to Clawith entry files.

## Rules

- Keep each patch focused on one purpose.
- List every active patch in `patches/series`.
- Do not patch license, notice, attribution, database, backend runtime, A2A, Crew, Aware, Sandbox, or permission systems in Helms 0.1.
- Generate patches from `.work/clawith-helms`, never by editing `vendor/clawith` directly.

## Active Patches

- `0001-add-helms-brand-entry.patch`: connects Helms title, favicon, and login-page logo.
- `0002-add-helms-i18n-entry.patch`: connects Helms Chinese i18n overrides to Clawith i18next initialization.

## Generate a Patch

```bash
bash scripts/prepare-helms-worktree.sh
bash scripts/apply-helms-overlay.sh

# edit only the required entry files
diff -u \
  --label a/frontend/index.html \
  --label b/frontend/index.html \
  vendor/clawith/frontend/index.html \
  .work/clawith-helms/frontend/index.html \
  > patches/0001-add-helms-brand-entry.patch
```

Then add the patch filename to `patches/series` and verify:

```bash
bash scripts/apply-helms-patches.sh
bash scripts/smoke-test-helms.sh
```
