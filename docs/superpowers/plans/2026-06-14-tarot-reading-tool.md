# Tarot Reading Tool — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web-based tarot reading tool with AI-powered interpretations via Claude API.

**Architecture:** React + TypeScript SPA frontend communicates with a Python FastAPI backend. Frontend handles card animations (framer-motion) and user flow. Backend serves card/spread data, runs a keyword-based recommendation engine, and calls Claude API for structured interpretations.

**Tech Stack:** React 18, TypeScript, Vite, framer-motion | Python 3.11+, FastAPI, anthropic SDK, Pydantic

**Source Spec:** `docs/superpowers/specs/2026-06-14-tarot-reading-tool-design.md`

---

## File Structure

```
D:\talo\
├── backend/
│   ├── requirements.txt
│   ├── main.py                    # FastAPI app entry point
│   ├── models/
│   │   └── schemas.py             # Pydantic models
│   ├── data/
│   │   ├── cards.json             # 78 tarot cards
│   │   └── spreads.json           # 4 spread definitions
│   ├── services/
│   │   ├── recommend_engine.py    # Keyword-based spread recommendation
│   │   └── interpreter.py         # Claude API integration
│   └── tests/
│       ├── test_recommend.py
│       └── test_interpreter.py
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── styles/
│       │   └── global.css
│       ├── types/
│       │   └── index.ts
│       ├── api/
│       │   └── client.ts
│       ├── context/
│       │   └── ReadingContext.tsx
│       ├── pages/
│       │   ├── HomePage.tsx
│       │   ├── RecommendPage.tsx
│       │   ├── DrawPage.tsx
│       │   └── InterpretPage.tsx
│       └── components/
│           ├── QuestionInput.tsx
│           ├── SpreadCard.tsx
│           ├── SpreadLayout.tsx
│           ├── CardDeck.tsx
│           ├── FlipReveal.tsx
│           ├── NarrativeBlock.tsx
│           ├── IndividualReading.tsx
│           ├── GuidanceBlock.tsx
│           └── ActionBar.tsx
└── docs/
    └── superpowers/
        ├── specs/2026-06-14-tarot-reading-tool-design.md
        └── plans/2026-06-14-tarot-reading-tool.md
```

---

## Phase 1: Project Scaffolding

### Task 1: Initialize Backend Project

**Files:**
- Create: `backend/requirements.txt`

- [ ] **Step 1: Create backend directory and requirements.txt**

```bash
mkdir -p backend/models backend/data backend/services backend/tests
```

- [ ] **Step 2: Write requirements.txt**

Create `backend/requirements.txt`:
```
fastapi==0.115.6
uvicorn[standard]==0.34.0
anthropic==0.42.0
pydantic==2.10.4
python-dotenv==1.0.1
pytest==8.3.4
httpx==0.28.1
```

- [ ] **Step 3: Install dependencies**

```bash
cd backend && pip install -r requirements.txt
```

- [ ] **Step 4: Commit**

```bash
git add backend/requirements.txt
git commit -m "chore: init backend project with dependencies"
```

---

### Task 2: Initialize Frontend Project

**Files:**
- Create: `frontend/` via Vite scaffold

- [ ] **Step 1: Scaffold Vite + React + TypeScript**

```bash
npm create vite@latest frontend -- --template react-ts
```

- [ ] **Step 2: Install additional dependencies**

```bash
cd frontend && npm install framer-motion react-router-dom
```

- [ ] **Step 3: Verify scaffold runs**

```bash
cd frontend && npm run dev
```
Expected: Vite dev server starts on localhost:5173

- [ ] **Step 4: Commit**

```bash
git add frontend/
git commit -m "chore: scaffold frontend with Vite + React + TypeScript"
```

---

## Phase 2: Backend Data & Models

### Task 3: Create Pydantic Models

**Files:**
- Create: `backend/models/__init__.py` (empty)
- Create: `backend/models/schemas.py`

- [ ] **Step 1: Write schemas.py**

```python
from pydantic import BaseModel
from typing import Optional


class Position(BaseModel):
    index: int
    label: str
    meaning: str


class Spread(BaseModel):
    id: str
    name_zh: str
    description: str
    card_count: int
    positions: list[Position]
    tags: list[str]


class TarotCard(BaseModel):
    id: str
    name_zh: str
    name_en: str
    arcana: str
    suit: Optional[str] = None
    number: int
    keywords_upright: list[str]
    keywords_reversed: list[str]
    description: str


class RecommendRequest(BaseModel):
    question: str


class RecommendResponse(BaseModel):
    spreads: list[Spread]
    keywords: list[str]


class DrawnCard(BaseModel):
    position_index: int
    card_id: str
    reversed: bool


class InterpretRequest(BaseModel):
    question: str
    spread_id: str
    cards: list[DrawnCard]


class IndividualReading(BaseModel):
    position: str
    card: TarotCard
    reversed: bool
    reading: str


class Guidance(BaseModel):
    key_points: list[str]
    cautions: list[str]


class InterpretResponse(BaseModel):
    narrative: str
    individual: list[IndividualReading]
    guidance: Guidance
```

- [ ] **Step 2: Verify models import correctly**

