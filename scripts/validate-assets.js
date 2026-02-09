/**
 * 資源檔案命名規範驗證器
 * 根據 NAMING-CONVENTION.md v2.3 規範檢查資源命名
 */

const fs = require('fs');
const path = require('path');

// ============================================
// 命名規範定義
// ============================================

const NAMING_RULES = {
  audio: {
    prefixes: {
      'bgm-': '背景音樂 (Background Music)',
      'sfx-': '音效 (Sound Effects)',
      'voice-': '語音導引',
    },
    extensions: ['.mp3', '.wav', '.ogg', '.m4a'],
    pattern: /^(bgm|sfx|voice)-[a-z0-9]+(-[a-z0-9]+)*\.(mp3|wav|ogg|m4a)$/,
  },
  images: {
    prefixes: {
      'bg-': '背景圖',
      'icon-': '圖標/圖示',
      'img-': '一般圖片',
      'btn-': '按鈕圖片',
      'logo-': '標誌圖片',
      'avatar-': '頭像圖片',
      'thumb-': '縮圖',
    },
    extensions: ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'],
    pattern:
      /^(bg|icon|img|btn|logo|avatar|thumb)-[a-z0-9]+(-[a-z0-9]+)*\.(png|jpg|jpeg|svg|gif|webp)$/,
  },
  videos: {
    prefixes: {
      'video-': '一般影片',
      'intro-': '介紹影片',
      'demo-': '示範影片',
      'tutorial-': '教學影片',
    },
    extensions: ['.mp4', '.webm', '.mov'],
    pattern: /^(video|intro|demo|tutorial)-[a-z0-9]+(-[a-z0-9]+)*\.(mp4|webm|mov)$/,
  },
  fonts: {
    extensions: ['.ttf', '.otf', '.woff', '.woff2'],
    pattern: /^[a-z0-9]+(-[a-z0-9]+)*\.(ttf|otf|woff|woff2)$/,
  },
};

// 允許的狀態後綴
const STATE_SUFFIXES = ['normal', 'hover', 'active', 'disabled', 'selected', 'focus'];

// ============================================
// 驗證函式
// ============================================

/**
 * 驗證單個檔案名稱
 * @param {string} filename - 檔案名稱
 * @param {string} type - 資源類型 (audio/images/videos/fonts)
 * @returns {Object} 驗證結果
 */
function validateFilename(filename, type) {
  const rules = NAMING_RULES[type];
  if (!rules) {
    return {
      valid: false,
      error: `未知的資源類型: ${type}`,
    };
  }

  // 檢查副檔名
  const ext = path.extname(filename).toLowerCase();
  if (!rules.extensions.includes(ext)) {
    return {
      valid: false,
      error: `不支援的副檔名 "${ext}"，應為: ${rules.extensions.join(', ')}`,
    };
  }

  // 字型文件不需要前綴檢查
  if (type === 'fonts') {
    if (rules.pattern.test(filename.toLowerCase())) {
      return { valid: true };
    }
    return {
      valid: false,
      error: '字型檔名應使用 kebab-case 格式',
    };
  }

  // 檢查前綴
  const hasValidPrefix = Object.keys(rules.prefixes).some((prefix) => filename.startsWith(prefix));

  if (!hasValidPrefix) {
    return {
      valid: false,
      error: `缺少有效前綴，應使用: ${Object.keys(rules.prefixes).join(', ')}`,
      suggestion: `範例: ${Object.keys(rules.prefixes)[0]}example${ext}`,
    };
  }

  // 檢查命名格式
  if (!rules.pattern.test(filename.toLowerCase())) {
    return {
      valid: false,
      error: '檔名格式不正確，應使用 kebab-case (小寫字母、數字、連字符)',
      suggestion: `範例: ${Object.keys(rules.prefixes)[0]}my-resource${ext}`,
    };
  }

  // 檢查是否含中文
  if (/[\u4e00-\u9fa5]/.test(filename)) {
    return {
      valid: false,
      error: '檔名不應包含中文字元',
    };
  }

  // 檢查是否使用 camelCase
  if (/[A-Z]/.test(filename.replace(ext, ''))) {
    return {
      valid: false,
      error: '不應使用 camelCase，請使用 kebab-case',
    };
  }

  // 檢查是否使用 snake_case
  if (/_/.test(filename)) {
    return {
      valid: false,
      error: '不應使用 snake_case，請使用 kebab-case (連字符 -)',
    };
  }

  return { valid: true };
}

