#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SOURCE_DIR="${REPO_ROOT}/vendor/clawith"
WORK_PARENT="${REPO_ROOT}/.work"
WORK_DIR="${WORK_PARENT}/clawith-helms"

log() {
  printf '[prepare-helms-worktree] %s\n' "$1"
}

fail() {
  printf '[prepare-helms-worktree] ERROR: %s\n' "$1" >&2
  exit 1
}

diagnose_work_dir_cleanup_failure() {
  printf '[prepare-helms-worktree] ERROR: Failed to clean .work/clawith-helms\n' >&2
  printf '[prepare-helms-worktree] HINT: Stop any running Helms dev/visual-check server before rebuilding.\n' >&2
  if command -v lsof >/dev/null 2>&1; then
    printf '[prepare-helms-worktree] HINT: Current common Helms ports:\n' >&2
    lsof -nP -iTCP:3020 -sTCP:LISTEN >&2 || true
    lsof -nP -iTCP:8020 -sTCP:LISTEN >&2 || true
  fi
  printf '[prepare-helms-worktree] HINT: You can usually stop the server with Ctrl-C in the terminal that started scripts/start-helms-visual-check.sh.\n' >&2
  exit 1
}

case "${WORK_DIR}" in
  "${REPO_ROOT}/.work/"*) ;;
  *) fail "Refusing to clean unexpected work directory: ${WORK_DIR}" ;;
esac

[[ -d "${SOURCE_DIR}" ]] || fail "Missing vendor/clawith. Run: git submodule update --init --recursive"
[[ -d "${SOURCE_DIR}/.git" || -f "${SOURCE_DIR}/.git" ]] || fail "vendor/clawith is not a Git submodule checkout"

dirty_status="$(git -C "${SOURCE_DIR}" status --short)"
[[ -z "${dirty_status}" ]] || fail "vendor/clawith has local changes; clean it before preparing Helms worktree"

mkdir -p "${WORK_PARENT}"
rm -rf "${WORK_DIR}" || diagnose_work_dir_cleanup_failure
mkdir -p "${WORK_DIR}"

log "Exporting clean Clawith snapshot to .work/clawith-helms"
git -C "${SOURCE_DIR}" archive --format=tar HEAD | tar -x -C "${WORK_DIR}"
git -C "${SOURCE_DIR}" rev-parse HEAD > "${WORK_DIR}/.helms-upstream-revision"

log "Done"
