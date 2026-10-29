#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SOURCE_DIR="${REPO_ROOT}/vendor/clawith"
TARGET_REF="${1:-}"

log() {
  printf '[update-clawith-upstream] %s\n' "$1"
}

fail() {
  printf '[update-clawith-upstream] ERROR: %s\n' "$1" >&2
  exit 1
}

[[ -n "${TARGET_REF}" ]] || fail "Usage: bash scripts/update-clawith-upstream.sh <tag-or-commit>"
[[ -d "${SOURCE_DIR}" ]] || fail "Missing vendor/clawith. Run: git submodule update --init --recursive"
[[ -d "${SOURCE_DIR}/.git" || -f "${SOURCE_DIR}/.git" ]] || fail "vendor/clawith is not a Git submodule checkout"

dirty_status="$(git -C "${SOURCE_DIR}" status --short)"
[[ -z "${dirty_status}" ]] || fail "vendor/clawith has local changes; clean it before updating"

log "Fetching Clawith tags and commits"
git -C "${SOURCE_DIR}" fetch --tags origin

log "Checking out ${TARGET_REF}"
git -C "${SOURCE_DIR}" checkout "${TARGET_REF}"

new_revision="$(git -C "${SOURCE_DIR}" rev-parse --short HEAD)"
log "vendor/clawith is now at ${new_revision}"
log "Next: run bash scripts/build-helms.sh and bash scripts/smoke-test-helms.sh"

