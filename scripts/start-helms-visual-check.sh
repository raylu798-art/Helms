#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
WORK_DIR="${REPO_ROOT}/.work/clawith-helms"
FRONTEND_DIR="${WORK_DIR}/frontend"

API_HOST="${HELMS_VISUAL_API_HOST:-127.0.0.1}"
API_PORT="${HELMS_VISUAL_API_PORT:-8020}"
FRONTEND_HOST="${HELMS_VISUAL_FRONTEND_HOST:-127.0.0.1}"
FRONTEND_PORT="${HELMS_VISUAL_FRONTEND_PORT:-3020}"
TOKEN="${HELMS_VISUAL_TOKEN:-visual-check}"

log() {
  printf '[start-helms-visual-check] %s\n' "$1"
}

fail() {
  printf '[start-helms-visual-check] ERROR: %s\n' "$1" >&2
  exit 1
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

port_in_use() {
  local port="$1"
  if command_exists lsof; then
    lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1
    return $?
  fi
  return 1
}

ensure_worktree() {
  if [[ -f "${FRONTEND_DIR}/package.json" ]]; then
    return
  fi

  log "Preparing Helms worktree because ${FRONTEND_DIR}/package.json is missing"
  bash "${SCRIPT_DIR}/prepare-helms-worktree.sh"
  bash "${SCRIPT_DIR}/apply-helms-overlay.sh" "${WORK_DIR}"
  bash "${SCRIPT_DIR}/apply-helms-patches.sh" "${WORK_DIR}"
}

cleanup() {
  if [[ -n "${API_PID:-}" ]]; then
    kill "${API_PID}" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

command_exists node || fail "node is required"
command_exists npm || fail "npm is required"

ensure_worktree

[[ -d "${FRONTEND_DIR}/node_modules" ]] || fail "Missing ${FRONTEND_DIR}/node_modules. Run bash scripts/build-helms.sh once, or install frontend dependencies in ${FRONTEND_DIR}."
[[ -f "${SCRIPT_DIR}/helms-visual-mock-api.mjs" ]] || fail "Missing scripts/helms-visual-mock-api.mjs"

if port_in_use "${API_PORT}"; then
  fail "API port ${API_PORT} is already in use. Set HELMS_VISUAL_API_PORT to another port."
fi

if port_in_use "${FRONTEND_PORT}"; then
  fail "Frontend port ${FRONTEND_PORT} is already in use. Set HELMS_VISUAL_FRONTEND_PORT to another port."
fi

if [[ "${HELMS_VISUAL_DRY_RUN:-0}" == "1" ]]; then
  log "Dry run passed"
  log "Visual URL would be: http://${FRONTEND_HOST}:${FRONTEND_PORT}/?token=${TOKEN}"
  exit 0
fi

log "Starting visual mock API on http://${API_HOST}:${API_PORT}"
HELMS_VISUAL_API_HOST="${API_HOST}" node "${SCRIPT_DIR}/helms-visual-mock-api.mjs" "${API_PORT}" &
API_PID="$!"

log "Starting Helms frontend on http://${FRONTEND_HOST}:${FRONTEND_PORT}"
log "Open: http://${FRONTEND_HOST}:${FRONTEND_PORT}/?token=${TOKEN}"
log "Suggested routes: /login, /plaza, /dashboard, /agents/agent-research/chat, /agents/agent-research/settings#tools, /agents/agent-research/settings#relationships, /agents/agent-research/settings#settings, /agents/agent-research/settings#approvals, /enterprise, /enterprise#users, /enterprise#tools, /enterprise#skills, /admin/platform-settings"

cd "${FRONTEND_DIR}"
BACKEND_PORT="${API_PORT}" npm run dev -- --host "${FRONTEND_HOST}" --port "${FRONTEND_PORT}"
