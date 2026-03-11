---
name: self-daily-briefing-skill
description: "自用日报 skill。用于生成综合早报、财经早报、科技早报、AI 深度日报，以及美股自选股票早报。用户说“如意如意”、'早报'、'美股股票早报'、'股票日报' 时使用。"
---

# 自用日报 skill

用于生成中文日报。默认先保存到 `reports/YYYY-MM-DD/`，再把完整 Markdown 展示给用户。

## 安装

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