/**
 * 掃描目錄並驗證所有檔案
 * @param {string} dirPath - 目錄路徑
 * @param {string} type - 資源類型
 * @returns {Array} 驗證結果陣列
 */
function scanDirectory(dirPath, type) {
  const results = [];

  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  目錄不存在: ${dirPath}`);
    return results;
  }

  const files = fs.readdirSync(dirPath);

  // 忽略的文件列表
  const ignoredFiles = ['.gitkeep', 'README.md', 'EXAMPLES.txt', '.DS_Store'];

  files.forEach((file) => {
    // 忽略特定文件
    if (ignoredFiles.includes(file)) {
      return;
    }

    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // 遞迴掃描子目錄
      results.push(...scanDirectory(filePath, type));
    } else {
      // 驗證檔案
      const result = validateFilename(file, type);
      results.push({
        file,
        path: filePath,
        type,
        ...result,
      });
    }
  });

  return results;
}

/**
 * 生成驗證報告
 * @param {Array} results - 驗證結果
 */
function generateReport(results) {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔍 資源檔案命名規範驗證報告');
  console.log('═══════════════════════════════════════════════════════\n');

  const valid = results.filter((r) => r.valid);
  const invalid = results.filter((r) => !r.valid);

  console.log(`📊 驗證統計:`);
  console.log(`  總檔案數: ${results.length}`);
  console.log(`  ✅ 符合規範: ${valid.length}`);
  console.log(`  ❌ 不符規範: ${invalid.length}`);
  console.log(
    `  通過率: ${results.length > 0 ? ((valid.length / results.length) * 100).toFixed(1) : 0}%\n`
  );

  if (invalid.length > 0) {
    console.log('❌ 不符合規範的檔案:\n');
    invalid.forEach((item, index) => {
      console.log(`${index + 1}. ${item.file}`);
      console.log(`   路徑: ${item.path}`);
      console.log(`   錯誤: ${item.error}`);
      if (item.suggestion) {
        console.log(`   建議: ${item.suggestion}`);
      }
      console.log('');
    });
  }

  if (valid.length > 0 && invalid.length === 0) {
    console.log('🎉 所有檔案都符合命名規範！\n');
  }

  // 依類型分組統計
  console.log('📊 依類型統計:\n');
  const typeGroups = {};
  results.forEach((item) => {
    if (!typeGroups[item.type]) {
      typeGroups[item.type] = { total: 0, valid: 0 };
    }
    typeGroups[item.type].total++;
    if (item.valid) typeGroups[item.type].valid++;
  });

  Object.keys(typeGroups).forEach((type) => {
    const stats = typeGroups[type];
    const percentage = ((stats.valid / stats.total) * 100).toFixed(0);
    console.log(`  ${type.toUpperCase()}: ${stats.valid}/${stats.total} (${percentage}%)`);
  });

  console.log('\n═══════════════════════════════════════════════════════\n');

  return invalid.length === 0;
}

// ============================================
// 主程式
// ============================================

function main() {
  const projectRoot = path.resolve(__dirname, '..');

  console.log(`掃描專案根目錄: ${projectRoot}\n`);

  const allResults = [];

  // 掃描各類資源目錄
  const directories = [
    { path: path.join(projectRoot, 'audio'), type: 'audio' },
    { path: path.join(projectRoot, 'images'), type: 'images' },
    { path: path.join(projectRoot, 'videos'), type: 'videos' },
    { path: path.join(projectRoot, 'fonts'), type: 'fonts' },
  ];

  directories.forEach(({ path: dirPath, type }) => {
    if (fs.existsSync(dirPath)) {
      console.log(`掃描 ${type} 目錄...`);
      const results = scanDirectory(dirPath, type);
      allResults.push(...results);
    }
  });

  console.log('');

  // 生成報告
  const passed = generateReport(allResults);

  // 返回退出碼
  process.exit(passed ? 0 : 1);
}

// 執行驗證
if (require.main === module) {
  main();
}

module.exports = { validateFilename, scanDirectory };