```bash
cd backend && python -c "from models.schemas import TarotCard, Spread; print('OK')"
```
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add backend/models/
git commit -m "feat: add Pydantic data models"
```

---

### Task 4: Create Tarot Cards Data (78 Cards)

**Files:**
- Create: `backend/data/cards.json`

- [ ] **Step 1: Write cards.json with all 78 cards**

The file contains all 22 Major Arcana + 56 Minor Arcana. Each card has: id, name_zh, name_en, arcana, suit, number, keywords_upright, keywords_reversed, description.

```json
[
  {
    "id": "fool",
    "name_zh": "愚者",
    "name_en": "The Fool",
    "arcana": "major",
    "suit": null,
    "number": 0,
    "keywords_upright": ["新的开始", "天真", "冒险", "自由", "信任"],
    "keywords_reversed": ["鲁莽", "不负责任", "犹豫", "缺乏方向"],
    "description": "愚者象征新的旅程起点，怀抱纯真与信任踏入未知。正位代表勇敢尝试，逆位提示需谨慎考虑风险。"
  },
  {
    "id": "magician",
    "name_zh": "魔术师",
    "name_en": "The Magician",
    "arcana": "major",
    "suit": null,
    "number": 1,
    "keywords_upright": ["创造力", "技能", "意志力", "自信", "资源丰富"],
    "keywords_reversed": ["欺骗", "操纵", "能力不足", "未实现的潜力"],
    "description": "魔术师手握四大元素象征物，代表将想法转化为现实的能力。正位代表你拥有所需的一切资源，逆位则警示过度自信或欺骗。"
  },
  {
    "id": "high-priestess",
    "name_zh": "女祭司",
    "name_en": "The High Priestess",
    "arcana": "major",
    "suit": null,
    "number": 2,
    "keywords_upright": ["直觉", "潜意识", "神秘", "内在智慧", "静待"],
    "keywords_reversed": ["忽视直觉", "隐藏的秘密", "表面化", "情感封闭"],
    "description": "女祭司坐在帷幕之前，守护着深层智慧。正位呼唤你信赖直觉，逆位表示秘密即将浮出水面或你在逃避内心声音。"
  },
  {
    "id": "empress",
    "name_zh": "女皇",
    "name_en": "The Empress",
    "arcana": "major",
    "suit": null,
    "number": 3,
    "keywords_upright": ["丰饶", "母性", "自然", "创造力", "滋养"],
    "keywords_reversed": ["依赖", "创造力阻滞", "忽视自我", "过度保护"],
    "description": "女皇象征丰盛与创造力，如同大地母亲般滋养生命。正位代表成长与收获，逆位提示你需关注自我关怀。"
  },
  {
    "id": "emperor",
    "name_zh": "皇帝",
    "name_en": "The Emperor",
    "arcana": "major",
    "suit": null,
    "number": 4,
    "keywords_upright": ["权威", "结构", "稳定", "领导力", "秩序"],
    "keywords_reversed": ["专制", "僵化", "缺乏纪律", "滥用权力"],
    "description": "皇帝代表秩序与权威的力量。正位鼓励建立规则和边界，逆位则警示过于控制或结构崩塌。"
  },
  {
    "id": "hierophant",
    "name_zh": "教皇",
    "name_en": "The Hierophant",
    "arcana": "major",
    "suit": null,
    "number": 5,
    "keywords_upright": ["传统", "导师", "信仰", "仪式", "教育"],
    "keywords_reversed": ["叛逆", "打破传统", "不受教", "教条主义"],
    "description": "教皇代表精神指引与传统智慧。正位建议遵循既有路径寻求指导，逆位鼓励打破常规找到自己的真理。"
  },
  {
    "id": "lovers",
    "name_zh": "恋人",
    "name_en": "The Lovers",
    "arcana": "major",
    "suit": null,
    "number": 6,
    "keywords_upright": ["爱", "和谐", "选择", "价值观", "结合"],
    "keywords_reversed": ["失衡", "冲突", "分离", "错误选择", "价值观不合"],
    "description": "恋人牌不仅是爱情，更是重大选择的象征。正位代表心灵契合与正确抉择，逆位表示价值观冲突或选择的痛苦。"
  },
  {
    "id": "chariot",
    "name_zh": "战车",
    "name_en": "The Chariot",
    "arcana": "major",
    "suit": null,
    "number": 7,
    "keywords_upright": ["胜利", "决心", "掌控", "前进", "意志力"],
    "keywords_reversed": ["失控", "失败", "方向错误", "内心冲突"],
    "description": "战车代表意志力驱动的胜利。正位宣示通过决心克服障碍，逆位提示内在矛盾导致方向偏离。"
  },
  {
    "id": "strength",
    "name_zh": "力量",
    "name_en": "Strength",
    "arcana": "major",
    "suit": null,
    "number": 8,
    "keywords_upright": ["勇气", "内在力量", "耐心", "温柔驯服", "坚韧"],
    "keywords_reversed": ["软弱", "自我怀疑", "失控", "缺乏信念"],
    "description": "力量牌展现用温柔而非蛮力驯服猛狮。正位代表内在的韧性与耐心，逆位提醒你找回自信和勇气。"
  },
  {
    "id": "hermit",
    "name_zh": "隐士",
    "name_en": "The Hermit",
    "arcana": "major",
    "suit": null,
    "number": 9,
    "keywords_upright": ["内省", "独处", "寻求真理", "智慧", "指引"],
    "keywords_reversed": ["孤立", "逃避", "拒绝帮助", "迷失"],
    "description": "隐士提灯照亮黑暗，象征向内探索。正位鼓励暂离喧嚣审视内心，逆位警示过度的孤立或逃避现实。"
  },
  {
    "id": "wheel-of-fortune",
    "name_zh": "命运之轮",
    "name_en": "Wheel of Fortune",
    "arcana": "major",
    "suit": null,
    "number": 10,
    "keywords_upright": ["转变", "运气", "命运", "循环", "契机"],
    "keywords_reversed": ["厄运", "抵抗变化", "停滞", "失控"],
    "description": "命运之轮提醒我们万物皆有周期。正位预示好运与转机，逆位表示你在抗拒不可避免的改变。"
  },
  {
    "id": "justice",
    "name_zh": "正义",
    "name_en": "Justice",
    "arcana": "major",
    "suit": null,
    "number": 11,
    "keywords_upright": ["公平", "真理", "因果", "责任", "清晰判断"],
    "keywords_reversed": ["不公", "逃避责任", "偏见", "失衡"],
    "description": "正义牌手持天秤与剑，象征因果法则与公平裁决。正位代表事情会有公正结果，逆位提示需审视自己的选择是否公平。"
  },
  {
    "id": "hanged-man",
    "name_zh": "倒吊人",
    "name_en": "The Hanged Man",
    "arcana": "major",
    "suit": null,
    "number": 12,
    "keywords_upright": ["放手", "新视角", "牺牲", "等待", "启示"],
    "keywords_reversed": ["固执", "不愿放手", "无谓牺牲", "停滞"],
    "description": "倒吊人自愿倒悬却神色宁静，象征换个角度看世界。正位呼唤暂停行动、静待领悟，逆位表示你在做无意义的牺牲。"
  },
  {
    "id": "death",
    "name_zh": "死神",
    "name_en": "Death",
    "arcana": "major",
    "suit": null,
    "number": 13,
    "keywords_upright": ["结束", "转变", "新生", "放手", "蜕变"],
    "keywords_reversed": ["抗拒改变", "停滞", "恐惧结束", "无法前进"],
    "description": "死神并非肉体的终结，而是代表旧篇章的结束与新篇章的开始。正位拥抱变化带来重生，逆位表示你在抗拒必要的结束。"
  },
  {
    "id": "temperance",
    "name_zh": "节制",
    "name_en": "Temperance",
    "arcana": "major",
    "suit": null,
    "number": 14,
    "keywords_upright": ["平衡", "调和", "耐心", "中庸", "融合"],
    "keywords_reversed": ["极端", "失衡", "不耐烦", "冲突"],
    "description": "节制天使将两杯水调和交融，象征寻找平衡与和谐。正位建议适度、耐心与融合，逆位提示生活某方面失衡。"
  },
  {
    "id": "devil",
    "name_zh": "恶魔",
    "name_en": "The Devil",
    "arcana": "major",
    "suit": null,
    "number": 15,
    "keywords_upright": ["束缚", "物质主义", "沉迷", "阴影", "欲望"],
    "keywords_reversed": ["解脱", "觉醒", "打破枷锁", "重获自由"],
    "description": "恶魔牌揭露我们被物质、欲望或执念束缚的状态。正位提醒审视是什么困住了你，逆位象征挣脱枷锁的时刻到来。"
  },
  {
    "id": "tower",
    "name_zh": "高塔",
    "name_en": "The Tower",
    "arcana": "major",
    "suit": null,
    "number": 16,
    "keywords_upright": ["剧变", "崩塌", "觉醒", "真相", "解放"],
    "keywords_reversed": ["避免灾难", "勉强维持", "延迟改变"],
    "description": "高塔被闪电击中崩塌，象征突然而彻底的颠覆。虽然过程痛苦，但崩塌的只是虚假的结构，真相得以显露。"
  },
  {
    "id": "star",
    "name_zh": "星星",
    "name_en": "The Star",
    "arcana": "major",
    "suit": null,
    "number": 17,
    "keywords_upright": ["希望", "疗愈", "灵感", "宁静", "信心"],
    "keywords_reversed": ["绝望", "失去信念", "消极", "自我否定"],
    "description": "星星是暴风雨后的宁静曙光。正位带来希望与疗愈的能量，逆位表示你暂时看不到光明但不要放弃。"
  },
  {
    "id": "moon",
    "name_zh": "月亮",
    "name_en": "The Moon",
    "arcana": "major",
    "suit": null,
    "number": 18,
    "keywords_upright": ["幻觉", "恐惧", "潜意识", "不安", "直觉"],
    "keywords_reversed": ["恐惧消散", "真相显露", "混乱平息"],
    "description": "月光下的道路模糊不清，象征潜意识中的不安与迷失。正位提示不是所有事情都如表面所见，逆位表示混乱正在消退。"
  },
  {
    "id": "sun",
    "name_zh": "太阳",
    "name_en": "The Sun",
    "arcana": "major",
    "suit": null,
    "number": 19,
    "keywords_upright": ["快乐", "成功", "活力", "真相", "温暖"],
    "keywords_reversed": ["阴霾", "挫折", "过度乐观", "暂时困境"],
    "description": "太阳是塔罗中最积极的牌之一，象征纯粹的快乐与成功。正位带来能量与清晰，逆位表示乌云暂时遮蔽了阳光。"
  },
  {
    "id": "judgement",
    "name_zh": "审判",
    "name_en": "Judgement",
    "arcana": "major",
    "suit": null,
    "number": 20,
    "keywords_upright": ["觉醒", "召唤", "更新", "宽恕", "重生"],
    "keywords_reversed": ["自我批判", "拒绝召唤", "逃避反思", "遗憾"],
    "description": "天使吹响号角，逝者从墓中苏醒。审判牌召唤你审视过去、接受宽恕并迎接新生。正位是灵魂的觉醒时刻。"
  },
  {
    "id": "world",
    "name_zh": "世界",
    "name_en": "The World",
    "arcana": "major",
    "suit": null,
    "number": 21,
    "keywords_upright": ["完成", "圆满", "成就", "旅程", "整体"],
    "keywords_reversed": ["未完成", "延迟", "空虚", "缺少闭环"],
    "description": "世界牌代表一个周期的圆满结束。正位庆祝成就与完整，逆位表示你离终点很近但还有最后一步需要走完。"
  },
  {
    "id": "ace-of-wands",
    "name_zh": "权杖王牌",
    "name_en": "Ace of Wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 1,
    "keywords_upright": ["灵感", "新开始", "热情", "创造力", "勇气"],
    "keywords_reversed": ["拖延", "缺乏动力", "错误开始", "灵感枯竭"],
    "description": "权杖Ace象征火元素的纯粹能量，代表新的创意、事业或激情的火花被点燃。现在就是行动的时刻。"
  },
  {
    "id": "two-of-wands",
    "name_zh": "权杖二",
    "name_en": "Two of Wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 2,
    "keywords_upright": ["规划", "决策", "展望", "探索", "抉择"],
    "keywords_reversed": ["犹豫不决", "害怕未知", "受限", "规划不足"],
    "description": "权杖二描绘手握地球仪远眺的人，代表站在抉择的十字路口。正位鼓励大胆规划未来，逆位显示犹豫阻碍前进。"
  },
  {
    "id": "three-of-wands",
    "name_zh": "权杖三",
    "name_en": "Three of Wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 3,
    "keywords_upright": ["扩张", "远见", "进展", "贸易", "等待成果"],
    "keywords_reversed": ["障碍", "延迟", "失望", "计划受阻"],
    "description": "权杖三的人遥望远方等待船只归来。正位代表事业扩展和计划推进中，逆位表示结果延迟或受阻。"
  },
  {
    "id": "four-of-wands",
    "name_zh": "权杖四",
    "name_en": "Four of Wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 4,
    "keywords_upright": ["庆祝", "和谐", "回家", "稳定", "归属"],
    "keywords_reversed": ["不稳定", "缺乏支持", "家庭矛盾", "短暂安宁"],
    "description": "权杖四描绘节日花环下的庆祝场景，象征稳定与归属感。正位代表平安喜乐的时光，逆位提示和谐被打破。"
  },
  {
    "id": "five-of-wands",
    "name_zh": "权杖五",
    "name_en": "Five of Wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 5,
    "keywords_upright": ["竞争", "冲突", "意见分歧", "挑战", "成长"],
    "keywords_reversed": ["逃避冲突", "妥协", "合作", "内耗减少"],
    "description": "权杖五描绘五人持杖交锋的场景。正位代表良性竞争与观点碰撞，逆位表示冲突平息或你在回避必要的对抗。"
  },
  {
    "id": "six-of-wands",
    "name_zh": "权杖六",
    "name_en": "Six of Wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 6,
    "keywords_upright": ["胜利", "认可", "自信", "凯旋", "荣誉"],
    "keywords_reversed": ["失败", "缺乏认可", "自负", "嫉妒"],
    "description": "权杖六是胜利的凯旋游行。正位代表努力得到认可与赞扬，逆位暗示自负或成功延迟。"
  },
  {
    "id": "seven-of-wands",
    "name_zh": "权杖七",
    "name_en": "Seven of Wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 7,
    "keywords_upright": ["坚持", "捍卫立场", "勇气", "竞争", "不退让"],
    "keywords_reversed": ["放弃", "被压倒", "自我怀疑", "孤立无援"],
    "description": "权杖七中一人居高临下抵挡六根权杖的攻击。正位鼓励坚守阵地、捍卫自己，逆位表示感到力不从心。"
  },
  {
    "id": "eight-of-wands",
    "name_zh": "权杖八",
    "name_en": "Eight of Wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 8,
    "keywords_upright": ["迅速", "行动", "进展", "消息", "旅行"],
    "keywords_reversed": ["延迟", "混乱", "停滞", "计划受阻"],
    "description": "权杖八中八根权杖飞速掠过天空，象征事情在快速推进。正位代表好消息将至和迅速进展，逆位暗示事情受阻。"
  },
  {
    "id": "nine-of-wands",
    "name_zh": "权杖九",
    "name_en": "Nine of Wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 9,
    "keywords_upright": ["韧性", "坚持到底", "最后的屏障", "审慎"],
    "keywords_reversed": ["放弃", "过度防守", "精力耗尽", "不愿再战"],
    "description": "权杖九描绘一个受伤但仍坚守阵地的战士。正位代表虽然疲惫但必须坚持，逆位表示身心已到极限。"
  },
  {
    "id": "ten-of-wands",
    "name_zh": "权杖十",
    "name_en": "Ten of Wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 10,
    "keywords_upright": ["负担", "责任", "压力", "过度努力", "完成"],
    "keywords_reversed": ["释重", "放下", "拒绝过度承担", "寻求帮助"],
    "description": "权杖十的人背负沉重权杖艰难前行。正位警示负担过重，逆位表示是时候放下不必要的重担了。"
  },
  {
    "id": "page-of-wands",
    "name_zh": "权杖侍从",
    "name_en": "Page of Wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 11,
    "keywords_upright": ["探索", "新想法", "热情", "消息", "免费精神"],
    "keywords_reversed": ["方向错误", "浮躁", "坏消息", "缺乏计划"],
    "description": "权杖侍从象征新灵感和探索精神的萌芽。正位代表一个好消息或新机会的来临，逆位提示想法虽好但执行不足。"
  },
  {
    "id": "knight-of-wands",
    "name_zh": "权杖骑士",
    "name_en": "Knight of Wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 12,
    "keywords_upright": ["行动", "冒险", "冲动", "激情", "追求"],
    "keywords_reversed": ["鲁莽", "急躁", "杂乱", "半途而废"],
    "description": "权杖骑士策马冲锋，象征行动力与冒险精神。正位鼓励大胆追求目标，逆位警示冲动行事导致挫败。"
  },
  {
    "id": "queen-of-wands",
    "name_zh": "权杖皇后",
    "name_en": "Queen of Wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 13,
    "keywords_upright": ["自信", "魅力", "领导力", "热情", "独立"],
    "keywords_reversed": ["不安", "嫉妒", "控制欲", "缺乏自信"],
    "description": "权杖皇后充满魅力与自信的光芒。正位代表温暖而有力量的女性形象，逆位表示安全感缺失导致的负面行为。"
  },
  {
    "id": "king-of-wands",
    "name_zh": "权杖国王",
    "name_en": "King of Wands",
    "arcana": "minor",
    "suit": "wands",
    "number": 14,
    "keywords_upright": ["领袖", "远见", "企业家", "荣誉", "支配"],
    "keywords_reversed": ["独裁", "期望过高", "鲁莽领导", "傲慢"],
    "description": "权杖国王是成熟的领导者，兼具远见与执行力。正位代表有魅力的权威人物，逆位警示权力滥用或霸道。"
  },
  {
    "id": "ace-of-cups",
    "name_zh": "圣杯王牌",
    "name_en": "Ace of Cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 1,
    "keywords_upright": ["新感情", "爱", "直觉", "喜悦", "充盈"],
    "keywords_reversed": ["空虚", "情感封锁", "创意枯竭", "失恋"],
    "description": "圣杯Ace象征水元素的纯粹情感能量，代表新的感情、创意或灵性体验的开启。心扉即将打开。"
  },
  {
    "id": "two-of-cups",
    "name_zh": "圣杯二",
    "name_en": "Two of Cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 2,
    "keywords_upright": ["结合", "伙伴关系", "吸引力", "平等", "共鸣"],
    "keywords_reversed": ["分离", "不平等", "信任破裂", "沟通不畅"],
    "description": "圣杯二描绘两人交换圣杯的深情场景。正位代表美好的感情或合作关系，逆位暗示关系中的不平衡。"
  },
  {
    "id": "three-of-cups",
    "name_zh": "圣杯三",
    "name_en": "Three of Cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 3,
    "keywords_upright": ["友谊", "庆祝", "社群", "欢乐", "团聚"],
    "keywords_reversed": ["过度放纵", "流言", "孤立", "聚会变味"],
    "description": "圣杯三展现三女子举杯欢庆。正位代表友谊与社群之乐，逆位提示社交中的过度或流言蜚语。"
  },
  {
    "id": "four-of-cups",
    "name_zh": "圣杯四",
    "name_en": "Four of Cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 4,
    "keywords_upright": ["沉思", "不满", "冷淡", "重新评估", "忽视机会"],
    "keywords_reversed": ["觉醒", "接受", "新动力", "感恩"],
    "description": "圣杯四的人对眼前三个圣杯无动于衷，云中递来的第四个也被忽视。正位代表对现状的不满与倦怠，逆位表示重新发现值得感恩的事物。"
  },
  {
    "id": "five-of-cups",
    "name_zh": "圣杯五",
    "name_en": "Five of Cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 5,
    "keywords_upright": ["失落", "悲伤", "遗憾", "哀悼", "只看到失去"],
    "keywords_reversed": ["接受", "疗愈", "向前看", "重拾希望"],
    "description": "圣杯五中黑衣人低头凝视三个倾倒的圣杯。正位代表沉浸在失去中忽略了剩下的美好，逆位表示疗愈和接纳的开始。"
  },
  {
    "id": "six-of-cups",
    "name_zh": "圣杯六",
    "name_en": "Six of Cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 6,
    "keywords_upright": ["回忆", "怀旧", "纯真", "童年", "馈赠"],
    "keywords_reversed": ["沉溺过去", "无法前进", "天真", "模式重复"],
    "description": "圣杯六描绘大孩子给小孩子送花的温馨场景。正位代表美好回忆或纯真的情感，逆位警示不要活在过去的影子里。"
  },
  {
    "id": "seven-of-cups",
    "name_zh": "圣杯七",
    "name_en": "Seven of Cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 7,
    "keywords_upright": ["幻想", "选择", "迷惑", "愿望", "幻觉"],
    "keywords_reversed": ["清晰", "决断", "现实", "专注"],
    "description": "圣杯七中七只圣杯漂浮着各种幻想。正位代表众多选择带来的迷惑，逆位表示终于看清现实做出决定。"
  },
  {
    "id": "eight-of-cups",
    "name_zh": "圣杯八",
    "name_en": "Eight of Cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 8,
    "keywords_upright": ["离开", "寻找更高意义", "放弃", "旅程"],
    "keywords_reversed": ["停留", "害怕离开", "徘徊", "勉强维持"],
    "description": "圣杯八中一个人转身离开堆叠的圣杯走向远方。正位代表为了更高目标而告别舒适区，逆位表示虽不满足却不敢离开。"
  },
  {
    "id": "nine-of-cups",
    "name_zh": "圣杯九",
    "name_en": "Nine of Cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 9,
    "keywords_upright": ["满足", "愿望成真", "享受", "舒适", "自豪"],
    "keywords_reversed": ["不满", "贪婪", "物质主义", "愿望落空"],
    "description": "圣杯九被称为'愿望牌'，一人坐于九只圣杯前志得意满。正位代表心愿达成与精神满足，逆位表示外在富足内心空虚。"
  },
  {
    "id": "ten-of-cups",
    "name_zh": "圣杯十",
    "name_en": "Ten of Cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 10,
    "keywords_upright": ["幸福家庭", "情感圆满", "和谐", "归属", "爱"],
    "keywords_reversed": ["家庭不和", "梦想破碎", "疏离", "不完整的幸福"],
    "description": "圣杯十描绘一家人在彩虹下幸福相拥。正位代表情感与家庭的圆满，逆位暗示家庭关系中的裂痕。"
  },
  {
    "id": "page-of-cups",
    "name_zh": "圣杯侍从",
    "name_en": "Page of Cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 11,
    "keywords_upright": ["梦想", "直觉", "创意消息", "浪漫", "灵感"],
    "keywords_reversed": ["情感不成熟", "幻想破灭", "创造力受阻"],
    "description": "圣杯侍从手持鱼跃而出的圣杯，象征创意与直觉的萌芽。正位代表浪漫或创意的好消息，逆位表示情感不成熟。"
  },
  {
    "id": "knight-of-cups",
    "name_zh": "圣杯骑士",
    "name_en": "Knight of Cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 12,
    "keywords_upright": ["浪漫", "魅力", "理想主义", "追求", "邀约"],
    "keywords_reversed": ["情绪化", "不切实际", "幻灭", "欺骗"],
    "description": "圣杯骑士是浪漫的追寻者。正位代表温柔而有魅力的追求者或艺术灵感，逆位表示过度理想化或情感反复无常。"
  },
  {
    "id": "queen-of-cups",
    "name_zh": "圣杯皇后",
    "name_en": "Queen of Cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 13,
    "keywords_upright": ["同理心", "直觉", "关怀", "情感深度", "敏感"],
    "keywords_reversed": ["情绪依赖", "过度敏感", "自怜", "情感操纵"],
    "description": "圣杯皇后是情感世界的女王，直觉敏锐而富有同理心。正位代表温暖关怀的能量，逆位表示情绪失衡或过度付出。"
  },
  {
    "id": "king-of-cups",
    "name_zh": "圣杯国王",
    "name_en": "King of Cups",
    "arcana": "minor",
    "suit": "cups",
    "number": 14,
    "keywords_upright": ["情感成熟", "智慧", "包容", "外交", "沉稳"],
    "keywords_reversed": ["情绪操纵", "暴躁", "压抑情感", "冷漠"],
    "description": "圣杯国王是情感智慧的最高体现，能在情绪风暴中保持稳定。正位代表成熟包容的情感力量，逆位表示情感操纵或失控。"
  },
  {
    "id": "ace-of-swords",
    "name_zh": "宝剑王牌",
    "name_en": "Ace of Swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 1,
    "keywords_upright": ["清晰", "真理", "突破", "决断", "智力"],
    "keywords_reversed": ["混乱", "误解", "错误判断", "模糊"],
    "description": "宝剑Ace象征风元素的纯粹思维能量，代表真理的突破和心智的清晰。正位是做出重要决定的时刻。"
  },
  {
    "id": "two-of-swords",
    "name_zh": "宝剑二",
    "name_en": "Two of Swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 2,
    "keywords_upright": ["僵局", "逃避选择", "两难", "拒绝面对"],
    "keywords_reversed": ["揭露真相", "突破困境", "决定", "摘掉眼罩"],
    "description": "宝剑二中蒙眼女子手持双剑形成僵局。正位代表逃避做出艰难选择，逆位表示需要面对现实做出决定。"
  },
  {
    "id": "three-of-swords",
    "name_zh": "宝剑三",
    "name_en": "Three of Swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 3,
    "keywords_upright": ["心痛", "悲伤", "背叛", "失落", "现实打击"],
    "keywords_reversed": ["疗愈", "释怀", "和解", "走出阴影"],
    "description": "宝剑三中三把剑穿心而过，是最直接的心痛之牌。正位代表情感创伤与悲伤，逆位表示疗愈过程已开始。"
  },
  {
    "id": "four-of-swords",
    "name_zh": "宝剑四",
    "name_en": "Four of Swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 4,
    "keywords_upright": ["休息", "恢复", "沉思", "暂退", "疗愈"],
    "keywords_reversed": ["躁动不安", "无法休息", "过度工作", "burnout"],
    "description": "宝剑四描绘骑士静卧休憩的场景。正位呼唤暂停休息、恢复精力，逆位表示该休息而不肯休息导致精力耗尽。"
  },
  {
    "id": "five-of-swords",
    "name_zh": "宝剑五",
    "name_en": "Five of Swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 5,
    "keywords_upright": ["冲突", "胜利的代价", "欺凌", "空赢"],
    "keywords_reversed": ["和解", "妥协", "放下争端", "和好"],
    "description": "宝剑五中胜者傲慢地收起败者的剑。正位代表赢了争论输了关系，逆位表示放下争斗寻求和解。"
  },
  {
    "id": "six-of-swords",
    "name_zh": "宝剑六",
    "name_en": "Six of Swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 6,
    "keywords_upright": ["过渡", "前进", "疗愈", "放手", "旅行"],
    "keywords_reversed": ["无法前进", "情绪包袱", "未解决的问题"],
    "description": "宝剑六中摆渡人载着一家人驶向平静彼岸。正位代表从困境过渡到平静，逆位表示放不下的情绪包袱。"
  },
  {
    "id": "seven-of-swords",
    "name_zh": "宝剑七",
    "name_en": "Seven of Swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 7,
    "keywords_upright": ["策略", "欺骗", "隐瞒", "智取", "不光明"],
    "keywords_reversed": ["真相大白", "归还", "认错", "策略失败"],
    "description": "宝剑七描绘有人偷偷带走五把剑。正位代表需要策略或小心行事（有时暗示欺骗），逆位表示秘密将被揭露。"
  },
  {
    "id": "eight-of-swords",
    "name_zh": "宝剑八",
    "name_en": "Eight of Swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 8,
    "keywords_upright": ["束缚", "无力感", "自我限制", "被困", "消极思维"],
    "keywords_reversed": ["解脱", "新视角", "自由", "突破限制"],
    "description": "宝剑八中蒙眼女子被剑阵围困。正位代表自我设限和消极思维造成的困局，逆位表示突破思维枷锁。"
  },
  {
    "id": "nine-of-swords",
    "name_zh": "宝剑九",
    "name_en": "Nine of Swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 9,
    "keywords_upright": ["焦虑", "失眠", "恐惧", "噩梦", "过度担忧"],
    "keywords_reversed": ["释然", "找到希望", "焦虑减轻", "求助"],
    "description": "宝剑九中人在深夜惊醒掩面而泣。正位代表焦虑和恐惧折磨，逆位表示最黑暗的时刻即将过去。"
  },
  {
    "id": "ten-of-swords",
    "name_zh": "宝剑十",
    "name_en": "Ten of Swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 10,
    "keywords_upright": ["终结", "低谷", "背叛", "最坏已过", "放手"],
    "keywords_reversed": ["复苏", "好转", "吸取教训", "反弹"],
    "description": "宝剑十中十把剑刺穿倒地之人，但远处曙光已现。正位代表最糟糕的时刻，但也是转机的开始。"
  },
  {
    "id": "page-of-swords",
    "name_zh": "宝剑侍从",
    "name_en": "Page of Swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 11,
    "keywords_upright": ["好奇", "新想法", "交流", "警惕", "信息"],
    "keywords_reversed": ["八卦", "空话", "缺乏深度", "焦躁"],
    "description": "宝剑侍从象征思维的好奇与警觉。正位代表新信息或沟通的开始，逆位提示流言或肤浅的言论。"
  },
  {
    "id": "knight-of-swords",
    "name_zh": "宝剑骑士",
    "name_en": "Knight of Swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 12,
    "keywords_upright": ["决心", "行动力", "追求真理", "思想锋利"],
    "keywords_reversed": ["鲁莽", "急躁", "缺乏准备", "好斗"],
    "description": "宝剑骑士是思维的行动者，策马直奔目标。正位代表果断行动和犀利思维，逆位警示操之过急。"
  },
  {
    "id": "queen-of-swords",
    "name_zh": "宝剑皇后",
    "name_en": "Queen of Swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 13,
    "keywords_upright": ["洞察", "独立", "清晰思维", "坦率", "智慧"],
    "keywords_reversed": ["冷漠", "刻薄", "过于理性", "苦涩"],
    "description": "宝剑皇后是理性与洞察力的化身。正位代表清晰的判断和独立精神，逆位表示过于冷酷或尖刻。"
  },
  {
    "id": "king-of-swords",
    "name_zh": "宝剑国王",
    "name_en": "King of Swords",
    "arcana": "minor",
    "suit": "swords",
    "number": 14,
    "keywords_upright": ["权威", "真理", "纪律", "逻辑", "公正"],
    "keywords_reversed": ["专制", "滥用权力", "冷血", "操纵"],
    "description": "宝剑国王是理智与权威的最高象征。正位代表公正的决断与逻辑的胜利，逆位表示权力滥用以达私利。"
  },
  {
    "id": "ace-of-pentacles",
    "name_zh": "星币王牌",
    "name_en": "Ace of Pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 1,
    "keywords_upright": ["新机会", "财富", "稳定", "种子", "实际"],
    "keywords_reversed": ["错失机会", "财务损失", "计划不周"],
    "description": "星币Ace象征土元素的纯粹物质能量，代表新的财务机会或实际成果的开始。坚持行动能带来丰硕收获。"
  },
  {
    "id": "two-of-pentacles",
    "name_zh": "星币二",
    "name_en": "Two of Pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 2,
    "keywords_upright": ["平衡", "兼顾", "弹性", "多任务", "适应"],
    "keywords_reversed": ["失衡", "混乱", "超负荷", "财务困境"],
    "description": "星币二描绘杂耍般平衡两枚星币的人。正位代表在多任务中游刃有余，逆位表示平衡被打破、应接不暇。"
  },
  {
    "id": "three-of-pentacles",
    "name_zh": "星币三",
    "name_en": "Three of Pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 3,
    "keywords_upright": ["团队合作", "技艺", "协作", "学习", "成长"],
    "keywords_reversed": ["缺乏合作", "平庸", "冲突", "不协调"],
    "description": "星币三描绘工匠协作的场景。正位代表团队合作和技术精进，逆位表示合作不力或质量下降。"
  },
  {
    "id": "four-of-pentacles",
    "name_zh": "星币四",
    "name_en": "Four of Pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 4,
    "keywords_upright": ["守财", "安全", "控制", "保守", "囤积"],
    "keywords_reversed": ["放下", "慷慨", "释出", "财务自由"],
    "description": "星币四的人紧紧抱住星币不肯放手。正位代表对财务安全的过度执着，逆位表示学会放手与分享。"
  },
  {
    "id": "five-of-pentacles",
    "name_zh": "星币五",
    "name_en": "Five of Pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 5,
    "keywords_upright": ["贫乏", "孤立", "被忽视", "困难", "危机"],
    "keywords_reversed": ["恢复", "重新被接纳", "灵性超越物质"],
    "description": "星币五描绘两个在雪中蹒跚的穷困之人。正位代表物质或精神上的匮乏与被忽视，逆位表示困境正在好转。"
  },
  {
    "id": "six-of-pentacles",
    "name_zh": "星币六",
    "name_en": "Six of Pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 6,
    "keywords_upright": ["慷慨", "施与受", "慈善", "公平", "平衡"],
    "keywords_reversed": ["吝啬", "债务", "不平等的给予", "施舍心态"],
    "description": "星币六描绘富人施舍穷人的场景。正位代表慷慨与公平的给予，逆位暗示给予中的不平等或被迫施舍。"
  },
  {
    "id": "seven-of-pentacles",
    "name_zh": "星币七",
    "name_en": "Seven of Pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 7,
    "keywords_upright": ["耐心", "评估", "等待收获", "投资", "反思"],
    "keywords_reversed": ["急躁", "白费功夫", "投资失误", "过早放弃"],
    "description": "星币七中园丁凝望正在生长的星币作物。正位代表等待付出开花结果，逆位表示对回报不满或投资失败。"
  },
  {
    "id": "eight-of-pentacles",
    "name_zh": "星币八",
    "name_en": "Eight of Pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 8,
    "keywords_upright": ["勤奋", "技艺", "专注", "精进", "学徒"],
    "keywords_reversed": ["懒惰", "缺乏动力", "工艺粗糙", "倦怠"],
    "description": "星币八描绘工匠专注雕刻星币的场景。正位代表精益求精与专注投入，逆位表示对工作失去热情或敷衍了事。"
  },
  {
    "id": "nine-of-pentacles",
    "name_zh": "星币九",
    "name_en": "Nine of Pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 9,
    "keywords_upright": ["独立", "富足", "优雅", "成就", "自主"],
    "keywords_reversed": ["财务问题", "过度依赖", "表面繁荣"],
    "description": "星币九描绘一位优雅自足的女士。正位代表通过自身努力获得的独立与富足，逆位表示财务上的虚有其表。"
  },
  {
    "id": "ten-of-pentacles",
    "name_zh": "星币十",
    "name_en": "Ten of Pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 10,
    "keywords_upright": ["传承", "财富", "家族", "持久", "根基"],
    "keywords_reversed": ["家族纷争", "财务损失", "遗产问题"],
    "description": "星币十描绘三代同堂的富足场景。正位代表持久的财富与家族传承，逆位暗示家族内部的经济纠纷。"
  },
  {
    "id": "page-of-pentacles",
    "name_zh": "星币侍从",
    "name_en": "Page of Pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 11,
    "keywords_upright": ["学习", "务实", "新技能", "机会", "勤奋"],
    "keywords_reversed": ["缺乏进步", "懒惰", "机会流失", "不切实际"],
    "description": "星币侍从象征对物质世界的学习与探索。正位代表新的学习或财务机会，逆位表示缺乏进展或不够脚踏实地。"
  },
  {
    "id": "knight-of-pentacles",
    "name_zh": "星币骑士",
    "name_en": "Knight of Pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 12,
    "keywords_upright": ["勤奋", "效率", "坚持不懈", "责任感"],
    "keywords_reversed": ["停滞", "懒惰", "固执", "无趣"],
    "description": "星币骑士虽然行动最慢但却是最可靠的。正位代表稳扎稳打与责任担当，逆位表示过于保守而错失良机。"
  },
  {
    "id": "queen-of-pentacles",
    "name_zh": "星币皇后",
    "name_en": "Queen of Pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 13,
    "keywords_upright": ["滋养", "务实", "富足", "安稳", "持家"],
    "keywords_reversed": ["财务问题", "忽视家庭", "过度工作"],
    "description": "星币皇后是物质与滋养的完美结合。正位代表稳定舒适的生活和实际关怀，逆位表示工作与家庭的失衡。"
  },
  {
    "id": "king-of-pentacles",
    "name_zh": "星币国王",
    "name_en": "King of Pentacles",
    "arcana": "minor",
    "suit": "pentacles",
    "number": 14,
    "keywords_upright": ["财富", "事业成功", "稳定", "务实", "安全感"],
    "keywords_reversed": ["贪婪", "物质至上", "财务问题", "腐败"],
    "description": "星币国王是物质成就的最高代表。正位代表稳固的财富与事业成功，逆位警示过度追求物质而丧失人性。"
  }
]
```

- [ ] **Step 2: Verify JSON is valid**

```bash
cd backend && python -c "import json; data=json.load(open('data/cards.json','r',encoding='utf-8')); print(f'{len(data)} cards loaded')"
```
Expected: `78 cards loaded`

- [ ] **Step 3: Commit**

```bash
git add backend/data/cards.json
git commit -m "feat: add complete 78-card tarot data"
```

---

### Task 5: Create Spreads Data

**Files:**
- Create: `backend/data/spreads.json`

- [ ] **Step 1: Write spreads.json with 4 spreads**

```json
[
  {
    "id": "single-card",
    "name_zh": "单张牌",
    "description": "最简单的牌阵，抽取一张牌作为今日指引或对问题的直接回答。适合需要简单方向的时候。",
    "card_count": 1,
    "positions": [
      {
        "index": 0,
        "label": "今日指引",
        "meaning": "当前问题的核心指引或答案"
      }
    ],
    "tags": ["通用", "快速"]
  },
  {
    "id": "three-card",
    "name_zh": "三张牌",
    "description": "最经典的时间线牌阵，以过去、现在、未来三张牌揭示事情的发展脉络。适合大多数日常问题。",
    "card_count": 3,
    "positions": [
      {
        "index": 0,
        "label": "过去",
        "meaning": "影响当前局面的过往因素或根源"
      },
      {
        "index": 1,
        "label": "现在",
        "meaning": "当前的真实状况或面临的挑战"
      },
      {
        "index": 2,
        "label": "未来",
        "meaning": "按照当前趋势发展的可能结果"
      }
    ],
    "tags": ["通用", "感情", "事业"]
  },
  {
    "id": "relationship",
    "name_zh": "关系牌阵",
    "description": "专为感情和人际关系设计的七张牌阵，深度解析双方的动力、感受与未来走向。适合感情问题。",
    "card_count": 7,
    "positions": [
      {
        "index": 0,
        "label": "你自己",
        "meaning": "你在这段关系中的角色与状态"
      },
      {
        "index": 1,
        "label": "对方",
        "meaning": "对方在这段关系中的角色与状态"
      },
      {
        "index": 2,
        "label": "关系现状",
        "meaning": "你们之间当前的关系本质"
      },
      {
        "index": 3,
        "label": "你的感受",
        "meaning": "你内心深处对这段关系的真实感受"
      },
      {
        "index": 4,
        "label": "对方的感受",
        "meaning": "对方内心深处对这段关系的真实感受"
      },
      {
        "index": 5,
        "label": "障碍",
        "meaning": "关系当前面临的主要挑战或阻碍"
      },
      {
        "index": 6,
        "label": "未来走向",
        "meaning": "关系未来的可能发展方向"
      }
    ],
    "tags": ["感情", "关系"]
  },
  {
    "id": "celtic-cross",
    "name_zh": "凯尔特十字",
    "description": "塔罗中最全面深入的牌阵，十张牌全方位解析问题的各个维度。适合人生重大决策或深度自我探索。",
    "card_count": 10,
    "positions": [
      {
        "index": 0,
        "label": "现状",
        "meaning": "当前问题的核心本质与你的位置"
      },
      {
        "index": 1,
        "label": "障碍",
        "meaning": "横在面前的直接挑战或阻力"
      },
      {
        "index": 2,
        "label": "过去",
        "meaning": "问题的根源与过往基础"
      },
      {
        "index": 3,
        "label": "未来",
        "meaning": "即将到来的近期发展"
      },
      {
        "index": 4,
        "label": "目标",
        "meaning": "你内心真正追求的目标或最佳结果"
      },
      {
        "index": 5,
        "label": "基础",
        "meaning": "支撑当前局面的潜意识或过往经历"
      },
      {
        "index": 6,
        "label": "自我",
        "meaning": "你当下的态度与视角"
      },
      {
        "index": 7,
        "label": "环境",
        "meaning": "外部环境与他人的影响"
      },
      {
        "index": 8,
        "label": "希望与恐惧",
        "meaning": "你内心的希望或恐惧如何影响局面"
      },
      {
        "index": 9,
        "label": "结果",
        "meaning": "按照当前路径发展的最终可能结果"
      }
    ],
    "tags": ["通用", "深度", "事业"]
  }
]
```

- [ ] **Step 2: Verify JSON is valid**

```bash
cd backend && python -c "import json; data=json.load(open('data/spreads.json','r',encoding='utf-8')); print(f'{len(data)} spreads loaded')"
```
Expected: `4 spreads loaded`

- [ ] **Step 3: Commit**

```bash
git add backend/data/spreads.json
git commit -m "feat: add 4 spread definitions"
```

---

## Phase 3: Backend Services & API

### Task 6: Build Recommendation Engine

**Files:**
- Create: `backend/services/__init__.py` (empty)
- Create: `backend/services/recommend_engine.py`
- Create: `backend/tests/__init__.py` (empty)
- Create: `backend/tests/test_recommend.py`

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_recommend.py
import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.recommend_engine import recommend_spreads


def load_spreads():
    path = os.path.join(os.path.dirname(__file__), '..', 'data', 'spreads.json')
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def test_recommend_relationship_question():
    spreads = load_spreads()
    result = recommend_spreads("他喜欢我吗", spreads)
    assert len(result) >= 1
    assert len(result) <= 3
    # 关系牌阵应该排第一
    assert result[0]["id"] == "relationship"


def test_recommend_career_question():
    spreads = load_spreads()
    result = recommend_spreads("我该不该跳槽", spreads)
    assert len(result) >= 1
    # 凯尔特十字或三张牌应该在前列
    ids = [s["id"] for s in result]
    assert "celtic-cross" in ids or "three-card" in ids


def test_recommend_default_for_vague_question():
    spreads = load_spreads()
    result = recommend_spreads("今天怎么样", spreads)
    assert len(result) >= 1
    # 默认推荐三张牌或单张牌
    assert result[0]["id"] in ["three-card", "single-card"]


def test_recommend_returns_max_3():
    spreads = load_spreads()
    result = recommend_spreads("我应该怎么做才能更幸福", spreads)
    assert len(result) <= 3


def test_recommend_empty_question():
    spreads = load_spreads()
    result = recommend_spreads("", spreads)
    # 空问题也应返回默认推荐
    assert len(result) >= 1
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd backend && python -m pytest tests/test_recommend.py -v
```
Expected: FAIL — module not found

