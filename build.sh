#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
npm ci
npm run check
npm run build
npm test
