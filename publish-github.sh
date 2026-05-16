#!/usr/bin/env bash
set -euo pipefail

REPO_FULL_NAME="JuJu78/chatgpt-visible-trace-exporter"

git init
git add .
git commit -m "Initial public bookmarklet release"
git branch -M main
git remote add origin "https://github.com/${REPO_FULL_NAME}.git"
git push -u origin main