- [ ] **Step 3: Write recommend_engine.py**

```python
"""Keyword-based spread recommendation engine."""


# Keyword-to-tag mapping
KEYWORD_TAG_MAP = {
    "感情": ["感情", "关系"],
    "喜欢": ["感情", "关系"],
    "爱": ["感情", "关系"],
    "恋爱": ["感情", "关系"],
    "分手": ["感情", "关系"],
    "他": ["感情", "关系"],
    "她": ["感情", "关系"],
    "对象": ["感情", "关系"],
    "关系": ["感情", "关系"],
    "婚姻": ["感情", "关系"],
    "暗恋": ["感情", "关系"],
    "表白": ["感情", "关系"],

    "事业": ["事业", "选择"],
    "工作": ["事业", "选择"],
    "跳槽": ["事业", "选择"],
    "面试": ["事业", "选择"],
    "职业": ["事业", "选择"],
    "升职": ["事业", "选择"],
    "辞职": ["事业", "选择"],
    "老板": ["事业", "选择"],
    "同事": ["事业", "选择"],

    "财运": ["财运", "选择"],
    "投资": ["财运", "选择"],
    "钱": ["财运", "选择"],
    "财务": ["财运", "选择"],
    "经济": ["财运", "选择"],

    "人生": ["通用", "深度"],
    "迷茫": ["通用", "深度"],
    "方向": ["通用", "选择"],
    "未来": ["通用"],
    "选择": ["通用", "选择"],
    "决定": ["通用", "选择"],
    "怎么办": ["通用", "选择"],
}

DEFAULT_TAGS = ["通用"]


def recommend_spreads(question: str, spreads: list[dict]) -> list[dict]:
    """Analyze question keywords and return top 3 matching spreads.

    Args:
        question: User's question text (Chinese)
        spreads: List of spread definitions with 'tags' field

    Returns:
        Up to 3 spreads sorted by relevance score (descending)
    """
    if not question.strip():
        return _default_spreads(spreads)

    # Count tag matches
    tag_scores: dict[str, int] = {}
    for keyword, tags in KEYWORD_TAG_MAP.items():
        if keyword in question:
            for tag in tags:
                tag_scores[tag] = tag_scores.get(tag, 0) + 1

    # If no keywords matched, use default tags
    if not tag_scores:
        matched_tags = DEFAULT_TAGS
    else:
        # Sort tags by score descending
        matched_tags = sorted(tag_scores, key=tag_scores.get, reverse=True)

    # Score each spread by how many of its tags match
    scored = []
    for spread in spreads:
        score = 0
        for i, tag in enumerate(matched_tags):
            if tag in spread["tags"]:
                # Higher score for higher-ranked tags
                score += len(matched_tags) - i
        scored.append((score, spread))

    # Sort by score descending, then by card_count ascending (simpler spreads first as tiebreaker)
    scored.sort(key=lambda x: (-x[0], x[1]["card_count"]))

    # Return top 3 (always include at least one result)
    result = [s for _, s in scored if _ > 0 or len(scored) <= 3]
    if not result:
        result = _default_spreads(spreads)

    return result[:3]


def _default_spreads(spreads: list[dict]) -> list[dict]:
    """Return default spreads: three-card first, then single-card."""
    three_card = next((s for s in spreads if s["id"] == "three-card"), None)
    single_card = next((s for s in spreads if s["id"] == "single-card"), None)
    result = []
    if three_card:
        result.append(three_card)
    if single_card:
        result.append(single_card)
    if not result:
        result = spreads[:1]
    return result
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd backend && python -m pytest tests/test_recommend.py -v
```
Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add backend/services/ backend/tests/
git commit -m "feat: add keyword-based spread recommendation engine"
```

---

### Task 7: Build Claude AI Interpreter

**Files:**
- Create: `backend/services/interpreter.py`
- Create: `backend/tests/test_interpreter.py`

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_interpreter.py
import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.interpreter import build_interpretation_prompt


def load_cards():
    path = os.path.join(os.path.dirname(__file__), '..', 'data', 'cards.json')
    with open(path, 'r', encoding='utf-8') as f:
        return {c["id"]: c for c in json.load(f)}


def load_spreads():
    path = os.path.join(os.path.dirname(__file__), '..', 'data', 'spreads.json')
    with open(path, 'r', encoding='utf-8') as f:
        return {s["id"]: s for s in json.load(f)}


def test_build_prompt_includes_question():
    cards = load_cards()
    spreads = load_spreads()
    drawn = [
        {"position_index": 0, "card_id": "fool", "reversed": False},
        {"position_index": 1, "card_id": "lovers", "reversed": True},
    ]
    sp = spreads["three-card"]
    prompt = build_interpretation_prompt("我的感情怎么样", sp, drawn, cards)
    assert "我的感情怎么样" in prompt


def test_build_prompt_includes_card_names():
    cards = load_cards()
    spreads = load_spreads()
    drawn = [
        {"position_index": 0, "card_id": "fool", "reversed": False},
    ]
    sp = spreads["single-card"]
    prompt = build_interpretation_prompt("今天怎么样", sp, drawn, cards)
    assert "愚者" in prompt
    assert "The Fool" in prompt


def test_build_prompt_includes_position_labels():
    cards = load_cards()
    spreads = load_spreads()
    drawn = [
        {"position_index": 0, "card_id": "fool", "reversed": False},
        {"position_index": 1, "card_id": "lovers", "reversed": True},
        {"position_index": 2, "card_id": "star", "reversed": False},
    ]
    sp = spreads["three-card"]
    prompt = build_interpretation_prompt("test", sp, drawn, cards)
    assert "过去" in prompt
    assert "现在" in prompt
    assert "未来" in prompt


def test_build_prompt_includes_reversed_marker():
    cards = load_cards()
    spreads = load_spreads()
    drawn = [
        {"position_index": 0, "card_id": "lovers", "reversed": True},
    ]
    sp = spreads["single-card"]
    prompt = build_interpretation_prompt("test", sp, drawn, cards)
    assert "逆位" in prompt


def test_build_prompt_includes_output_format_instruction():
    cards = load_cards()
    spreads = load_spreads()
    drawn = [
        {"position_index": 0, "card_id": "fool", "reversed": False},
    ]
    sp = spreads["single-card"]
    prompt = build_interpretation_prompt("test", sp, drawn, cards)
    assert "narrative" in prompt.lower()
    assert "json" in prompt.lower()
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd backend && python -m pytest tests/test_interpreter.py -v
```
Expected: FAIL — module not found

