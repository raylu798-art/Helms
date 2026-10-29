#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
WORK_DIR="${REPO_ROOT}/.work/clawith-helms"

log() {
  printf '[smoke-test-helms] %s\n' "$1"
}

fail() {
  printf '[smoke-test-helms] ERROR: %s\n' "$1" >&2
  exit 1
}

require_file() {
  [[ -f "${REPO_ROOT}/$1" ]] || fail "Missing file: $1"
}

require_dir() {
  [[ -d "${REPO_ROOT}/$1" ]] || fail "Missing directory: $1"
}

require_contains() {
  local file="$1"
  local text="$2"
  grep -Fq "${text}" "${REPO_ROOT}/${file}" || fail "${file} does not contain required text: ${text}"
}

log "Checking repository skeleton"
require_file "AGENTS.md"
require_file ".gitignore"
require_file ".gitmodules"
require_dir "docs"
require_dir "helms-overlay"
require_dir "patches"
require_dir "scripts"
require_file "patches/series"
require_file "docs/06-helms-0.1-final-acceptance.md"
require_file "docs/07-helms-0.2-backlog.md"
require_file "scripts/start-helms-visual-check.sh"
require_file "scripts/helms-visual-mock-api.mjs"

log "Checking overlay files"
require_file "helms-overlay/frontend/src/helms/brand.config.ts"
require_file "helms-overlay/frontend/src/helms/terminology.zh-CN.ts"
require_file "helms-overlay/frontend/src/helms/i18n-overrides.zh-CN.ts"
require_file "helms-overlay/frontend/src/helms/helms-ui-text.ts"
require_file "helms-overlay/frontend/public/helms/logo.svg"
require_file "helms-overlay/frontend/public/helms/logo-mark.svg"
require_file "helms-overlay/frontend/public/helms/favicon.svg"
require_file "helms-overlay/frontend/public/helms/favicon.ico.placeholder.md"

require_contains "helms-overlay/frontend/src/helms/brand.config.ts" "Helms AI数字员工工作台"
require_contains "helms-overlay/frontend/src/helms/terminology.zh-CN.ts" "数字员工"
require_contains "helms-overlay/frontend/src/helms/i18n-overrides.zh-CN.ts" "app:"
require_contains "helms-overlay/frontend/src/helms/i18n-overrides.zh-CN.ts" "login:"
require_contains "helms-overlay/frontend/src/helms/i18n-overrides.zh-CN.ts" "experience:"
require_contains "helms-overlay/frontend/src/helms/i18n-overrides.zh-CN.ts" "groups:"
require_contains ".gitignore" ".work/"
require_contains ".gitignore" ".DS_Store"
require_contains ".gitmodules" "https://github.com/dataelement/Clawith.git"
require_contains "docs/06-helms-0.1-final-acceptance.md" "Mock API 边界"
require_contains "docs/07-helms-0.2-backlog.md" "不代表当前已经进入实现"

log "Checking patch series"
require_file "patches/0001-add-helms-brand-entry.patch"
require_file "patches/0002-add-helms-i18n-entry.patch"
require_contains "patches/series" "0001-add-helms-brand-entry.patch"
require_contains "patches/series" "0002-add-helms-i18n-entry.patch"

log "Checking visual acceptance helper"
require_contains "scripts/start-helms-visual-check.sh" "HELMS_VISUAL_FRONTEND_PORT"
require_contains "scripts/helms-visual-mock-api.mjs" "agentTools"
require_contains "scripts/helms-visual-mock-api.mjs" "with-config"
require_contains "scripts/helms-visual-mock-api.mjs" "/enterprise/stats"
require_contains "scripts/helms-visual-mock-api.mjs" "/skills/settings/token"
require_contains "scripts/helms-visual-mock-api.mjs" "/onboarding/personal-assistant"
require_contains "scripts/helms-visual-mock-api.mjs" "/admin/platform-settings"
require_contains "scripts/helms-visual-mock-api.mjs" "relationships"

log "Checking Clawith submodule"
if [[ -d "${REPO_ROOT}/vendor/clawith" ]]; then
  submodule_status="$(git -C "${REPO_ROOT}/vendor/clawith" status --short)"
  [[ -z "${submodule_status}" ]] || fail "vendor/clawith has local changes"
else
  fail "Missing vendor/clawith submodule. Run: git submodule update --init --recursive"
fi

if [[ -d "${WORK_DIR}" ]]; then
  log "Checking generated worktree overlay"
  [[ -f "${WORK_DIR}/frontend/src/helms/brand.config.ts" ]] || fail "Worktree missing Helms brand config"
  [[ -f "${WORK_DIR}/frontend/public/helms/logo.svg" ]] || fail "Worktree missing Helms logo"
  grep -Fq "数字员工" "${WORK_DIR}/frontend/src/helms/terminology.zh-CN.ts" || fail "Worktree terminology missing 数字员工"

  log "Checking generated worktree brand and i18n entries"
  grep -Fq '<title>Helms AI数字员工工作台</title>' "${WORK_DIR}/frontend/index.html" || fail "Worktree index.html missing Helms title"
  grep -Fq 'href="/helms/favicon.svg?v=20260622"' "${WORK_DIR}/frontend/index.html" || fail "Worktree index.html missing Helms favicon"
  grep -Fq "helmsBrandConfig.logoPath" "${WORK_DIR}/frontend/src/components/atlas/AtlasFrame.tsx" || fail "Worktree AtlasFrame missing Helms logo entry"
  grep -Fq "helmsI18nOverridesZhCN" "${WORK_DIR}/frontend/src/i18n/index.ts" || fail "Worktree i18n missing Helms override import"
  grep -Fq "helmsZh" "${WORK_DIR}/frontend/src/i18n/index.ts" || fail "Worktree i18n missing Helms zh merge"
  grep -Fq 'groups: term.group' "${WORK_DIR}/frontend/src/helms/i18n-overrides.zh-CN.ts" || fail "Worktree i18n missing Helms group terminology"
  grep -Fq 'title: `${term.experience}库`' "${WORK_DIR}/frontend/src/helms/i18n-overrides.zh-CN.ts" || fail "Worktree i18n missing Helms experience terminology"
fi

if [[ -d "${REPO_ROOT}/.git" ]]; then
  work_status="$(git -C "${REPO_ROOT}" status --short -- .work || true)"
  [[ -z "${work_status}" ]] || fail ".work/ appears in Git status"
fi

log "Smoke test passed"
