# 塔罗指引

一个面向桌面端和手机端的 AI 塔罗牌解读网站。用户输入问题后，系统会推荐合适的牌阵，引导抽牌、翻牌，并调用 OpenAI 兼容接口生成完整解读。

## 项目亮点

- 智能牌阵推荐：根据用户问题匹配更合适的塔罗牌阵。
- 完整塔罗牌库：内置 78 张塔罗牌数据，包含正位、逆位关键词和牌义。
- 沉浸式抽牌体验：包含洗牌、抽牌、翻牌和结果展示动画。
- 牌面与文字同步展示：翻开牌后可直接看到牌名、正逆位、关键词和简短牌义。
- AI 深度解读：结合问题、牌阵位置和抽出的牌生成整体叙事、单牌解读与行动建议。
- 手机端可用：页面、按钮、牌阵布局和解读内容都做了响应式适配。
- OpenAI 兼容：默认按 DeepSeek 配置，也可以切换到其他兼容 OpenAI API 的模型服务。

## 使用流程

```text
输入问题 -> 推荐牌阵 -> 抽牌翻牌 -> 查看牌面说明 -> 生成 AI 解读
```

## 技术栈

| 模块 | 技术 |
| --- | --- |
| 前端 | React 19, TypeScript, Vite |
| 动画 | Framer Motion |
| 路由 | React Router |
| 后端 | FastAPI, Pydantic |
| AI 接口 | OpenAI Python SDK，兼容 OpenAI 格式接口 |
| 数据 | JSON 牌库与牌阵配置 |

## 目录结构

```text
.
├── backend/
│   ├── main.py                 # FastAPI 入口
│   ├── data/
│   │   ├── cards.json          # 78 张塔罗牌数据
│   │   └── spreads.json        # 牌阵定义
│   ├── models/
│   │   └── schemas.py          # 请求与响应模型
│   ├── services/
│   │   ├── recommend_engine.py # 牌阵推荐逻辑
│   │   └── interpreter.py      # AI 解读逻辑
│   └── tests/                  # 后端测试
├── frontend/
│   ├── src/
│   │   ├── api/                # 前端 API 客户端
│   │   ├── components/         # 页面组件
│   │   ├── context/            # 占卜状态管理
│   │   ├── pages/              # 首页、推荐、抽牌、解读页
│   │   └── styles/             # 全局样式
│   └── package.json
└── README.md
```

## 环境要求

- Python 3.11 或更高版本
- Node.js 18 或更高版本
- 一个 OpenAI 兼容接口的 API Key

## 本地启动

### 1. 安装后端依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 配置环境变量

复制 `backend/.env.example` 为 `backend/.env`，然后填入自己的 API Key。

```env
DEEPSEEK_API_KEY=sk-your-api-key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 3. 启动后端

```bash
cd backend
python main.py
```

后端默认运行在：

```text
http://127.0.0.1:8000
```

### 4. 安装前端依赖

```bash
cd frontend
npm install
```

### 5. 启动前端

```bash
cd frontend
npm run dev
```

前端默认运行在：

```text
http://127.0.0.1:5173
```

## 后端接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/cards` | 获取全部塔罗牌 |
| GET | `/api/spreads` | 获取全部牌阵 |
| POST | `/api/recommend` | 根据问题推荐牌阵 |
| GET | `/api/draw` | 按牌阵抽牌 |
| POST | `/api/interpret` | 生成 AI 解读 |

## 常用命令

前端：

```bash
cd frontend
npm run dev
npm run build
npm run lint
```

后端：

```bash
cd backend
python main.py
pytest
```

## 牌阵

| 牌阵 | 张数 | 适用场景 |
| --- | --- | --- |
| 单张牌 | 1 | 每日指引、快速提问 |
| 三张牌 | 3 | 过去、现在、未来 |
| 关系牌阵 | 7 | 感情关系、人际互动 |
| 凯尔特十字 | 10 | 重大决策、深度探索 |

## 注意事项

- `.env` 文件包含密钥，不要提交到 GitHub。
- 如果前端请求失败，先确认后端是否运行在 `127.0.0.1:8000`。
- 如果 AI 解读失败，检查 `DEEPSEEK_API_KEY`、`DEEPSEEK_BASE_URL` 和 `DEEPSEEK_MODEL` 是否正确。

## License

MIT