- [ ] **Step 3: Write interpreter.py**

```python
"""Claude API integration for tarot interpretation."""

import json
import os
from anthropic import Anthropic


SYSTEM_PROMPT = """你是一位经验丰富、富有同理心的塔罗牌解读师。你的解读风格兼具深度与温暖，像一位智慧的朋友在对话。

解读原则：
1. 关注心理洞察与内在成长，而非神秘学式的预言
2. 强调自由意志与个人能动性——塔罗牌提供的是洞察而非注定的命运
3. 将每张牌的含义与它在牌阵中的位置结合，理解上下文
4. 将多张牌串联成一个连贯的叙事，而非孤立解读每一张
5. 语言温暖、平实，避免过于玄奥难懂的术语

请以 JSON 格式返回你的解读。"""


def build_interpretation_prompt(
    question: str,
    spread: dict,
    drawn_cards: list[dict],
    cards_map: dict[str, dict],
) -> str:
    """Build the Claude prompt for a tarot interpretation.

    Args:
        question: User's original question
        spread: Spread definition with positions
        drawn_cards: List of {position_index, card_id, reversed}
        cards_map: Dict mapping card_id to card data

    Returns:
        Complete prompt string for Claude
    """
    # Sort drawn cards by position
    sorted_cards = sorted(drawn_cards, key=lambda d: d["position_index"])

    # Build card details
    cards_text = ""
    for dc in sorted_cards:
        card = cards_map[dc["card_id"]]
        pos = spread["positions"][dc["position_index"]]
        orientation = "逆位" if dc["reversed"] else "正位"
        keywords = card["keywords_reversed"] if dc["reversed"] else card["keywords_upright"]
        cards_text += f"""
位置「{pos['label']}」— {orientation}
牌名：{card['name_zh']} ({card['name_en']})
关键词：{'、'.join(keywords)}
牌面简述：{card['description']}
"""

    # Build position meanings
    positions_text = ""
    for pos in spread["positions"]:
        positions_text += f"- {pos['label']}：{pos['meaning']}\n"

    prompt = f"""用户的问题：「{question}」

使用的牌阵：{spread['name_zh']}
牌阵说明：
{positions_text}
抽取的牌：
{cards_text}
请将以上牌串联起来，给出一个温暖而有洞察力的整体解读。输出格式如下（严格 JSON）：

{{
  "narrative": "整体叙事——将各张牌串联成一个连贯的故事，指出牌与牌之间的关联、因果和能量流动。300-500字。",
  "individual": [
    {{
      "position": "位置名称",
      "reading": "该位置牌的单张解读，结合位置含义和正逆位。100-200字。"
    }}
  ],
  "guidance": {{
    "key_points": ["3-5条关键指引"],
    "cautions": ["2-3条需要注意的事项"]
  }}
}}"""

    return prompt


async def interpret_with_claude(
    question: str,
    spread: dict,
    drawn_cards: list[dict],
    cards_map: dict[str, dict],
    api_key: str | None = None,
) -> dict:
    """Send interpretation request to Claude API.

    Args:
        question: User's original question
        spread: Spread definition
        drawn_cards: Cards drawn with positions
        cards_map: All tarot card data
        api_key: Anthropic API key (defaults to ANTHROPIC_API_KEY env var)

    Returns:
        Parsed interpretation dict with narrative, individual, guidance
    """
    if api_key is None:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable is not set")

    client = Anthropic(api_key=api_key)
    prompt = build_interpretation_prompt(question, spread, drawn_cards, cards_map)

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )

    # Extract JSON from response
    response_text = message.content[0].text
    # Find JSON block in response (handle markdown code fences)
    if "```json" in response_text:
        start = response_text.index("```json") + 7
        end = response_text.index("```", start)
        response_text = response_text[start:end].strip()
    elif "```" in response_text:
        start = response_text.index("```") + 3
        end = response_text.index("```", start)
        response_text = response_text[start:end].strip()

    result = json.loads(response_text)

    # Enrich individual readings with card data
    sorted_cards = sorted(drawn_cards, key=lambda d: d["position_index"])
    for i, dc in enumerate(sorted_cards):
        if i < len(result.get("individual", [])):
            card = cards_map[dc["card_id"]]
            result["individual"][i]["card"] = card
            result["individual"][i]["reversed"] = dc["reversed"]

    return result
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd backend && python -m pytest tests/test_interpreter.py -v
```
Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add backend/services/interpreter.py backend/tests/test_interpreter.py
git commit -m "feat: add Claude AI interpretation service"
```

