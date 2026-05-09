#!/bin/bash
# ============================================
# EF Game — 教師一鍵設定腳本
# ============================================
# 用法：npm run setup
# 功能：引導教師完成 Firebase 專案綁定 + 建置
# ============================================

set -e

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   🎮 EF Game 教師設定精靈               ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── Step 1: 檢查 Node.js ──
if ! command -v node &> /dev/null; then
  echo "❌ 找不到 Node.js，請先安裝："
  echo "   https://nodejs.org/ （下載 LTS 版本）"
  exit 1
fi
echo "✅ Node.js $(node -v)"

# ── Step 2: 檢查 Firebase CLI ──
if ! command -v firebase &> /dev/null; then
  echo ""
  echo "⚠️  找不到 Firebase CLI，正在安裝..."
  npm install -g firebase-tools
fi
echo "✅ Firebase CLI $(firebase --version)"

# ── Step 3: npm install ──
if [ ! -d "node_modules" ]; then
  echo ""
  echo "📦 安裝專案依賴..."
  npm install
fi
echo "✅ node_modules 已就緒"

# ── Step 4: Firebase 登入 ──
echo ""
echo "── 步驟 1/3：Firebase 登入 ──"
echo ""
firebase login --interactive 2>/dev/null || true
echo ""

# ── Step 5: 輸入 Project ID ──
echo "── 步驟 2/3：綁定 Firebase 專案 ──"
echo ""
echo "請輸入你的 Firebase Project ID"
echo "（在 Firebase Console → 專案設定 → 專案 ID）"
echo ""
read -p "Project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
  echo "❌ 未輸入 Project ID，設定中止"
  exit 1
fi

# 寫入 .firebaserc
cat > .firebaserc << EOF
{
  "projects": {
    "default": "$PROJECT_ID"
  }
}
EOF
echo ""
echo "✅ 已寫入 .firebaserc（專案：$PROJECT_ID）"

# ── Step 6: 更新 firebase-init.js 的 config ──
echo ""
echo "── 步驟 3/3：設定 Firebase SDK 金鑰 ──"
echo ""
echo "請到 Firebase Console → 專案設定 → 一般 → 你的應用程式"
echo "找到 firebaseConfig 物件，依序輸入以下值："
echo ""

read -p "apiKey: " API_KEY
read -p "authDomain (例: $PROJECT_ID.firebaseapp.com): " AUTH_DOMAIN
read -p "databaseURL (例: https://$PROJECT_ID-default-rtdb.xxx.firebasedatabase.app): " DATABASE_URL
read -p "storageBucket (例: $PROJECT_ID.firebasestorage.app): " STORAGE_BUCKET
read -p "messagingSenderId: " MESSAGING_SENDER_ID
read -p "appId: " APP_ID

if [ -z "$API_KEY" ] || [ -z "$AUTH_DOMAIN" ] || [ -z "$APP_ID" ]; then
  echo ""
  echo "❌ 缺少必要欄位，設定中止"
  exit 1
fi

# 從範本複製出 firebase-init.js（如果尚未存在）
if [ ! -f "src/firebase-init.js" ]; then
  cp src/firebase-init.example.js src/firebase-init.js
  echo "✅ 已從範本建立 src/firebase-init.js"
fi

# 使用 node 來安全替換 firebase-init.js 中的 config
node -e "
const fs = require('fs');
const path = 'src/firebase-init.js';
let content = fs.readFileSync(path, 'utf8');

const newConfig = \`const firebaseConfig = {
  apiKey: \"$API_KEY\",
  authDomain: \"$AUTH_DOMAIN\",
  databaseURL: \"$DATABASE_URL\",
  projectId: \"$PROJECT_ID\",
  storageBucket: \"$STORAGE_BUCKET\",
  messagingSenderId: \"$MESSAGING_SENDER_ID\",
  appId: \"$APP_ID\",
};\`;

content = content.replace(
  /const firebaseConfig = \{[\s\S]*?\};/,
  newConfig
);

fs.writeFileSync(path, content);
console.log('✅ src/firebase-init.js 已更新');
"

# ── Step 7: 建置 firebase-bundle.js ──
echo ""
echo "🔨 建置 Firebase bundle..."
npm run build:firebase
echo ""

# ── 完成 ──
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ✅ 設定完成！                          ║"
echo "╠══════════════════════════════════════════╣"
echo "║                                          ║"
echo "║   本地測試：firebase serve               ║"
echo "║   部署上線：firebase deploy              ║"
echo "║                                          ║"
echo "╚══════════════════════════════════════════╝"
echo ""
