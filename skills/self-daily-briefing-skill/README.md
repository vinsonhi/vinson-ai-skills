# 自用日报 skill

一个给 Codex 用的自用日报 skill，包含两类能力：

- 新闻日报：综合、财经、科技、AI 深度
- 美股股票早报：自选股票价格、涨跌、关键驱动、重要新闻

## 严格规则

- 合并版日报必须先生成或读取各板块源文件，再合并。
- `general_report.md`、`finance_report.md`、`tech_report.md`、`ai_daily_report.md` 在合并稿里必须原文复用，不能为了统一口吻重写。
- 允许新增的只有顶层标题、板块分隔、美股板块和缺口说明。
- 如果用户直接给了某个板块的完整版本，按用户版本原文覆盖。
- 缺数据直接标注，不补推断。
- 默认同时输出 `.md` 和 `.pdf` 两份。
- PDF 优先保留 Markdown 原始阅读感和链接，不做自创重排。
- 参考示例见：
  - `examples/merged_daily_report_2026-03-11.md`
  - `examples/merged_daily_report_2026-03-11.pdf`

## 安装

最简单的说法：

```text
帮我安装这个 skill：https://github.com/vinsonhi/AI-Skills/tree/main/skills/self-daily-briefing-skill
```

如果对方支持 GitHub 仓库路径安装，通常这句话就够了。

```bash
python3 /Users/bytedance/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py --repo vinsonhi/AI-Skills --path skills/self-daily-briefing-skill
```

安装后重启 Codex。

## 日报板块

### 综合早报
- 信息源：Hacker News、GitHub Trending、36Kr、Product Hunt、Weibo、WallStreetCN、Tencent News
- 输出内容：热点标题、时间、摘要、深度解读

### 财经早报
- 信息源：WallStreetCN、36Kr 财经、Tencent 财经、Hacker News 金融/加密关键词
- 输出内容：宏观市场、板块变化、加密、关键驱动

### 科技早报
- 信息源：GitHub Trending、Hacker News、Product Hunt、36Kr
- 输出内容：AI 前沿、开发者工具、创业产品

### AI 深度日报
- 信息源：Hugging Face Papers、X Following AI、X Recommended AI、ChinAI、Ben's Bites、One Useful Thing、Memia、Interconnects
- 输出内容：论文摘要、创新点、影响、行业观点

### AI 深度日报中的 X / 推特板块

AI 深度日报新增了一个“X 热帖跟踪”来源，分成两路：

- `X Following AI`：抓你已经关注的账号时间线
- `X Recommended AI`：抓 X 首页推荐流

规则：

- 依赖你自己的登录态，不是匿名抓公开搜索页。
- 抓取时必须同时看 `Following` 和 `For you / 推荐` 两个时间线。
- 只保留最近 24 小时内、且命中 AI 关键词的帖子。
- 热度判断要综合 replies / reposts / likes / views / bookmarks。
- 如果帖子带外链，优先阅读外链正文再写摘要；没有外链再基于帖子本身写。
- 输出格式仍然使用 `Source`、`Time`、`Summary`、`Deep Dive`。

### 美股股票早报
- 信息源：
  - 行情：`web.finance`
  - 驱动：公司 IR、财报、官方博客、官方新闻稿
  - 新闻：优先 Reuters，其次公司官网和权威媒体
- 时间口径：
  - 默认是“生成时最新价快照”
  - 只有用户明确要求时才写“上一交易日收盘后版本”
  - 同一份报告里的所有股票必须来自同一轮行情快照
- 输出内容：
  - 股票代码
  - 最新价
  - 相比昨天变动
  - 影响变动的关键因素
  - 重要新闻
  - 一句话判断

## 日报格式示例

下面不是完整报告，只是最终呈现形式的示意。真实输出会更长，结尾按 `...省略` 收束。

### 合并版示意

```markdown
# Morning Brief | 2026-03-11

- 合并来源：general_report.md / finance_report.md / tech_report.md / ai_daily_report.md + 美股股票早报
- 说明：前四个板块直接复用源日报原文。
- 输出文件：`merged_daily_report.md` + `merged_daily_report.pdf`
- 排版规则：合并稿保留外层章节标题，去掉各源文件自身的首个 `# 标题`，避免重复大标题。
- 标题风格：合并稿主标题使用 `Morning Brief`；外层章节标题保留 emoji，例如 `🌅 一、综合早报`。
- 标题层级：主标题 `#`，外层章节 `##`，章节内部的小分组与“数据缺口”统一用 `###`。

## 🌅 一、综合早报

...general_report.md 原文...

## 💰 二、财经早报

...finance_report.md 原文...
```

### 综合早报示例

```markdown
# 🌅 综合早报 | 2026-03-11

## 🌍 全网速览