---

### Task 8: Create FastAPI Application

**Files:**
- Create: `backend/main.py`

- [ ] **Step 1: Write main.py**

```python
"""Tarot Reading API — FastAPI application."""

import json
import os
import random
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models.schemas import (
    RecommendRequest,
    RecommendResponse,
    InterpretRequest,
    InterpretResponse,
    Spread,
    TarotCard,
)
from services.recommend_engine import recommend_spreads
from services.interpreter import interpret_with_claude

load_dotenv()

app = FastAPI(title="Tarot Reading API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent / "data"

# Load data at startup
_cards: list[dict] = []
_spreads: list[dict] = []
_cards_map: dict[str, dict] = {}
_spreads_map: dict[str, dict] = {}


def _load_data():
    global _cards, _spreads, _cards_map, _spreads_map
    with open(DATA_DIR / "cards.json", "r", encoding="utf-8") as f:
        _cards = json.load(f)
        _cards_map = {c["id"]: c for c in _cards}
    with open(DATA_DIR / "spreads.json", "r", encoding="utf-8") as f:
        _spreads = json.load(f)
        _spreads_map = {s["id"]: s for s in _spreads}


_load_data()


@app.get("/api/cards")
async def get_cards() -> list[TarotCard]:
    """Return all 78 tarot cards."""
    return [TarotCard(**c) for c in _cards]


@app.get("/api/spreads")
async def get_spreads() -> list[Spread]:
    """Return all available spreads."""
    return [Spread(**s) for s in _spreads]


@app.post("/api/recommend")
async def recommend(req: RecommendRequest) -> RecommendResponse:
    """Recommend spreads based on the user's question."""
    recommended = recommend_spreads(req.question, _spreads)
    keywords = _extract_keywords(req.question)
    return RecommendResponse(
        spreads=[Spread(**s) for s in recommended],
        keywords=keywords,
    )


@app.post("/api/interpret")
async def interpret(req: InterpretRequest) -> InterpretResponse:
    """Generate AI interpretation for drawn cards."""
    spread = _spreads_map.get(req.spread_id)
    if not spread:
        raise HTTPException(status_code=404, detail=f"Spread '{req.spread_id}' not found")

    # Validate card count matches spread
    if len(req.cards) != spread["card_count"]:
        raise HTTPException(
            status_code=400,
            detail=f"Spread '{req.spread_id}' requires {spread['card_count']} cards, got {len(req.cards)}",
        )

    # Validate position indices
    for dc in req.cards:
        if dc.position_index < 0 or dc.position_index >= spread["card_count"]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid position_index: {dc.position_index}",
            )
        if dc.card_id not in _cards_map:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown card_id: {dc.card_id}",
            )

    try:
        result = await interpret_with_claude(
            req.question,
            spread,
            [dc.model_dump() for dc in req.cards],
            _cards_map,
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {str(e)}")

    return InterpretResponse(**result)


@app.get("/api/draw")
async def draw_cards(spread_id: str, count: int | None = None):
    """Randomly draw cards for a spread."""
    spread = _spreads_map.get(spread_id)
    if not spread:
        raise HTTPException(status_code=404, detail=f"Spread '{spread_id}' not found")

    n = count or spread["card_count"]
    drawn_indices = random.sample(range(len(_cards)), n)
    cards = []
    for i, idx in enumerate(drawn_indices):
        cards.append({
            "position_index": i,
            "card": TarotCard(**_cards[idx]),
            "reversed": random.random() < 0.3,  # 30% chance reversed
        })
    return {"cards": cards, "spread": Spread(**spread)}


def _extract_keywords(question: str) -> list[str]:
    """Extract matching category keywords from the question."""
    from services.recommend_engine import KEYWORD_TAG_MAP

    found_tags = set()
    for keyword, tags in KEYWORD_TAG_MAP.items():
        if keyword in question:
            found_tags.update(tags)
    return list(found_tags) if found_tags else ["通用"]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
```

