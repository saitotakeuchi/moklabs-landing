#!/bin/bash

# Vercel Ignore Build Script for Monorepo
# This script determines if Vercel should skip the build based on what files changed.
# Exit code 0 = skip build, Exit code 1 = run build

# Define paths that should trigger a build when changed
TRIGGER_PATHS=(
  "apps/web"
  "packages/pnld-types"
  "package.json"
  "pnpm-lock.yaml"
  "turbo.json"
  "pnpm-workspace.yaml"
)

# Get the previous commit (the one being deployed from)
PREVIOUS_COMMIT=${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}
CURRENT_COMMIT=${VERCEL_GIT_COMMIT_SHA:-HEAD}

echo "Checking for changes between $PREVIOUS_COMMIT and $CURRENT_COMMIT"

# Check if any of the trigger paths have changes
for path in "${TRIGGER_PATHS[@]}"; do
  if git diff --quiet "$PREVIOUS_COMMIT" "$CURRENT_COMMIT" -- "$path"; then
    # No changes in this path
    :
  else
    # Changes detected in this path
    echo "✅ Changes detected in: $path"
    echo "🚀 Proceeding with build..."
    exit 1
  fi
done

# No changes in any trigger paths
echo "⏭️  No relevant changes detected in web app or dependencies"
echo "🚫 Skipping build..."
exit 0
