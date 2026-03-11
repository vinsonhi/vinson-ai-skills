---
name: self-daily-briefing-skill
description: "自用日报 skill。用于生成综合早报、财经早报、科技早报、AI 深度日报，以及美股自选股票早报。用户说“如意如意”、'早报'、'美股股票早报'、'股票日报' 时使用。"
---

# 自用日报 skill

用于生成中文日报。默认先保存到 `reports/YYYY-MM-DD/`，再把完整 Markdown 展示给用户。

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

## 可用日报

### 1. 综合早报
- 适用场景：要看今天科技、创投、社交和金融的大盘动态
- 信息源：
  - Hacker News
  - GitHub Trending
  - 36Kr
  - Product Hunt
  - Weibo
  - WallStreetCN
  - Tencent News

### 2. 财经早报
- 适用场景：要看宏观、市场、板块和加密
- 信息源：
  - WallStreetCN
  - 36Kr 财经
  - Tencent 财经
  - Hacker News 金融/加密关键词

### 3. 科技早报
- 适用场景：要看 AI、开发工具、创业产品
- 信息源：
  - GitHub Trending
  - Hacker News
  - Product Hunt
  - 36Kr

### 4. AI 深度日报
- 适用场景：要看前沿论文和 AI 行业观点
- 信息源：
  - Hugging Face Papers
  - ChinAI
  - Ben's Bites
  - One Useful Thing
  - Memia
  - Interconnects

### 5. 美股股票早报
- 适用场景：要看自选股票的最新价格、涨跌、驱动因素和重要新闻
- 默认观察名单：见 `instructions/us_stocks_watchlist_default.txt`
- 信息源：
  - 最新价格：优先用 `web.finance`
  - 涨跌幅：用最新价和昨收价计算
  - 驱动因素：公司 IR、财报、官方博客、官方新闻稿
  - 重要新闻：优先 Reuters，其次公司官网和权威媒体

## 日报格式示例

说明里要给出最终 Markdown 的样子，不只讲规则。每个日报板块至少放 1-2 个条目示例，最后用 `...省略` 表示完整报告会更长。

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

> 注：对应美东 2026-03-10 交易日收盘后版本。

| Ticker | 最新价 | 较昨收变动 | 一句话判断 |
|---|---:|---:|---|
| NVDA | $184.77 | +2.13 / +1.16% | GTC 预期继续支撑 |
| AMD | $203.23 | +0.56 / +0.28% | Meta 大单逻辑还在，日内偏稳 |

## NVDA
- **最新股价**：$184.77
- **较昨天**：+1.16%
- **关键因素**：GTC 预期、产品发布、生态合作。
- **重要新闻**：
  - [NVIDIA GTC 2026 官方预告](https://example.com)
- **我的判断**：会前预热行情仍在。

## AMD
- **最新股价**：$203.23
- **较昨天**：+0.28%
- **关键因素**：Meta 大规模 GPU 部署合作仍在支撑逻辑。
- **重要新闻**：
  - [AMD 与 Meta 扩大战略合作](https://example.com)
- **我的判断**：大涨后进入消化阶段。

...省略
```

## 新闻日报工作流

### 数据抓取

```bash
python3 scripts/daily_briefing.py --profile general
python3 scripts/daily_briefing.py --profile finance
python3 scripts/daily_briefing.py --profile tech
python3 scripts/daily_briefing.py --profile ai_daily
```

### 输出要求
- 语言：简体中文
- 必带字段：标题、时间、摘要、Deep Dive
- 不编造新闻，不补不存在的数据
- 保存路径：
  - `reports/YYYY-MM-DD/general_report.md`
  - `reports/YYYY-MM-DD/finance_report.md`
  - `reports/YYYY-MM-DD/tech_report.md`
  - `reports/YYYY-MM-DD/ai_daily_report.md`

## 美股股票早报工作流

1. 读取用户给的股票列表；如果没给，就用默认观察名单。
2. 用 `web.finance` 获取每只股票的最新价格和昨收。
3. 用搜索获取近 1-7 天的重要新闻：
   - 优先 Reuters
   - 其次公司 IR / 新闻稿
   - 再其次权威媒体
4. 对每只股票输出：
   - 最新价
   - 较昨收变动（绝对值和百分比）
   - 关键因素
   - 重要新闻链接
   - 一句话判断
5. 保存到 `reports/YYYY-MM-DD/us_stocks_report.md`

### 美股股票早报模板

```markdown
# 美股股票早报 | YYYY-MM-DD

> 注：如用户处于亚洲时区，要明确这是对应“美东 YYYY-MM-DD 交易日”的收盘后版本。

| Ticker | 最新价 | 较昨收变动 | 一句话判断 |
|---|---:|---:|---|
| NVDA | $184.77 | +2.13 / +1.16% | GTC 预期继续支撑 |

## NVDA
- **最新股价**：$184.77
- **较昨天**：+1.16%
- **关键因素**：GTC 预期、产品发布、订单、CapEx、生态合作。
- **重要新闻**：
  - [新闻标题](https://example.com)
- **我的判断**：一句话说明今天为何涨跌。
```

## 交互菜单

用户说“如意如意”时，读取 `templates.md` 并展示菜单。