- [ ] **Step 2: Create .env file**

```bash
echo "ANTHROPIC_API_KEY=your-api-key-here" > backend/.env
```

- [ ] **Step 3: Verify app starts**

```bash
cd backend && python -c "from main import app; print('App loaded OK')"
```
Expected: `App loaded OK`

- [ ] **Step 4: Commit**

```bash
git add backend/main.py backend/.env
git commit -m "feat: add FastAPI application with all endpoints"
```

---

## Phase 4: Frontend Foundation

### Task 9: Create Frontend Types and API Client

**Files:**
- Create: `frontend/src/types/index.ts`
- Create: `frontend/src/api/client.ts`

- [ ] **Step 1: Write types/index.ts**

```typescript
// frontend/src/types/index.ts

export interface TarotCard {
  id: string;
  name_zh: string;
  name_en: string;
  arcana: string;
  suit: string | null;
  number: number;
  keywords_upright: string[];
  keywords_reversed: string[];
  description: string;
}

export interface Position {
  index: number;
  label: string;
  meaning: string;
}

export interface Spread {
  id: string;
  name_zh: string;
  description: string;
  card_count: number;
  positions: Position[];
  tags: string[];
}

export interface RecommendRequest {
  question: string;
}

export interface RecommendResponse {
  spreads: Spread[];
  keywords: string[];
}

export interface DrawnCard {
  position_index: number;
  card_id: string;
  reversed: boolean;
}

export interface DrawnCardWithData {
  position_index: number;
  card: TarotCard;
  reversed: boolean;
}

export interface InterpretRequest {
  question: string;
  spread_id: string;
  cards: DrawnCard[];
}

export interface IndividualReading {
  position: string;
  card: TarotCard;
  reversed: boolean;
  reading: string;
}

export interface Guidance {
  key_points: string[];
  cautions: string[];
}

export interface InterpretResponse {
  narrative: string;
  individual: IndividualReading[];
  guidance: Guidance;
}

export interface ReadingSession {
  question: string;
  spread: Spread | null;
  drawnCards: DrawnCardWithData[];
  interpretation: InterpretResponse | null;
}
```

- [ ] **Step 2: Write api/client.ts**

```typescript
// frontend/src/api/client.ts

const API_BASE = 'http://localhost:8000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

import type {
  TarotCard,
  Spread,
  RecommendRequest,
  RecommendResponse,
  InterpretRequest,
  InterpretResponse,
  DrawnCardWithData,
} from '../types';

export async function fetchCards(): Promise<TarotCard[]> {
  return request<TarotCard[]>('/cards');
}

export async function fetchSpreads(): Promise<Spread[]> {
  return request<Spread[]>('/spreads');
}

export async function recommendSpreads(question: string): Promise<RecommendResponse> {
  return request<RecommendResponse>('/recommend', {
    method: 'POST',
    body: JSON.stringify({ question } as RecommendRequest),
  });
}

export async function interpretReading(
  question: string,
  spreadId: string,
  cards: { position_index: number; card_id: string; reversed: boolean }[]
): Promise<InterpretResponse> {
  return request<InterpretResponse>('/interpret', {
    method: 'POST',
    body: JSON.stringify({
      question,
      spread_id: spreadId,
      cards,
    } as InterpretRequest),
  });
}

export async function drawCards(
  spreadId: string,
  count?: number
): Promise<{ cards: DrawnCardWithData[]; spread: Spread }> {
  const params = new URLSearchParams({ spread_id: spreadId });
  if (count) params.set('count', String(count));
  return request(`/draw?${params}`);
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/types/ frontend/src/api/
git commit -m "feat: add frontend types and API client"
```

---

### Task 10: Create Reading Context

**Files:**
- Create: `frontend/src/context/ReadingContext.tsx`

- [ ] **Step 1: Write ReadingContext.tsx**

```typescript
// frontend/src/context/ReadingContext.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReadingSession, Spread, DrawnCardWithData, InterpretResponse } from '../types';

interface ReadingContextType {
  session: ReadingSession;
  setQuestion: (question: string) => void;
  setSpread: (spread: Spread) => void;
  setDrawnCards: (cards: DrawnCardWithData[]) => void;
  setInterpretation: (result: InterpretResponse) => void;
  resetSession: () => void;
}

const initialSession: ReadingSession = {
  question: '',
  spread: null,
  drawnCards: [],
  interpretation: null,
};

const ReadingContext = createContext<ReadingContextType | null>(null);

export function ReadingProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ReadingSession>(initialSession);

  const setQuestion = useCallback((question: string) => {
    setSession(prev => ({ ...prev, question }));
  }, []);

  const setSpread = useCallback((spread: Spread) => {
    setSession(prev => ({ ...prev, spread }));
  }, []);

  const setDrawnCards = useCallback((cards: DrawnCardWithData[]) => {
    setSession(prev => ({ ...prev, drawnCards: cards }));
  }, []);

  const setInterpretation = useCallback((result: InterpretResponse) => {
    setSession(prev => ({ ...prev, interpretation: result }));
  }, []);

  const resetSession = useCallback(() => {
    setSession(initialSession);
  }, []);

  return (
    <ReadingContext.Provider
      value={{ session, setQuestion, setSpread, setDrawnCards, setInterpretation, resetSession }}
    >
      {children}
    </ReadingContext.Provider>
  );
}

export function useReading() {
  const ctx = useContext(ReadingContext);
  if (!ctx) throw new Error('useReading must be used within ReadingProvider');
  return ctx;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/context/
git commit -m "feat: add reading session context"
```

---

## Phase 5: Frontend Pages & Components

### Task 11: Create Global Styles

**Files:**
- Create: `frontend/src/styles/global.css`

- [ ] **Step 1: Write global.css**

