#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}" && pwd)"
BACKEND_DIR="${REPO_ROOT}/backend"
FRONTEND_DIR="${REPO_ROOT}/frontend"

backend_pid=""
frontend_pid=""
shutdown_requested="false"

require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: ${command_name}" >&2
    exit 1
  fi
}

cleanup() {
  local exit_code=$?

  trap - EXIT INT TERM

  if [[ "$shutdown_requested" == "true" ]]; then
    exit_code=0
  fi

  if [[ -n "$frontend_pid" ]] && kill -0 "$frontend_pid" >/dev/null 2>&1; then
    kill "$frontend_pid" >/dev/null 2>&1 || true
    wait "$frontend_pid" >/dev/null 2>&1 || true
  fi

  if [[ -n "$backend_pid" ]] && kill -0 "$backend_pid" >/dev/null 2>&1; then
    kill "$backend_pid" >/dev/null 2>&1 || true
    wait "$backend_pid" >/dev/null 2>&1 || true
  fi

  exit "$exit_code"
}

handle_interrupt() {
  shutdown_requested="true"
  exit 0
}

wait_for_first_exit() {
  while true; do
    if ! kill -0 "$backend_pid" >/dev/null 2>&1; then
      wait "$backend_pid"
      return $?
    fi

    if ! kill -0 "$frontend_pid" >/dev/null 2>&1; then
      wait "$frontend_pid"
      return $?
    fi

    sleep 1
  done
}

require_command npm
require_command java
require_command chmod

if [[ ! -x "${BACKEND_DIR}/gradlew" ]]; then
  chmod +x "${BACKEND_DIR}/gradlew"
fi

trap cleanup EXIT
trap handle_interrupt INT TERM

echo "Starting backend on http://localhost:8080 ..."
(
  cd "$BACKEND_DIR"
  ./gradlew bootRun --console=plain
) &
backend_pid=$!

echo "Starting frontend dev server (default port: http://localhost:5173) ..."
(
  cd "$FRONTEND_DIR"
  npm run dev
) &
frontend_pid=$!

echo "Development servers are launching. Press Ctrl+C to stop both processes."

wait_for_first_exit

