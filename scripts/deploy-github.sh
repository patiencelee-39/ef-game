#!/bin/bash
# ============================================
# deploy-github.sh — 同步遊戲檔案到 GitHub 倉庫
# ============================================
# 用法：  bash deploy-github.sh [commit message]
# 範例：  bash deploy-github.sh "新增場地主題配色"
#
# 此腳本會：
#   1. 將 VScode 目錄的遊戲相關檔案同步到 GitHub 目錄
#   2. 自動 git add → commit → push
#
# ⚠️ 首次使用前請確認：
#   - GitHub 目錄的 git remote 已設定
#   - 已登入 GitHub（SSH key 或 credential helper）
# ============================================

set -euo pipefail

# === 路徑設定 ===
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE_DIR="$SCRIPT_DIR"
GITHUB_DIR="/Users/patiencelee38/Documents/Thesis II/期刊/2026幼兒教育暨早期療育理論與實務學術研討會徵稿資訊(台中教大幼教系)/GitHub"

# === 同步的檔案/資料夾清單 ===
SYNC_ITEMS=(
  "index.html"
  "privacy.html"
  "manifest.json"
  "robots.txt"
  "sitemap.xml"
  "sw.js"
  "css/"
  "js/"
  "assets/"
  "multiplayer/"
  "singleplayer/"
  "firebase.json"
  "firestore.rules"
  "firestore.indexes.json"
  "database.rules.json"
  "README.md"
)

# === 排除項目 ===
EXCLUDE_ITEMS=(
  "node_modules"
  ".DS_Store"
  "*.md.bak"
  "Icon*"
)

# === 顏色輸出 ===
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 開始同步遊戲檔案到 GitHub...${NC}"
echo "   來源：$SOURCE_DIR"
echo "   目標：$GITHUB_DIR"
echo ""

# 檢查 GitHub 目錄是否為 git repo
if [ ! -d "$GITHUB_DIR/.git" ]; then
  echo -e "${RED}❌ GitHub 目錄不是 git 倉庫，請先執行 git init${NC}"
  exit 1
fi

# 建立 rsync 排除參數
EXCLUDE_ARGS=""
for item in "${EXCLUDE_ITEMS[@]}"; do
  EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude=$item"
done

# 同步每個項目
SYNCED=0
for item in "${SYNC_ITEMS[@]}"; do
  if [ -e "$SOURCE_DIR/$item" ]; then
    # 如果是資料夾，確保目標存在
    if [ -d "$SOURCE_DIR/$item" ]; then
      mkdir -p "$GITHUB_DIR/$item"
      rsync -av --delete $EXCLUDE_ARGS "$SOURCE_DIR/$item" "$GITHUB_DIR/" 2>/dev/null
    else
      rsync -av $EXCLUDE_ARGS "$SOURCE_DIR/$item" "$GITHUB_DIR/$item" 2>/dev/null
    fi
    SYNCED=$((SYNCED + 1))
  else
    echo -e "${YELLOW}  ⚠️ 跳過不存在的項目：$item${NC}"
  fi
done

echo ""
echo -e "${GREEN}✅ 已同步 $SYNCED 個項目${NC}"
echo ""

# Git 操作
cd "$GITHUB_DIR"

# 顯示變更摘要
CHANGES=$(git status --short | wc -l | tr -d ' ')
if [ "$CHANGES" -eq 0 ]; then
  echo -e "${YELLOW}📋 沒有任何變更，跳過 git 提交${NC}"
  exit 0
fi

echo -e "📋 變更檔案數：$CHANGES"
git status --short | head -20
if [ "$CHANGES" -gt 20 ]; then
  echo "   ... 及其他 $((CHANGES - 20)) 個檔案"
fi
echo ""

# Commit
COMMIT_MSG="${1:-"sync: 同步遊戲檔案 $(date '+%Y-%m-%d %H:%M')"}"
git add -A
git commit -m "$COMMIT_MSG"

echo ""
echo -e "${GREEN}✅ Git commit 完成：$COMMIT_MSG${NC}"

# Push（如果有 remote）
if git remote | grep -q .; then
  echo -e "${YELLOW}📤 正在推送到 remote...${NC}"
  git push 2>&1 || echo -e "${RED}⚠️ Push 失敗，請確認 remote 設定和認證${NC}"
  echo -e "${GREEN}✅ 推送完成！${NC}"
else
  echo -e "${YELLOW}⚠️ 尚未設定 git remote，請手動設定後再 push：${NC}"
  echo "   cd \"$GITHUB_DIR\""
  echo "   git remote add origin <your-repo-url>"
  echo "   git push -u origin main"
fi