#### 1. [百度智能云发布 DuClaw](https://example.com)
- **Source**: 36Kr | **Time**: 5秒前 | **Heat**: Unknown Heat
- **Summary**: 百度智能云发布零部署 OpenClaw 服务 DuClaw。
- **Deep Dive**: 💡 **Insight**: 云厂商开始把 Agent 竞争点从模型调用转向工作流和企业可用性。

#### 2. [Tony Hoare 去世](https://example.com)
- **Source**: Hacker News | **Time**: 13 hours ago | **Heat**: 🔥 1601 points
- **Hacker News**: [Discussion](https://news.ycombinator.com/)
- **Summary**: 社区回顾其在 quicksort、ALGOL 和 Hoare logic 上的长期贡献。
- **Deep Dive**: 💡 **Insight**: 形式化方法与程序正确性重新被工程圈重视。

...省略
```

### 财经早报示例

```markdown
# 💰 财经早报 | 2026-03-11

## 🌏 宏观与大盘

#### 1. [创业板涨 1%，光伏产业链爆发](https://example.com)
> **Time**: 2026-03-11 12:08 | **Impact**: 🟢 Bullish | **Heat**: Unknown
> **Summary**: A 股与港股科技成长板块走强，新能源链条领涨。
> **Deep Dive**: 💡 **Insight**: 资金回流成长板块，说明市场风险偏好正在修复。

#### 2. [设定美国财政部账户上限？](https://example.com)
> **Time**: 2026-03-11 11:29 | **Impact**: ⚪ Neutral | **Heat**: Unknown
> **Summary**: 报道讨论通过 TGA 工具影响流动性的可能性。
> **Deep Dive**: 💡 **Insight**: 这类政策工具会直接传导到美债、成长股和全球风险资产定价。

...省略
```

### 科技早报示例

```markdown
# 🤖 科技早报 | 2026-03-11

## 🚨 AI 前沿

#### 1. [Show HN: ClawSoc – Observe Your AI Agent in an AI Society](https://example.com)
- **Source**: Hacker News | **Time**: Today
- **Summary**: 开发者在“多 agent 社会”里观察 agent 行为。
- **Deep Dive**: 💡 **Insight**: 单 agent 评测正在失效，多体系统会成为下一代 agent 产品的关键壁垒。

## 🛠️ 开发者工具

#### 2. [promptfoo](https://github.com/promptfoo/promptfoo)
- **Source**: GitHub Trending | **Time**: Today
- **Summary**: 面向 prompts、agents 和 RAG 的测试与红队工具。
- **Deep Dive**: 💡 **Insight**: AI 工具链正在补齐 QA 和安全评测环节。

...省略
```

### AI 深度日报示例

```markdown
# 🧠 AI 深度日报 | 2026-03-11

## 🔬 SOTA Research

#### 1. [Omni-Diffusion：统一多模态理解与生成](https://example.com)
- **Source**: Hugging Face Papers | **Time**: 2026-03-11
- **Summary**: 用 masked discrete diffusion 统一多模态理解与生成任务。
- **Deep Dive**: Innovation：减少多模态系统“模型分裂”问题。
- **Deep Dive**: Impact：有机会降低多模态训练和部署的切换成本。

#### 2. [A Guide to Which AI to Use in the Agentic Era](https://example.com)
- **Source**: One Useful Thing | **Time**: Wed, 18 Feb 2026 01:45:41 GMT
- **Summary**: 讨论在 agentic 时代该如何选择不同 AI 工具。
- **Insight**: 💡 真正稀缺的是决策框架，而不是单个模型。

...省略
```

### 美股股票早报示例

```markdown
# 美股股票早报 | 2026-03-11

> 注：以下价格为北京时间 2026-03-11 14:58 对应的盘中最新价快照；如果要收盘版，需要明确写成对应美东 2026-03-10 交易日收盘后版本。

| Ticker | 最新价 | 较昨收变动 | 一句话判断 |
|---|---:|---:|---|
| TICKER_A | $100.00 | +1.25 / +1.27% | 核心催化延续，短线偏强 |
| TICKER_B | $55.20 | -0.40 / -0.72% | 缺少新增催化，走势偏震荡 |

## TICKER_A
- **最新股价**：$100.00
- **较昨天**：+1.27%
- **关键因素**：新品预期、客户采用、生态合作。
- **重要新闻**：
  - [公司官方新闻](https://example.com/)
- **我的判断**：主线逻辑未破坏，资金仍在交易核心叙事。

## TICKER_B
- **最新股价**：$55.20
- **较昨天**：-0.72%
- **关键因素**：缺少新增催化，更多受板块情绪影响。
- **重要新闻**：
  - [公司投资者关系页面](https://example.com/)
- **我的判断**：短线偏弱，但还需要结合后续基本面验证。

...省略
```

## 默认观察名单

可复用版本默认留空；如果没有默认名单，必须先向用户要股票列表，不能自行猜测。
