#!/usr/bin/env bash
set -euo pipefail

log() {
  printf '[check-helms-deploy-prereqs] %s\n' "$1"
}

fail() {
  printf '[check-helms-deploy-prereqs] ERROR: %s\n' "$1" >&2
  exit 1
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

command_exists docker || fail "docker is required. Install Docker Desktop or OrbStack first."

if ! docker info >/dev/null 2>&1; then
  fail "Docker daemon is not reachable. Start Docker Desktop or OrbStack, wait until it is running, then retry."
fi

if docker compose version >/dev/null 2>&1; then
  log "Docker Compose is available"
else
  fail "docker compose is required"
fi

log "Docker daemon is reachable"
log "Deployment prerequisites passed"
