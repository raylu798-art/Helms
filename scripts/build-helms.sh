#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
WORK_DIR="${REPO_ROOT}/.work/clawith-helms"

log() {
  printf '[build-helms] %s\n' "$1"
}

fail() {
  printf '[build-helms] ERROR: %s\n' "$1" >&2
  exit 1
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

log "Preparing Helms worktree"
bash "${SCRIPT_DIR}/prepare-helms-worktree.sh"

log "Applying Helms overlay"
bash "${SCRIPT_DIR}/apply-helms-overlay.sh" "${WORK_DIR}"

log "Applying Helms patches"
bash "${SCRIPT_DIR}/apply-helms-patches.sh" "${WORK_DIR}"

if [[ -f "${WORK_DIR}/frontend/package.json" ]]; then
  FRONTEND_DIR="${WORK_DIR}/frontend"
elif [[ -f "${WORK_DIR}/package.json" ]]; then
  FRONTEND_DIR="${WORK_DIR}"
else
  fail "Cannot find package.json in .work/clawith-helms or .work/clawith-helms/frontend"
fi

export HELMS_PRODUCT_NAME="Helms"
export HELMS_PRODUCT_FULL_NAME="Helms AI数字员工工作台"
export HELMS_DEFAULT_LOCALE="zh-CN"

cd "${FRONTEND_DIR}"

if [[ -f pnpm-lock.yaml ]]; then
  command_exists pnpm || fail "pnpm is required because pnpm-lock.yaml exists"
  [[ "${HELMS_SKIP_INSTALL:-0}" == "1" ]] || pnpm install --frozen-lockfile
  pnpm run build
elif [[ -f yarn.lock ]]; then
  command_exists yarn || fail "yarn is required because yarn.lock exists"
  [[ "${HELMS_SKIP_INSTALL:-0}" == "1" ]] || yarn install --frozen-lockfile
  yarn build
elif [[ -f package-lock.json ]]; then
  command_exists npm || fail "npm is required because package-lock.json exists"
  [[ "${HELMS_SKIP_INSTALL:-0}" == "1" ]] || npm ci
  npm run build
else
  command_exists npm || fail "npm is required to build the frontend"
  [[ "${HELMS_SKIP_INSTALL:-0}" == "1" ]] || npm install
  npm run build
fi

log "Done"

