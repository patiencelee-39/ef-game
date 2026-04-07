

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**EF Game** (執行功能訓練遊戲) is a neurocognitive assessment and training web app for 3–6 year-old deaf/hard-of-hearing preschool children. It implements the DCCS (Dimensional Change Card Sort) cognitive task with IRT-based adaptive difficulty. Firebase Hosting: https://efgame-634af.web.app

Three game modes:
- **Single Player** — Adventure map with progressive difficulty, pet system, badge collection
- **Multiplayer (Kahoot-style)** — Real-time competitive gameplay via room codes
- **Relay** — Team-based turn-taking format

## Commands

```bash
# Local development
npm install
firebase login
firebase serve          # → http://localhost:5000

# Code quality
npm run lint            # ESLint
npm run format:check    # Prettier validation
npm run validate        # lint + format (run before deploying)
npm run validate:assets # Custom asset validation

# Build & deploy
npm run build:firebase  # Vite → dist/ → js/firebase-bundle.js
firebase deploy         # Hosting + RTDB/Firestore rules
```

There is **no automated test framework**. Testing uses manual checklists in `/docs/SINGLEPLAYER-TEST-CHECKLIST.md` and `/docs/MULTIPLAYER-TEST-CHECKLIST.md`. Demo pages (`demo-cheese-rule1.html`, `demo-mouse-rule1-slow.html`) and admin tools (`/tools/admin.html`) support manual testing.

## Architecture

### Module System

All JS is **IIFE modules** exposing APIs via `window` globals — no ES6 imports in production code (compatibility requirement):

```javascript
var ModuleName = (function() {
  "use strict";
  // private implementation
  return { publicAPI };
})();
```

The exception is `src/firebase-init.js`, which uses ES6 modules and is compiled by Vite into `js/firebase-bundle.js`. Do **not** edit `js/firebase-bundle.js` directly.

### Key Directories

- `js/game/` — Pure game logic: `rule-engine.js` (Go/No-Go judgment), `stimulus-renderer.js`
- `js/adaptive/` — Adaptive difficulty: `difficulty-provider.js` (facade), `irt-simple-engine.js` (IRT 3PL model), `simple-adaptive-engine.js` (legacy fallback)
- `js/singleplayer/` — Single player controllers (`game-controller.js` is the main loop, ~1400 lines)
- `js/multiplayer/` — Multiplayer controllers + `game-sync.js` (RTDB real-time sync) + `relay-manager.js`
- `js/shared/` — Reusable UI components (countdown, feedback overlay, audio, leaderboard, CSV export)
- `js/utils/` — DOM-free utilities: `logger.js`, `score-calculator.js`, `badge-checker.js`, `storage.js`
- `js/shop/` — Pet/avatar/sticker system
- `css/themes/` — CSS custom property theme system (`--bg-dark`, `--color-correct`, etc.)

### Configuration-Driven Design

**`js/game-config.js`** is the single source of truth for all tunable parameters — timing, question counts, scoring, difficulty levels, multiplayer settings, DEV flags. Teachers are expected to modify this file without touching other code (documented in `docs/TEACHER-GUIDE.md`).

### Firebase Architecture

- **RTDB** — Room management, real-time multiplayer state sync, player answers
- **Firestore** — Persistent leaderboards, assessment results, class management
- **Auth** — Anonymous + Google OAuth
- Firestore is **lazy-initialized** (delay until needed) to reduce memory pressure

### Game Flow

```
Single Player:
  index.html → singleplayer/game.html (GameController + DifficultyProvider + RuleEngine + TrialRenderer)
             → singleplayer/result.html (ScoreCalculator + BadgeChecker + ResultUpload to Firestore)
             → singleplayer/adventure-map.html → pet.html

Multiplayer:
  multiplayer/index.html → room-create.html / room-join.html
                         → room-lobby.html (RoomManager via RTDB)
                         → game.html (GameController + GameSync + RelayManager)
                         → result.html (ranking + ResultUpload)
```

### Adaptive Difficulty (IRT 3PL)

5 difficulty levels (1=easiest, 5=hardest, 3=default). First 3 trials locked at Level 3 (warmup). θ (ability) bounded to [-3, +3]. Maximum ±1 level jump per trial. Auto-falls back to `simple-adaptive-engine.js` on error.

### Go/No-Go Rule Engine

Two fields × two rule types × optional person indicator:
- **Mouse field**: Cheese (Go) vs Cat (No-Go)
- **Fishing field**: Fish (Go) vs Shark (No-Go)
- **Rule 1**: Color dimension; **Rule 2**: Shape dimension; **Mixed**: dual-rule with day/night or person context

### Logging

Use `Logger.debug/info/warn/error()` from `js/utils/logger.js` everywhere. Level controlled by `GAME_CONFIG.DEV.LOG_LEVEL`. Never use `console.log` directly.

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Files | `kebab-case` | `game-controller.js` |
| Variables/functions | `camelCase` | `playerScore` |
| Booleans | `is/has/can/should` prefix | `isGameActive` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_PLAYERS` |
| CSS variables | `--category-description` | `--bg-dark` |
| Firebase paths | `camelCase` + plural | `rooms/`, `players/` |
| Events | `noun:pastTense` | `room:updated` |

Full conventions: `docs/開發規範與工具.md`

## Teacher Annotation Pattern

All files include structured comments for non-technical teachers:
- **白話版說明** — plain-language explanation
- **可修改項目** — items safe to edit
- **修改注意** — warnings and constraints

Preserve this pattern when editing existing files.

## Key Documentation

| File | Purpose |
|------|---------|
| `docs/完整需求文件v4.5.md` | Full requirements specification |
| `docs/TEACHER-GUIDE.md` | Config modification guide for teachers |
| `docs/開發規範與工具.md` | Dev conventions + debug guide |
| `docs/IRT_*.md` | Adaptive difficulty theory |
| `docs/配色系統完整文檔.md` | Color system design |
| `_archive/` | Archived code (do not reference in production) |
