#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${SCRIPT_DIR}"
BACKEND_DIR="${REPO_ROOT}/backend"
FRONTEND_DIR="${REPO_ROOT}/frontend"

require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: ${command_name}" >&2
    exit 1
  fi
}

require_command python3
require_command npm
require_command java
require_command chmod

if [[ ! -x "${BACKEND_DIR}/gradlew" ]]; then
  chmod +x "${BACKEND_DIR}/gradlew"
fi

echo "Running backend tests with JaCoCo coverage..."
(
  cd "${BACKEND_DIR}"
  ./gradlew test jacocoTestReport --console=plain
)

echo "Running frontend tests with Vitest coverage..."
(
  cd "${FRONTEND_DIR}"
  npm run test:coverage
)

echo "Generating project overview artifacts..."
python3 "${REPO_ROOT}/scripts/generate_project_overview.py"

echo "Done. Open docs/project-overview.html in your browser."

