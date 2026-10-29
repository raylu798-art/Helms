# Helms AI数字员工工作台

Helms is an enterprise AI digital employee workbench based on the open-source Clawith project.

The current phase is **Helms 0.1: Branding + Chinese Localization White-label Version**. This repository keeps Clawith upstream clean and applies Helms-owned branding, Chinese terminology, scripts, and small entry patches through a Submodule + Overlay + Patch workflow.

## Helms 0.1 Status

Helms 0.1 is in release finalization state:

- The Clawith upstream baseline is pinned to `v1.11.1` (`c8ae41c`).
- Helms title, favicon, logo, login branding, and core Chinese terminology are connected through overlay and patches.
- Group collaboration and Experience Plaza terminology are covered by the Helms i18n overlay.
- The favicon uses `/helms/favicon.svg?v=20260622` to avoid stale browser tab icon caches.
- The generated frontend can be built, smoke-tested, packaged, and served through the executable deployment package.
- The backend remains Clawith runtime; Helms 0.1 does not add backend APIs, database models, or runtime services.

## Repository Layout

```text
vendor/clawith/                 # Clawith upstream submodule
helms-overlay/                  # Helms-owned branding and localization files
patches/                        # Minimal entry patches applied to the temp worktree
scripts/                        # Prepare, overlay, patch, build, smoke-test, update scripts
docs/                           # Product, architecture, rules, workflow, acceptance docs
.work/clawith-helms/            # Temporary generated worktree, ignored by Git
```

## First-Time Setup

```bash
git init
git submodule add https://github.com/dataelement/Clawith.git vendor/clawith
```

If the submodule already exists:

```bash
git submodule update --init --recursive
```

## Common Commands

```bash
bash scripts/prepare-helms-worktree.sh
bash scripts/apply-helms-overlay.sh
bash scripts/apply-helms-patches.sh
bash scripts/build-helms.sh
bash scripts/smoke-test-helms.sh
bash scripts/start-helms-visual-check.sh
bash scripts/check-helms-deploy-prereqs.sh
bash scripts/create-helms-deploy-package.sh
```

`start-helms-visual-check.sh` starts a local mock API and Helms frontend for browser-based visual acceptance. Open the URL printed by the script, usually:

```text
http://127.0.0.1:3020/?token=visual-check
```

## Deployment Package

Create a local executable deployment package:

```bash
bash scripts/create-helms-deploy-package.sh
```

The package is generated under `.work/helms-deploy-package` and includes:

- prebuilt Helms frontend static assets;
- Clawith backend source from the generated Helms worktree;
- Docker Compose templates for frontend, backend, PostgreSQL, Redis, and optional MinIO;
- `.env.example` and deployment README.

For detailed production notes, see `docs/08-real-deployment-guide.md`.

## Acceptance And Follow-Up

- `docs/05-white-label-workflow.md` describes the rebuild, build, smoke-test, and local visual-check workflow.
- `docs/06-helms-0.1-final-acceptance.md` records the Helms 0.1 acceptance result and known boundaries.
- `docs/07-helms-0.2-backlog.md` lists candidate 0.2 work without implementing it in the current phase.
- `docs/08-real-deployment-guide.md` outlines real deployment with a static Helms frontend, Clawith backend, `/api` reverse proxy, environment variables, PostgreSQL, Redis, and object storage.

## Helms 0.1 Boundaries

- Keep `vendor/clawith` clean.
- Put Helms-owned files in `helms-overlay/`.
- Express required Clawith entry changes as focused patch files under `patches/`.
- Use `.work/clawith-helms` for generated build state.
- Do not modify backend runtime, database models, A2A, Crew, Aware, Sandbox, permissions, or license/attribution files in Helms 0.1.
