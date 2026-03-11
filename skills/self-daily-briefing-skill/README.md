# 自用日报 skill

一个给 Codex 用的自用日报 skill，包含两类能力：

- 新闻日报：综合、财经、科技、AI 深度
- 美股股票早报：自选股票价格、涨跌、关键驱动、重要新闻

## 安装

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
- 信息源：Hugging Face Papers、ChinAI、Ben's Bites、One Useful Thing、Memia、Interconnects
- 输出内容：论文摘要、创新点、影响、行业观点

### 美股股票早报
- 信息源：
  - 行情：`web.finance`
  - 驱动：公司 IR、财报、官方博客、官方新闻稿
  - 新闻：优先 Reuters，其次公司官网和权威媒体
- 输出内容：
  - 股票代码
  - 最新价
  - 相比昨天变动
  - 影响变动的关键因素
  - 重要新闻
  - 一句话判断

## 输出示例

```markdown
# 美股股票早报 | 2026-03-11

| Ticker | 最新价 | 较昨收变动 | 一句话判断 |
|---|---:|---:|---|
| NVDA | $184.77 | +2.13 / +1.16% | GTC 预期继续支撑 |

## NVDA
- **最新股价**：$184.77
- **较昨天**：+1.16%
- **关键因素**：GTC 预期、产品发布、生态合作。
- **重要新闻**：
  - [NVIDIA GTC 2026 官方预告](https://nvidianews.nvidia.com/)
- **我的判断**：会前预热行情仍在。
```

## 默认观察名单

见 `instructions/us_stocks_watchlist_default.txt`
