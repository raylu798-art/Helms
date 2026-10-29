#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TARGET_DIR="${1:-${REPO_ROOT}/.work/clawith-helms}"
OVERLAY_DIR="${REPO_ROOT}/helms-overlay/frontend"

log() {
  printf '[apply-helms-overlay] %s\n' "$1"
}

fail() {
  printf '[apply-helms-overlay] ERROR: %s\n' "$1" >&2
  exit 1
}

[[ -d "${TARGET_DIR}" ]] || fail "Target directory does not exist: ${TARGET_DIR}"
[[ -d "${OVERLAY_DIR}/public/helms" ]] || fail "Missing overlay public assets"
[[ -d "${OVERLAY_DIR}/src/helms" ]] || fail "Missing overlay source files"

mkdir -p "${TARGET_DIR}/frontend/public/helms"
mkdir -p "${TARGET_DIR}/frontend/src/helms"

log "Copying Helms public assets"
cp -R "${OVERLAY_DIR}/public/helms/." "${TARGET_DIR}/frontend/public/helms/"

log "Copying Helms source overlay"
cp -R "${OVERLAY_DIR}/src/helms/." "${TARGET_DIR}/frontend/src/helms/"

log "Done"

