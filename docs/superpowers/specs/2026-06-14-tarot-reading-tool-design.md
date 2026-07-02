# Tarot Reading Tool — Design Spec

**Date**: 2026-06-14
**Status**: Design approved, pending implementation plan

## Overview

A web-based tarot card reading tool that recommends appropriate spreads (牌阵) based on user questions, supports interactive card drawing with animations, and provides AI-powered interpretations via Claude API.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript |
| Animation | framer-motion |
| Backend | Python FastAPI |
| AI | Claude API (Anthropic SDK) |
| Card Data | JSON files (no database needed for v1) |
| Card Images | Rider-Waite public domain images |

## User Flow

```
Home (enter question) → Spread Recommendation → Draw Cards → AI Interpretation
         ↑                                                    |
         └──────────────↻  New reading ───────────────────────┘
```

1. **Home**: User enters a question or clicks "browse all spreads"
2. **Recommendation**: System analyzes question keywords → recommends 2-3 spreads, user picks one
3. **Draw**: Shuffle animation → user draws N cards (N depends on spread) → flip reveal
4. **Interpretation**: Cards + positions + question → Claude API → combined reading displayed

## Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│  React SPA          │────▶│  FastAPI Backend     │
│                     │     │                     │
│  Pages:             │     │  Endpoints:          │
│   HomePage          │     │  GET /api/spreads    │
│   RecommendPage     │     │  POST /api/recommend │
│   DrawPage          │     │  POST /api/interpret │
│   InterpretPage     │     │  GET /api/cards      │
│                     │     │                     │
│  Components:        │     │  Services:           │
│   CardFace          │     │  recommend_engine.py │
│   SpreadLayout      │     │  interpreter.py      │
│   TarotCardAnim     │     │  (Claude SDK)        │
│                     │     │                     │
│  State:             │     │  Data:               │
│   React Context     │     │  cards.json (78)     │
│   (reading session) │     │  spreads.json        │
└─────────────────────┘     └─────────────────────┘
```

## Data Models

### TarotCard (78 cards)

```python
class TarotCard:
    id: str              # "fool", "magician"...
    name_zh: str         # "愚者"
    name_en: str         # "The Fool"
    arcana: str          # "major" | "minor"
    suit: str | None     # "wands" | "cups" | "swords" | "pentacles"
    number: int
    keywords_upright: list[str]
    keywords_reversed: list[str]
    description: str     # 50-100 chars, for AI prompt context
```

### Spread

```python
class Spread:
    id: str              # "three-card", "celtic-cross"
    name_zh: str
    description: str
    card_count: int
    positions: list[Position]
    tags: list[str]      # for recommendation matching

class Position:
    index: int
    label: str           # "过去", "现在", "未来"
    meaning: str         # contextual meaning for AI prompt
```

### API Request/Response

```
POST /api/recommend
  Request:  { "question": "他喜欢我吗" }
  Response: { "spreads": [...], "keywords": ["感情", "关系"] }

POST /api/interpret
  Request:  {
    "question": "他喜欢我吗",
    "spread_id": "three-card",
    "cards": [
      { "position_index": 0, "card_id": "fool", "reversed": false },
      { "position_index": 1, "card_id": "lovers", "reversed": true },
      { "position_index": 2, "card_id": "star", "reversed": false }
    ]
  }
  Response: {
    "narrative": "整体叙事...",
    "individual": [
      { "position": "过去", "card": {...}, "reading": "..." },
      ...
    ],
    "guidance": { "key_points": [...], "cautions": [...] }
  }
```

## Spread Recommendation Engine

Keyword-based matching with scoring:

| Question Keywords | Matched Tags | Recommended Spreads |
|-------------------|-------------|---------------------|
| 感情/喜欢/恋爱/分手/他/她 | 感情, 关系 | 关系牌阵, 三张牌 |
| 事业/工作/跳槽/面试 | 事业, 选择 | 凯尔特十字, 三张牌 |
| 财运/投资/钱/财务 | 财运, 选择 | 三张牌, 凯尔特十字 |
| 人生/迷茫/方向/未来 | 通用, 深度 | 凯尔特十字, 三张牌 |
| (default) | 通用 | 三张牌, 单张牌 |

Algorithm: keyword frequency scoring → sort by match count → return top 3

## Core Spreads (v1)

| Spread | Cards | Positions | Tags |
|--------|-------|-----------|------|
| 单张牌 | 1 | 今日指引 | 通用, 快速 |
| 三张牌 | 3 | 过去, 现在, 未来 | 通用, 感情, 事业 |
| 关系牌阵 | 7 | 自己, 对方, 关系现状, 自己感受, 对方感受, 障碍, 未来 | 感情, 关系 |
| 凯尔特十字 | 10 | 现状, 障碍, 过去, 未来, 目标, 基础, 自我, 环境, 希望/恐惧, 结果 | 通用, 深度, 事业 |

## AI Interpretation Prompt Design

The Claude prompt includes:
1. **System prompt**: Role as an experienced, compassionate tarot reader
2. **Spread context**: Position meanings for the chosen spread
3. **Card data**: Each drawn card's name, keywords, position
4. **User question**: Original question for context
5. **Output format**: Structured JSON with narrative, individual readings, guidance

Key prompt principles:
- Focus on psychological insight, not fortune-telling
- Emphasize free will and personal agency
- Combine card meanings with positional context
- Connect cards into a coherent narrative

## Frontend Component Tree

```
App
├── HomePage
│   ├── QuestionInput          (input + submit button)
│   └── BrowseSpreadsLink      (manual selection option)
├── RecommendPage
│   ├── SpreadCard[x3]         (recommended spread cards)
│   └── SpreadDetail           (position layout preview)
├── DrawPage
│   ├── SpreadLayout           (position placeholders in spread shape)
│   ├── CardDeck               (shufflable fan of card backs)
│   ├── FlyingCard             (card from deck to position animation)
│   └── FlipReveal             (3D card flip animation)
└── InterpretPage
    ├── NarrativeBlock         (combined reading)
    ├── IndividualReadings     (per-card expandable details)
    ├── GuidanceBlock          (key points & cautions)
    └── ActionBar              (save, reshuffle, share)
```

## Error Handling

- **API unavailable**: Show "AI 解读暂时不可用，请稍后重试" with retry button
- **No question entered**: Validate before submission, show inline hint
- **Claude API rate limit**: Backend returns 429 → frontend shows "解读请求过多，请稍等片刻"
- **Network error**: Generic error toast with retry

## Out of Scope (v2+)

- User accounts and reading history
- Multi-language support (English)
- Multiple AI provider support
- Social sharing features
- Mobile app (PWA could be considered)
- Custom spread builder