```css
/* frontend/src/styles/global.css */

:root {
  --color-bg: #0f0a1a;
  --color-surface: #1a1230;
  --color-surface-raised: #231b40;
  --color-border: #2d2450;
  --color-text: #e8e0f0;
  --color-text-dim: #9888b0;
  --color-accent: #a78bfa;
  --color-accent-glow: rgba(167, 139, 250, 0.3);
  --color-gold: #f0c060;
  --color-gold-glow: rgba(240, 192, 96, 0.3);
  --color-reverse: #f06080;
  --color-positive: #34d399;
  --color-warning: #f59e0b;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.5rem;
  --text-2xl: 2rem;

  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  height: 100%;
}

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* Subtle animated background */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(167, 139, 250, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(240, 192, 96, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(167, 139, 250, 0.06) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

#root {
  position: relative;
  z-index: 1;
}

.page {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-lg);
  min-height: 100vh;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: 12px 24px;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast);
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-accent), #8b5cf6);
  color: white;
  box-shadow: 0 4px 24px var(--color-accent-glow);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 32px var(--color-accent-glow);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-dim);
  border: 1px solid var(--color-border);
}

.btn-ghost:hover {
  color: var(--color-text);
  border-color: var(--color-accent);
}

input, textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: var(--text-base);
  transition: border-color var(--duration-fast);
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-glow);
}

input::placeholder {
  color: var(--color-text-dim);
}

.card-surface {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}

.card-glow {
  box-shadow: 0 0 24px var(--color-accent-glow);
  border-color: var(--color-accent);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-banner {
  background: rgba(240, 96, 128, 0.1);
  border: 1px solid var(--color-reverse);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  color: var(--color-reverse);
  text-align: center;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/styles/
git commit -m "feat: add global styles with tarot theme"
```

---

### Task 12: Create App Shell and Router

**Files:**
- Create: `frontend/src/App.tsx`
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: Write App.tsx**

```typescript
// frontend/src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ReadingProvider } from './context/ReadingContext';
import HomePage from './pages/HomePage';
import RecommendPage from './pages/RecommendPage';
import DrawPage from './pages/DrawPage';
import InterpretPage from './pages/InterpretPage';

export default function App() {
  return (
    <BrowserRouter>
      <ReadingProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recommend" element={<RecommendPage />} />
          <Route path="/draw" element={<DrawPage />} />
          <Route path="/interpret" element={<InterpretPage />} />
        </Routes>
      </ReadingProvider>
    </BrowserRouter>
  );
}
```

- [ ] **Step 2: Update main.tsx**

```typescript
// frontend/src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```
Expected: Errors for missing page modules — this is expected, will resolve as pages are created

- [ ] **Step 4: Commit**

```bash
git add frontend/src/App.tsx frontend/src/main.tsx
git commit -m "feat: add app shell with router and context provider"
```

---

### Task 13: Create HomePage

**Files:**
- Create: `frontend/src/pages/HomePage.tsx`
- Create: `frontend/src/components/QuestionInput.tsx`

- [ ] **Step 1: Write QuestionInput component**

```typescript
// frontend/src/components/QuestionInput.tsx

import { useState } from 'react';

interface Props {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

export default function QuestionInput({ onSubmit, isLoading }: Props) {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (trimmed && !isLoading) {
      onSubmit(trimmed);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 480 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="请输入你的问题..."
          autoFocus
          disabled={isLoading}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={!question.trim() || isLoading}>
          {isLoading ? <span className="spinner" /> : '🔮'}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Write HomePage**

```typescript
// frontend/src/pages/HomePage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import QuestionInput from '../components/QuestionInput';
import { useReading } from '../context/ReadingContext';
import { recommendSpreads } from '../api/client';
import type { Spread } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const { setQuestion, setSpread } = useReading();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (question: string) => {
    setIsLoading(true);
    setError('');
    setQuestion(question);

    try {
      const result = await recommendSpreads(question);
      navigate('/recommend', { state: { recommendations: result } });
    } catch {
      setError('无法连接到服务器，请确保后端已启动');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowseAll = async () => {
    // Navigate to recommend with empty question to see all spreads
    navigate('/recommend', { state: { recommendations: null } });
  };

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: 64, lineHeight: 1 }}
        >
          🃏
        </motion.div>

        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
          塔罗指引
        </h1>

        <p style={{ color: 'var(--color-text-dim)', maxWidth: 360, lineHeight: 1.8 }}>
          静心思考你的问题，然后输入下方<br />
          系统将为你推荐最合适的牌阵
        </p>

        <QuestionInput onSubmit={handleSubmit} isLoading={isLoading} />

        {error && <div className="error-banner">{error}</div>}

        <button onClick={handleBrowseAll} className="btn btn-ghost" style={{ fontSize: 'var(--text-sm)' }}>
          或 手动浏览全部牌阵 →
        </button>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/HomePage.tsx frontend/src/components/QuestionInput.tsx
git commit -m "feat: add home page with question input"
```

---

### Task 14: Create RecommendPage

**Files:**
- Create: `frontend/src/pages/RecommendPage.tsx`
- Create: `frontend/src/components/SpreadCard.tsx`

- [ ] **Step 1: Write SpreadCard component**

```typescript
// frontend/src/components/SpreadCard.tsx

import { motion } from 'framer-motion';
import type { Spread } from '../types';

interface Props {
  spread: Spread;
  recommended: boolean;
  onSelect: (spread: Spread) => void;
}

