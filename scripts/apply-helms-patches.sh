#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TARGET_DIR="${1:-${REPO_ROOT}/.work/clawith-helms}"
PATCH_DIR="${REPO_ROOT}/patches"
SERIES_FILE="${PATCH_DIR}/series"

log() {
  printf '[apply-helms-patches] %s\n' "$1"
}

fail() {
  printf '[apply-helms-patches] ERROR: %s\n' "$1" >&2
  exit 1
}

[[ -d "${TARGET_DIR}" ]] || fail "Target directory does not exist: ${TARGET_DIR}"
[[ -f "${SERIES_FILE}" ]] || fail "Missing patches/series"

applied_count=0

while IFS= read -r raw_line || [[ -n "${raw_line}" ]]; do
  patch_name="$(printf '%s' "${raw_line}" | sed 's/[[:space:]]*#.*$//;s/^[[:space:]]*//;s/[[:space:]]*$//')"
  [[ -n "${patch_name}" ]] || continue

  patch_file="${PATCH_DIR}/${patch_name}"
  [[ -f "${patch_file}" ]] || fail "Patch listed in series does not exist: ${patch_name}"

  log "Checking ${patch_name}"
  if ! git -C "${TARGET_DIR}" apply --check "${patch_file}"; then
    fail "Patch check failed: ${patch_name}"
  fi

  log "Applying ${patch_name}"
  if ! git -C "${TARGET_DIR}" apply "${patch_file}"; then
    fail "Patch apply failed: ${patch_name}"
  fi

  applied_count=$((applied_count + 1))
done < "${SERIES_FILE}"

if [[ "${applied_count}" -eq 0 ]]; then
  log "No active patches in patches/series; nothing to apply"
else
  log "Applied ${applied_count} patch(es)"
fi

