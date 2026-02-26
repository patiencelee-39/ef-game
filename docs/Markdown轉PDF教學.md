# Markdown 轉 PDF 完整教學（macOS + 中文）

## 完整指令

```bash
pandoc 你的檔案.md -o 輸出.pdf \
  --pdf-engine=xelatex \
  -V mainfont="PingFang TC" \
  -V CJKmainfont="PingFang TC" \
  -V geometry:margin=2.5cm \
  -V fontsize=12pt \
  -V linestretch=1.3
```

## 各參數說明

| 參數 | 用途 | 如果不加會怎樣 |
|------|------|----------------|
| `--pdf-engine=xelatex` | 使用 XeLaTeX 引擎，**支援中文字體** | 預設引擎 pdflatex 不支援中文，會直接報錯或亂碼 |
| `-V mainfont="PingFang TC"` | 設定主要英文/符號字體 | 使用 LaTeX 預設字體，中英文混排不一致 |
| `-V CJKmainfont="PingFang TC"` | 設定中日韓文字字體 | **中文字完全消失或變成方框** |
| `-V geometry:margin=2.5cm` | 設定頁面邊距 | 預設邊距太大（約 3.5cm），內容被擠到很窄 |
| `-V fontsize=12pt` | 字體大小 | 預設 10pt，偏小 |
| `-V linestretch=1.3` | 行距倍率 | 預設單行距，中文閱讀起來太密 |

## 注意事項：Emoji 無法渲染

XeLaTeX **無法渲染 Emoji**（如 🎮、🗺️），轉換前需先做前處理：

1. **把 Emoji 標題替換成中文編號**：`## 🎮 遊戲簡介` → `## 一、遊戲簡介`
2. **在簽名區的行尾加雙空格**：Markdown 需要行尾兩個空格才會強制換行

## 查看 macOS 可用的中文字體

```bash
fc-list :lang=zh family | sort | uniq
```

常見可用字體：

- **PingFang TC**（蘋方-繁）— macOS 內建，推薦
- **Heiti TC**（黑體-繁）
- **Songti TC**（宋體-繁）— 較正式

## 環境安裝

```bash
# 確認 pandoc 和 xelatex 已安裝
pandoc --version
xelatex --version

# 如果沒有 xelatex，安裝 MacTeX
brew install --cask mactex
```

## 總結

**關鍵就是 `--pdf-engine=xelatex` + `-V CJKmainfont="PingFang TC"`，這兩個參數解決了 99% 中文 PDF 版面跑掉的問題。**
