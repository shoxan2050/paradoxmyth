#!/bin/bash

# ============================================================
# SOZLAMALAR
# ============================================================
# GitHub Tokeningizni quyidagi tirnoq ichiga yozing:
TOKEN="SIZNING_TOKENINGIZ"
# GitHub Username va Repo nomi:
USER="SIZNING_USERNAME"
REPO="edu-platform-react"
# ============================================================

REPO_URL="https://$TOKEN@github.com/$USER/$REPO.git"

echo "----------------------------------------------------"
echo "   GitHub'ga Avtomatik Yuklash (Git Bash)"
echo "----------------------------------------------------"

# Git init agar bo'lmasa
if [ ! -d ".git" ]; then
    echo "→ Git initializatsiya qilinmoqda..."
    git init
    git branch -M main
fi

# Remote origin-ni yangilash
git remote remove origin 2>/dev/null
git remote add origin "$REPO_URL"

echo "→ Fayllar qo'shilmoqda..."
git add .

echo "→ Commit qilinmoqda..."
git commit -m "🚀 Auto-upload via script: $(date)"

echo "→ GitHub'ga yuklanmoqda (Push)..."
git push -u origin main --force

echo "----------------------------------------------------"
echo "  ✅ TAYYOR! Loyihangiz GitHub'ga yuklandi."
echo "----------------------------------------------------"
