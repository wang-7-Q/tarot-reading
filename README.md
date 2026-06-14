# 🃏 塔罗指引

> 基于 AI 的塔罗牌占卜工具。输入你的问题，自动推荐最适合的牌阵，通过优雅的翻牌动画抽取塔罗牌，由大模型生成专业、温暖、有洞察力的解读。

## ✨ 特点

- 🔮 **智能牌阵推荐** — 根据问题关键词自动匹配最合适的牌阵
- 🎴 **78 张完整塔罗牌** — 22 张大阿尔卡纳 + 56 张小阿尔卡纳，全部含正逆位释义
- 📊 **4 种经典牌阵** — 单张牌、三张牌、关系牌阵、凯尔特十字
- 🤖 **AI 深度解读** — 不仅解读单张牌，更串联牌与牌之间的因果与能量流动
- 🎬 **流畅动画** — 洗牌、抽牌、3D 翻牌动画，沉浸式体验
- 🔌 **多 API 兼容** — 支持所有 OpenAI 兼容接口（DeepSeek、Agnes、OpenAI 等），改一行配置即可切换

## 🎯 预览

```
首页输入问题 → AI 推荐牌阵 → 抽牌翻牌 → 获取深度解读
     🃏              ✨              🌙              📖
```

## 🚀 快速开始

### 环境要求

- Python ≥ 3.11
- Node.js ≥ 18
- 一个 OpenAI 兼容的 API Key（推荐 [DeepSeek](https://platform.deepseek.com)，国内可直接访问）

### 1. 安装

```bash
# 后端
cd backend
pip install -r requirements.txt

# 前端
cd frontend
npm install
```

### 2. 配置

将 `backend/.env.example` 复制为 `backend/.env`，填入你的 API Key：

```env
DEEPSEEK_API_KEY=sk-你的key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

### 3. 启动

```bash
# 终端 1 — 后端（http://127.0.0.1:8000）
cd backend
python main.py

# 终端 2 — 前端（http://localhost:5173）
cd frontend
npm run dev
```

浏览器打开 http://localhost:5173 即可使用。

## 🔄 切换 API

修改 `backend/.env` 中的三行变量，重启后端即可。支持所有 OpenAI 兼容接口：

```env
# DeepSeek（默认）
DEEPSEEK_API_KEY=sk-你的key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# 其他兼容 API，例如：
# DEEPSEEK_BASE_URL=https://api.openai.com
# DEEPSEEK_MODEL=gpt-4o
```

## 📊 牌阵

| 牌阵 | 张数 | 适用场景 |
|------|------|----------|
| 🔮 单张牌 | 1 | 每日指引、简单提问 |
| ✨ 三张牌 | 3 | 过去·现在·未来，日常困惑 |
| 💞 关系牌阵 | 7 | 感情走向、人际分析 |
| 🌟 凯尔特十字 | 10 | 重大决策、深度探索 |

## 🏗️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + TypeScript + Vite |
| 动画 | Framer Motion |
| 后端 | Python FastAPI |
| AI | OpenAI 兼容 SDK |
| 数据 | 78 张牌 + 4 牌阵 JSON |

## 📁 项目结构

```
├── backend/
│   ├── main.py                 # FastAPI 入口，5 个端点
│   ├── models/schemas.py       # Pydantic 数据模型
│   ├── services/
│   │   ├── recommend_engine.py # 关键词牌阵推荐
│   │   └── interpreter.py      # AI 解读服务
│   ├── data/
│   │   ├── cards.json          # 78 张完整塔罗牌数据
│   │   └── spreads.json        # 4 种牌阵定义
│   └── tests/                  # 10 个测试
├── frontend/src/
│   ├── pages/                  # 4 个页面（首页/推荐/抽牌/解读）
│   ├── components/             # 9 个组件（翻牌/牌阵/洗牌等）
│   ├── context/                # React Context 状态管理
│   ├── api/client.ts           # API 客户端
│   └── styles/global.css       # 暗紫色主题
└── docs/superpowers/           # 设计文档与实现计划
```

## 📄 License

MIT
