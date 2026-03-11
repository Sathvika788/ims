# GitHub Upload - Git Size Fix Guide

## Problem
Your repository is >1GB due to `node_modules/`, `__pycache__/`, and other large files being tracked by Git.

## Solution

### Step 1: Remove Files from Git Cache (Keep Locally)

Run these commands in your project root:

```bash
# Remove node_modules from Git (keeps it locally)
git rm -r --cached node_modules/
git rm -r --cached frontend/dist/
git rm -r --cached backend/__pycache__/

# Remove all __pycache__ directories
git rm -r --cached "backend/app/__pycache__/"
git rm -r --cached "backend/app/*/__pycache__/"
git rm -r --cached "backend/app/*/*/__pycache__/"

# Remove .env files if tracked
git rm -r --cached .env 2>/dev/null || true
git rm -r --cached .env.production 2>/dev/null || true
git rm -r --cached .env.local 2>/dev/null || true

# Remove any .pyc or .pyo files
find . -type f -name "*.pyc" -delete
find . -type f -name "*.pyo" -delete
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
```

### Step 2: Commit the .gitignore Update

```bash
git add .gitignore
git commit -m "Add comprehensive .gitignore to exclude large files"
```

### Step 3: Clean Up Git History

If the above doesn't work (files still tracked), use git filter:

```bash
# WARNING: This rewrites Git history on the current branch
# Do this BEFORE pushing to GitHub

# Remove node_modules from entire history
git filter-repo --path node_modules --invert-paths

# Remove __pycache__ from entire history  
git filter-repo --path "*/\__pycache__" --invert-paths

# Remove dist/ from entire history
git filter-repo --path frontend/dist --invert-paths

# Force push (ONLY if you haven't pushed to GitHub yet)
git push --force --all origin
```

### Step 4: Check Repository Size

```bash
# Check current size
git rev-parse --git-dir
du -sh .git

# Should now be <100MB
```

### Step 5: Push to GitHub

```bash
# If you haven't pushed yet:
git push origin main

# If already has content on GitHub, you may need to:
git push --force origin main  # (only if no one else is using it)
```

---

## Quick Fix (Fastest)

If just starting with GitHub, the easiest solution:

```bash
# Fresh start
rm -rf .git
git init
git add . --force  # Only adds what's in .gitignore
git commit -m "Initial commit with proper .gitignore"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ims.git
git push -u origin main
```

---

## Verify Before Pushing

```bash
# Check what's staged
git status

# Should NOT include:
# - node_modules/
# - __pycache__/
# - frontend/dist/
# - .env files

# If these appear, run this to unstage:
git reset
git add .gitignore
git commit -m "Fix .gitignore"
```

---

## Install Required Tools (for git filter-repo)

If you need git filter-repo:

```bash
# Windows (PowerShell)
pip install git-filter-repo

# Or use Homebrew (Mac)
brew install git-filter-repo

# Verify
git filter-repo --version
```

---

## Recommended Process

1. ✅ **Updated .gitignore** - Already done
2. Run `git rm -r --cached` commands (Step 1)
3. Commit .gitignore (Step 2)
4. Push to GitHub (Step 5)

This should reduce your repo size to <50MB!

---

## If Still Having Issues

```bash
# Force a complete fresh push
git push --set-upstream origin main --force

# Or delete and recreate remote branch
git push origin :main  # Delete remote main
git push -u origin main  # Create fresh main
```

---

## Verify Success

After pushing to GitHub, check:

1. Go to your GitHub repo
2. Settings → Storage
3. Should show repo <50MB

Done! Your project will now upload successfully. 🎉
