#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
WORK_DIR="${REPO_ROOT}/.work/clawith-helms"
PACKAGE_DIR="${HELMS_DEPLOY_PACKAGE_DIR:-${REPO_ROOT}/.work/helms-deploy-package}"
TEMPLATE_DIR="${REPO_ROOT}/scripts/helms-deploy-package"
PRESERVE_DIR=""

log() {
  printf '[create-helms-deploy-package] %s\n' "$1"
}

fail() {
  printf '[create-helms-deploy-package] ERROR: %s\n' "$1" >&2
  exit 1
}

copy_dir_contents() {
  local source_dir="$1"
  local target_dir="$2"
  [[ -d "${source_dir}" ]] || fail "Missing source directory: ${source_dir}"
  mkdir -p "${target_dir}"
  cp -R "${source_dir}/." "${target_dir}/"
}

cleanup() {
  if [[ -n "${PRESERVE_DIR}" && -d "${PRESERVE_DIR}" ]]; then
    rm -rf "${PRESERVE_DIR}"
  fi
}

preserve_runtime_config() {
  local filename

  PRESERVE_DIR="$(mktemp -d "${REPO_ROOT}/.work/helms-deploy-preserve.XXXXXX")"
  chmod 700 "${PRESERVE_DIR}"
  for filename in .env ss-nodes.json; do
    if [[ -f "${PACKAGE_DIR}/${filename}" ]]; then
      cp "${PACKAGE_DIR}/${filename}" "${PRESERVE_DIR}/${filename}"
    fi
  done
}

restore_runtime_config() {
  local filename

  [[ -n "${PRESERVE_DIR}" ]] || return 0
  for filename in .env ss-nodes.json; do
    if [[ -f "${PRESERVE_DIR}/${filename}" ]]; then
      cp "${PRESERVE_DIR}/${filename}" "${PACKAGE_DIR}/${filename}"
    fi
  done
}

patch_backend_dockerfile() {
  local dockerfile="${PACKAGE_DIR}/backend/Dockerfile"
  local tmp_file="${dockerfile}.tmp"
  [[ -f "${dockerfile}" ]] || fail "Missing backend Dockerfile in package"

  awk '
    BEGIN { inserted_arg = 0 }
    /^FROM python:3\.12-slim AS deps$/ {
      if (inserted_arg == 0) {
        print "ARG HELMS_PYTHON_BASE_IMAGE=python:3.12-slim"
        inserted_arg = 1
      }
      print "FROM ${HELMS_PYTHON_BASE_IMAGE} AS deps"
      next
    }
    /^FROM python:3\.12-slim AS production$/ {
      print "FROM ${HELMS_PYTHON_BASE_IMAGE} AS production"
      next
    }
    /^COPY --from=deps \/usr\/local\/lib\/python3\.12\/site-packages\/ \/usr\/local\/lib\/python3\.12\/site-packages\/$/ {
      print "COPY --from=deps /usr/local/lib/ /usr/local/lib/"
      next
    }
    { print }
  ' "${dockerfile}" > "${tmp_file}"
  mv "${tmp_file}" "${dockerfile}"
}

case "${PACKAGE_DIR}" in
  "${REPO_ROOT}/.work/"*) ;;
  *) fail "Refusing to clean unexpected package directory: ${PACKAGE_DIR}" ;;
esac

[[ -d "${TEMPLATE_DIR}" ]] || fail "Missing deployment templates: ${TEMPLATE_DIR}"
trap cleanup EXIT

if [[ "${HELMS_DEPLOY_SKIP_BUILD:-0}" != "1" ]]; then
  log "Building Helms worktree"
  bash "${SCRIPT_DIR}/build-helms.sh"
else
  log "Skipping build because HELMS_DEPLOY_SKIP_BUILD=1"
fi

[[ -d "${WORK_DIR}/backend" ]] || fail "Missing generated backend source. Run bash scripts/build-helms.sh first."
[[ -d "${WORK_DIR}/frontend/dist" ]] || fail "Missing generated frontend dist. Run bash scripts/build-helms.sh first."

log "Running smoke test"
bash "${SCRIPT_DIR}/smoke-test-helms.sh"

log "Creating package directory: ${PACKAGE_DIR}"
preserve_runtime_config
rm -rf "${PACKAGE_DIR}"
mkdir -p "${PACKAGE_DIR}/backend"
mkdir -p "${PACKAGE_DIR}/frontend/dist"

log "Copying deployment templates"
copy_dir_contents "${TEMPLATE_DIR}" "${PACKAGE_DIR}"
restore_runtime_config

log "Copying Clawith backend source"
copy_dir_contents "${WORK_DIR}/backend" "${PACKAGE_DIR}/backend"
patch_backend_dockerfile

log "Copying Helms frontend dist"
copy_dir_contents "${WORK_DIR}/frontend/dist" "${PACKAGE_DIR}/frontend/dist"

if [[ -f "${REPO_ROOT}/vendor/clawith/LICENSE" ]]; then
  cp "${REPO_ROOT}/vendor/clawith/LICENSE" "${PACKAGE_DIR}/CLAWITH-LICENSE"
fi

if [[ -f "${WORK_DIR}/.helms-upstream-revision" ]]; then
  cp "${WORK_DIR}/.helms-upstream-revision" "${PACKAGE_DIR}/HELMS-UPSTREAM-REVISION"
fi

if [[ "${HELMS_DEPLOY_CREATE_ARCHIVE:-0}" == "1" ]]; then
  log "Creating archive"
  tar -C "$(dirname "${PACKAGE_DIR}")" -czf "${PACKAGE_DIR}.tar.gz" "$(basename "${PACKAGE_DIR}")"
  log "Archive: ${PACKAGE_DIR}.tar.gz"
fi

log "Done"
log "Package: ${PACKAGE_DIR}"
if [[ -f "${PACKAGE_DIR}/.env" ]]; then
  log "Runtime config preserved: ${PACKAGE_DIR}/.env"
  log "Next: cd ${PACKAGE_DIR} && docker compose up --build -d"
else
  log "Next: cd ${PACKAGE_DIR} && cp .env.example .env && docker compose up --build -d"
fi