export default function SpreadCard({ spread, recommended, onSelect }: Props) {
  return (
    <motion.div
      className={`card-surface ${recommended ? 'card-glow' : ''}`}
      onClick={() => onSelect(spread)}
      whileHover={{ y: -4 }}
      style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
    >
      {recommended && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: 'var(--color-accent)', color: 'white',
          padding: '4px 12px', fontSize: 'var(--text-sm)',
          borderBottomLeftRadius: 'var(--radius-sm)',
        }}>
          推荐
        </div>
      )}
      <div style={{ fontSize: 28, marginBottom: 8 }}>
        {spread.id === 'single-card' ? '🔮' :
         spread.id === 'three-card' ? '✨' :
         spread.id === 'relationship' ? '💞' : '🌟'}
      </div>
      <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 4 }}>
        {spread.name_zh}
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-dim)', marginLeft: 8 }}>
          {spread.card_count}张牌
        </span>
      </h3>
      <p style={{ color: 'var(--color-text-dim)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
        {spread.description}
      </p>
      <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
        {spread.tags.map(tag => (
          <span key={tag} style={{
            fontSize: 'var(--text-sm)', color: 'var(--color-accent)',
            background: 'rgba(167,139,250,0.1)', padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
          }}>
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Write RecommendPage**

```typescript
// frontend/src/pages/RecommendPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SpreadCard from '../components/SpreadCard';
import { useReading } from '../context/ReadingContext';
import { fetchSpreads } from '../api/client';
import type { Spread, RecommendResponse } from '../types';

export default function RecommendPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, setSpread } = useReading();
  const [allSpreads, setAllSpreads] = useState<Spread[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const recs = (location.state as any)?.recommendations as RecommendResponse | null;
    setRecommendations(recs);

    fetchSpreads()
      .then(setAllSpreads)
      .catch(() => setError('加载牌阵失败'));
  }, [location.state]);

  const handleSelect = (spread: Spread) => {
    setSpread(spread);
    navigate('/draw');
  };

  const displayedSpreads = recommendations
    ? recommendations.spreads
    : allSpreads;

  return (
    <div className="page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 4 }}>
          选择牌阵
        </h2>
        {session.question && (
          <p style={{ color: 'var(--color-text-dim)', marginBottom: 24 }}>
            针对「{session.question}」推荐以下牌阵：
          </p>
        )}
        {!session.question && (
          <p style={{ color: 'var(--color-text-dim)', marginBottom: 24 }}>
            浏览全部可用牌阵：
          </p>
        )}

        {error && <div className="error-banner" style={{ marginBottom: 16 }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {displayedSpreads.map((spread, i) => (
            <SpreadCard
              key={spread.id}
              spread={spread}
              recommended={recommendations !== null && i === 0}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <button
          onClick={() => navigate('/')}
          className="btn btn-ghost"
          style={{ marginTop: 24 }}
        >
          ← 返回重新提问
        </button>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/RecommendPage.tsx frontend/src/components/SpreadCard.tsx
git commit -m "feat: add spread recommendation page"
```

---

### Task 15: Create DrawPage with Card Animations

**Files:**
- Create: `frontend/src/pages/DrawPage.tsx`
- Create: `frontend/src/components/SpreadLayout.tsx`
- Create: `frontend/src/components/CardDeck.tsx`
- Create: `frontend/src/components/FlipReveal.tsx`

- [ ] **Step 1: Write FlipReveal component**

```typescript
// frontend/src/components/FlipReveal.tsx

import { motion } from 'framer-motion';
import type { TarotCard } from '../types';

interface Props {
  card: TarotCard;
  reversed: boolean;
  label: string;
  isRevealed: boolean;
  onReveal: () => void;
}

export default function FlipReveal({ card, reversed, label, isRevealed, onReveal }: Props) {
  return (
    <div
      onClick={!isRevealed ? onReveal : undefined}
      style={{
        width: 100, height: 146,
        perspective: 800,
        cursor: isRevealed ? 'default' : 'pointer',
      }}
    >
      <motion.div
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%', height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Card Back */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          background: 'linear-gradient(135deg, #2d1f5e, #1a1230)',
          border: '2px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
        }}>
          🌙
        </div>

        {/* Card Front */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: 'var(--color-surface-raised)',
          border: `2px solid ${reversed ? 'var(--color-reverse)' : 'var(--color-accent)'}`,
          borderRadius: 'var(--radius-md)',
          padding: 12,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center',
          overflow: 'hidden',
        }}>
          {reversed && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              background: 'var(--color-reverse)', color: 'white',
              fontSize: 10, padding: '2px 0',
            }}>
              逆位
            </div>
          )}
          <div style={{ fontSize: 24, marginTop: reversed ? 16 : 4 }}>🃏</div>
          <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>{card.name_zh}</div>
          <div style={{ fontSize: 10, color: 'var(--color-text-dim)' }}>{card.name_en}</div>
          <div style={{ fontSize: 10, color: 'var(--color-accent)', marginTop: 'auto', paddingBottom: 4 }}>
            {label}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Write SpreadLayout component**

```typescript
// frontend/src/components/SpreadLayout.tsx

import type { Spread } from '../types';

interface Props {
  spread: Spread;
  children: React.ReactNode[];
}

export default function SpreadLayout({ spread, children }: Props) {
  if (spread.id === 'single-card') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {children[0]}
      </div>
    );
  }

  if (spread.id === 'three-card') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
        {children.map((child, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {child}
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-dim)' }}>
              {spread.positions[i].label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (spread.id === 'relationship') {
    // 7-card relationship layout
    const positions = [
      { col: 1, row: 1 }, { col: 3, row: 1 }, // self, other
      { col: 2, row: 1 },                       // relationship
      { col: 1, row: 2 }, { col: 3, row: 2 }, // feelings
      { col: 2, row: 2 },                       // obstacle
      { col: 2, row: 3 },                       // future
    ];
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 100px)',
        gridTemplateRows: 'repeat(3, auto)',
        gap: 16,
        justifyContent: 'center',
      }}>
        {children.map((child, i) => (
          <div key={i} style={{
            gridColumn: positions[i].col,
            gridRow: positions[i].row,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            {child}
            <span style={{ fontSize: 11, color: 'var(--color-text-dim)', textAlign: 'center' }}>
              {spread.positions[i].label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Celtic Cross: standard layout
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 100px)',
      gridTemplateRows: 'repeat(4, auto)',
      gap: 12,
      justifyContent: 'center',
    }}>
      {children.map((child, i) => (
        <div key={i} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          {child}
          <span style={{ fontSize: 10, color: 'var(--color-text-dim)', textAlign: 'center' }}>
            {spread.positions[i].label}
          </span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Write CardDeck component**

```typescript
// frontend/src/components/CardDeck.tsx

import { motion } from 'framer-motion';

interface Props {
  onShuffle: () => void;
  onDraw: () => void;
  remaining: number;
  isShuffling: boolean;
}

export default function CardDeck({ onShuffle, onDraw, remaining, isShuffling }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Stack of remaining cards */}
      <div style={{ position: 'relative', width: 80, height: 110 }}>
        {Array.from({ length: Math.min(remaining, 5) }).map((_, i) => (
          <motion.div
            key={i}
            animate={isShuffling ? { x: [0, -20, 30, -10, 0], rotate: [-5, 5, -3, 2, 0] } : {}}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            style={{
              position: 'absolute',
              top: i * 2,
              left: i * 2,
              width: 80, height: 110,
              background: 'linear-gradient(135deg, #2d1f5e, #1a1230)',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}
          >
            🌙
          </motion.div>
        ))}
      </div>

      <p style={{ color: 'var(--color-text-dim)', fontSize: 'var(--text-sm)' }}>
        剩余 {remaining} 张牌
      </p>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onShuffle} className="btn btn-ghost" disabled={isShuffling}>
          🔀 洗牌
        </button>
        <button onClick={onDraw} className="btn btn-primary" disabled={remaining === 0 || isShuffling}>
          🃏 抽牌
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write DrawPage**

```typescript
// frontend/src/pages/DrawPage.tsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SpreadLayout from '../components/SpreadLayout';
import CardDeck from '../components/CardDeck';
import FlipReveal from '../components/FlipReveal';
import { useReading } from '../context/ReadingContext';
import { drawCards, interpretReading } from '../api/client';
import type { TarotCard, DrawnCardWithData } from '../types';

export default function DrawPage() {
  const navigate = useNavigate();
  const { session, setDrawnCards, setInterpretation } = useReading();
  const [availableCards, setAvailableCards] = useState<DrawnCardWithData[]>([]);
  const [drawn, setDrawn] = useState<(DrawnCardWithData | null)[]>([]);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [isShuffling, setIsShuffling] = useState(false);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [error, setError] = useState('');

  const spread = session.spread;

  // Load cards on mount
  useEffect(() => {
    if (!spread) {
      navigate('/');
      return;
    }
    drawCards(spread.id, spread.card_count)
      .then(result => {
        setAvailableCards(result.cards);
        setDrawn(new Array(spread.card_count).fill(null));
      })
      .catch(() => setError('加载牌堆失败'));
  }, [spread, navigate]);

  const handleShuffle = useCallback(() => {
    setIsShuffling(true);
    // Reshuffle: fetch new cards
    if (spread) {
      drawCards(spread.id, spread.card_count)
        .then(result => {
          setAvailableCards(result.cards);
          setDrawn(new Array(spread.card_count).fill(null));
          setRevealed(new Set());
          setIsShuffling(false);
        })
        .catch(() => {
          setError('洗牌失败');
          setIsShuffling(false);
        });
    }
  }, [spread]);

  const handleDraw = useCallback(() => {
    if (!spread) return;
    const nextEmpty = drawn.findIndex(d => d === null);
    if (nextEmpty === -1 || availableCards.length === 0) return;

    const newCard = availableCards[availableCards.length - 1];
    setAvailableCards(prev => prev.slice(0, -1));
    setDrawn(prev => {
      const next = [...prev];
      next[nextEmpty] = newCard;
      return next;
    });
  }, [drawn, availableCards, spread]);

  const handleReveal = useCallback((index: number) => {
    setRevealed(prev => new Set([...prev, index]));
  }, []);

  const allDrawn = drawn.every(d => d !== null);
  const allRevealed = spread && revealed.size === spread.card_count;

  const handleInterpret = async () => {
    if (!spread || !session.question) return;
    setIsInterpreting(true);
    setError('');

    const validCards = drawn.filter(Boolean) as DrawnCardWithData[];
    setDrawnCards(validCards);

    try {
      const result = await interpretReading(
        session.question,
        spread.id,
        validCards.map(c => ({
          position_index: c.position_index,
          card_id: c.card.id,
          reversed: c.reversed,
        }))
      );
      setInterpretation(result);
      navigate('/interpret');
    } catch (e) {
      setError('AI 解读请求失败，请确保 ANTHROPIC_API_KEY 已配置且后端已启动');
    } finally {
      setIsInterpreting(false);
    }
  };

  if (!spread) return null;

  return (
    <div className="page">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 4 }}>
            {spread.name_zh}
          </h2>
          <p style={{ color: 'var(--color-text-dim)' }}>
            请抽取 {spread.card_count} 张牌
          </p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {/* Spread layout showing card positions */}
        <SpreadLayout spread={spread}>
          {drawn.map((card, i) => (
            <div key={i} style={{ minHeight: 146 }}>
              {card ? (
                <FlipReveal
                  card={card.card}
                  reversed={card.reversed}
                  label={spread.positions[i].label}
                  isRevealed={revealed.has(i)}
                  onReveal={() => handleReveal(i)}
                />
              ) : (
                <div style={{
                  width: 100, height: 146,
                  border: '2px dashed var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-text-dim)', fontSize: 28,
                }}>
                  ?
                </div>
              )}
            </div>
          ))}
        </SpreadLayout>

        {/* Deck controls */}
        {!allDrawn && (
          <CardDeck
            onShuffle={handleShuffle}
            onDraw={handleDraw}
            remaining={availableCards.length}
            isShuffling={isShuffling}
          />
        )}

        {/* Interpret button */}
        {allRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center' }}
          >
            <button
              onClick={handleInterpret}
              className="btn btn-primary"
              disabled={isInterpreting}
              style={{ fontSize: 'var(--text-lg)', padding: '16px 48px' }}
            >
              {isInterpreting ? (
                <>
                  <span className="spinner" />
                  AI 解读中...
                </>
              ) : (
                '✨ 开始解读'
              )}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/DrawPage.tsx frontend/src/components/
git commit -m "feat: add draw page with card flip and shuffle animations"
```

---

### Task 16: Create InterpretPage

**Files:**
- Create: `frontend/src/pages/InterpretPage.tsx`
- Create: `frontend/src/components/NarrativeBlock.tsx`
- Create: `frontend/src/components/IndividualReading.tsx`
- Create: `frontend/src/components/GuidanceBlock.tsx`
- Create: `frontend/src/components/ActionBar.tsx`

- [ ] **Step 1: Write NarrativeBlock**

```typescript
// frontend/src/components/NarrativeBlock.tsx

import { motion } from 'framer-motion';

interface Props {
  narrative: string;
}

export default function NarrativeBlock({ narrative }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card-surface card-glow"
    >
      <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 12 }}>
        📖 整体叙事
      </h3>
      <p style={{ lineHeight: 2, color: 'var(--color-text)', fontSize: 'var(--text-base)' }}>
        {narrative.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < narrative.split('\n').length - 1 && <br />}
          </span>
        ))}
      </p>
    </motion.div>
  );
}
```

- [ ] **Step 2: Write IndividualReading**

```typescript
// frontend/src/components/IndividualReading.tsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { IndividualReading as ReadingType } from '../types';

interface Props {
  reading: ReadingType;
  index: number;
}

export default function IndividualReading({ reading, index }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.15 }}
    >
      <div
        className="card-surface"
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 28 }}>🃏</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong>
                {reading.card.name_zh}
                {reading.reversed && (
                  <span style={{ color: 'var(--color-reverse)', fontSize: 'var(--text-sm)', marginLeft: 4 }}>
                    逆位
                  </span>
                )}
              </strong>
              <span style={{ color: 'var(--color-text-dim)', fontSize: 'var(--text-sm)' }}>
                — {reading.position}
              </span>
            </div>
            <p style={{ color: 'var(--color-text-dim)', fontSize: 'var(--text-sm)', marginTop: 2 }}>
              {reading.reading.slice(0, 80)}...
            </p>
          </div>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            style={{ color: 'var(--color-text-dim)' }}
          >
            ▼
          </motion.span>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                marginTop: 12, paddingTop: 12,
                borderTop: '1px solid var(--color-border)',
                lineHeight: 1.9, fontSize: 'var(--text-base)',
              }}>
                {reading.reading}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 3: Write GuidanceBlock**

```typescript
// frontend/src/components/GuidanceBlock.tsx

import { motion } from 'framer-motion';
import type { Guidance } from '../types';

interface Props {
  guidance: Guidance;
}

export default function GuidanceBlock({ guidance }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="card-surface"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <h4 style={{ color: 'var(--color-positive)', marginBottom: 8 }}>✨ 关键指引</h4>
          <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
            {guidance.key_points.map((point, i) => (
              <li key={i} style={{ color: 'var(--color-text)' }}>{point}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{ color: 'var(--color-warning)', marginBottom: 8 }}>⚠️ 需要注意</h4>
          <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
            {guidance.cautions.map((caution, i) => (
              <li key={i} style={{ color: 'var(--color-text)' }}>{caution}</li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 4: Write ActionBar**

```typescript
// frontend/src/components/ActionBar.tsx

interface Props {
  onNewReading: () => void;
  onReshuffle: () => void;
}

export default function ActionBar({ onNewReading, onReshuffle }: Props) {
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
      <button onClick={onReshuffle} className="btn btn-primary">
        🔄 重新抽牌
      </button>
      <button onClick={onNewReading} className="btn btn-ghost">
        🏠 新的解读
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Write InterpretPage**

```typescript
// frontend/src/pages/InterpretPage.tsx

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NarrativeBlock from '../components/NarrativeBlock';
import IndividualReading from '../components/IndividualReading';
import GuidanceBlock from '../components/GuidanceBlock';
import ActionBar from '../components/ActionBar';
import { useReading } from '../context/ReadingContext';

export default function InterpretPage() {
  const navigate = useNavigate();
  const { session, resetSession } = useReading();
  const { interpretation, spread, question } = session;

  if (!interpretation || !spread) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-dim)' }}>没有解读结果，请先完成抽牌</p>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: 16 }}>
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', marginBottom: 8 }}
        >
          <h2 style={{ fontSize: 'var(--text-xl)' }}>
            {spread.name_zh} · 解读
          </h2>
          <p style={{ color: 'var(--color-text-dim)', marginTop: 4 }}>
            「{question}」
          </p>
        </motion.div>

        {/* Combined narrative */}
        <NarrativeBlock narrative={interpretation.narrative} />

        {/* Individual card readings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {interpretation.individual.map((reading, i) => (
            <IndividualReading key={i} reading={reading} index={i} />
          ))}
        </div>

        {/* Guidance */}
        <GuidanceBlock guidance={interpretation.guidance} />

        {/* Actions */}
        <div style={{ marginTop: 8 }}>
          <ActionBar
            onReshuffle={() => navigate('/draw')}
            onNewReading={() => {
              resetSession();
              navigate('/');
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/InterpretPage.tsx frontend/src/components/
git commit -m "feat: add interpretation page with narrative, individual readings and guidance"
```

---

## Phase 6: Integration & Final Touches

### Task 17: Verify Full Stack Integration

- [ ] **Step 1: Start backend**

```bash
cd backend && python main.py
```
Expected: Uvicorn running on http://127.0.0.1:8000

- [ ] **Step 2: Start frontend**

```bash
cd frontend && npm run dev
```
Expected: Vite running on http://localhost:5173

- [ ] **Step 3: Test the full flow in browser**

1. Open http://localhost:5173
2. Enter a question like "我的事业未来怎么样"
3. Verify recommendations appear
4. Select a spread
5. Draw cards, flip them
6. Click "开始解读"
7. Verify interpretation displays with narrative, individual readings, guidance

- [ ] **Step 4: Test error states**

1. Stop backend → verify frontend shows error message
2. Enter empty question → verify form validation
3. Start backend without ANTHROPIC_API_KEY → verify interpret returns appropriate error

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: complete tarot reading tool v1"
```

---

### Task 18: Add .gitignore

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Write .gitignore**

```
node_modules/
dist/
.env
__pycache__/
*.pyc
.pytest_cache/
.superpowers/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: add .gitignore"
```
