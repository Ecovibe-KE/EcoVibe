#!/bin/bash

# A script to automate the process of formatting, linting, committing, and pushing a feature branch.
# Exits immediately if a command exits with a non-zero status.
set -e

# --- 1. Check for commit message ---
if [ -z "$1" ]; then
    echo "❌ Error: Commit message is required."
    echo "Usage: ./scripts/propose-changes.sh \"feat: your commit message\""
    exit 1
fi

COMMIT_MESSAGE=$1

# --- 2. Check current branch ---
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "ℹ️  Current branch is '$CURRENT_BRANCH'."

if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "develop" ]]; then
  echo "❌ Error: Direct commits to 'main' or 'develop' are not allowed by this script."
  echo "Please use a feature or hotfix branch."
  exit 1
fi

# --- 3. Lint and Format Backend (Python/Flask) ---
echo "💅 Formatting Python code with Black..."
black server/

echo "🔍 Linting Python code with Flake8..."
if ! flake8 server/; then
    echo "------------------------------------------------"
    echo "🔥 Flake8 found issues that could not be auto-fixed."
    echo "Please fix the issues above and try again."
    echo "------------------------------------------------"
    exit 1
fi
echo "✅ Python code looks good."

# --- 4. Lint and Format Frontend (JavaScript/React) ---
echo "💅 Formatting frontend code with Prettier..."
npx prettier --write "client/src/**/*.{js,jsx,ts,tsx,json,css,md}" --ignore-unknown

echo "🔍 Linting and fixing frontend code with ESLint..."
npx eslint --fix "client/src/**/*.{js,jsx,ts,tsx}"

echo "🔍 Checking for remaining ESLint issues..."
if ! npx eslint "client/src/**/*.{js,jsx,ts,tsx}"; then
    echo "------------------------------------------------"
    echo "🔥 ESLint found issues that could not be auto-fixed."
    echo "Please fix the issues above and try again."
    echo "------------------------------------------------"
    exit 1
fi
echo "✅ Frontend code looks good."

# --- 5. Git Commit ---
echo "➕ Staging changes..."
git add .

if git diff --staged --quiet; then
  echo "ℹ️  No changes to commit. Your working tree is clean."
else
  echo "📝 Committing changes with message: \"$COMMIT_MESSAGE\""
  git commit -m "$COMMIT_MESSAGE"
fi

# --- 6. Sync with remote 'develop' ---
echo "🔄 Syncing with 'develop' branch from origin..."
git pull origin develop

# --- 7. Git Push ---
echo "🚀 Pushing changes to remote..."
git push origin "$CURRENT_BRANCH"

# --- 8. Final Instructions ---
echo ""
echo "================================================================"
echo "✅ Successfully pushed '$CURRENT_BRANCH' to remote."
echo "🎉 Next step: Go to GitHub to create your Pull Request."
echo "   Target branch should be 'develop'."
echo "================================================================"

exit 0