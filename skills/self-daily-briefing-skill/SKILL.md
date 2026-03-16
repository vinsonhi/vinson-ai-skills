---
name: self-daily-briefing-skill
description: "自用日报 skill。用于生成综合早报、财经早报、科技早报、AI 深度日报，以及美股自选股票早报。用户说“如意如意”、'早报'、'美股股票早报'、'股票日报' 时使用。"
---

# 自用日报 skill

用于生成中文日报。默认先保存到 `reports/YYYY-MM-DD/`，并同时输出 Markdown 与便于阅读的 PDF。

## 严格规则

- 如果用户要的是“合并版日报”或要求把综合/财经/科技/AI 深度/美股放进同一个文件，必须先生成或读取各板块源文件，再做合并。
- 合并时，`general_report.md`、`finance_report.md`、`tech_report.md`、`ai_daily_report.md` 这四个板块把源文件内容视为最终内容，直接拼接，不要二次改写、二次摘要、重写观点。
- 合并展示时，为避免双层标题重复，保留合并稿里的外层章节标题，去掉各源文件自身的首个 `# 标题` 行后再拼接正文。
- 合并稿的章节标题应保留视觉识别，推荐使用带 emoji 的外层标题，例如 `🌅 一、综合早报`、`💰 二、财经早报`。
- 标题层级应保持一致：合并稿主标题用 `#`，五个外层章节用 `##`，章节内部的小分组和“数据缺口”统一用 `###`。
- 合并稿允许新增的内容只有：
  - 顶部总标题、生成时间、数据窗口说明；
  - 板块分隔符；
  - 美股股票早报板块；
  - 明确的数据缺口说明。
- 如果某一板块已有当天源文件，就优先复用该源文件；不要为了“统一文风”重写。
- 如果用户直接给了某个板块的完整版本，按用户版本原文覆盖该板块，不要改写措辞。
- 缺数据就写缺口，不补推断性内容。
- PDF 要尽量保留 Markdown 原始阅读结构，优先走“Markdown -> HTML 阅读页 -> 浏览器导出 PDF”，不要自创杂志式重排。
- HTML 导出 PDF 的正确链路固定为：`Markdown -> 完整 HTML 文件 -> 浏览器直接打开该 HTML 页面 -> 浏览器打印 PDF`。
- 禁止把整篇 HTML 用 `data:` URL 注入浏览器后再打印长文 PDF；这条链路会发生静默截断，导致后半篇缺页。
- 禁止把 `reportlab` 当作 HTML/Markdown 阅读页的默认 PDF 导出器；它只能用于程序化排版文档，不能保证与 HTML 阅读结构一致。
- 如果浏览器直打链路不可用，应明确报错说明卡点；不要静默切换到低保真方案后继续交付。
- PDF 导出完成后，必须核对 HTML 和 PDF 内容是否完整一致，至少完成以下检查：
  - `pdfinfo` 检查页数是否与内容规模相符，不能异常偏少。
  - `pdftotext` 提取 PDF 尾部文本，并与 HTML 尾部文本逐段对比，确保最后一个板块完整出现。
  - `pdftoppm` 渲染最后 1-2 页 PNG，人工确认末页不是空白页、截断页、或停在中间章节。
  - 只看首页或前两页不算验收通过。
- 参考示例：
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
  - X Following AI（登录个人 X 账号后抓取已关注博主热帖）
  - X Recommended AI（登录个人 X 账号后抓取推荐流热帖）
  - ChinAI
  - Ben's Bites
  - One Useful Thing
  - Memia
  - Interconnects

#### AI 深度日报里的 X 板块规则

- X 不是匿名抓公开搜索，而是复用用户登录后的个人时间线。
- 必须同时看两路：
  - `Following`
  - `Recommended / For you`
- 数据窗口默认只看最近 24 小时。
- 热度排序不能只看点赞，要综合 replies / reposts / likes / views / bookmarks。
- 如果推文里带外链，优先打开外链正文再写 `Summary` 和 `Deep Dive`，不要只复述发帖文案。
- 如果没有外链，再基于推文本身做摘要和解读。
- 最终输出仍要遵守日报格式：`Source`、`Time`、`Summary`、`Deep Dive`。
- 缺正文就写缺口，不要把猜测当事实。
- 如果 X 或其他需要登录的来源出现登录过期、登录页、扫码、验证码、或权限校验，不能把它当作普通“数据缺口”直接跳过。
- 这类情况必须明确标记为“登录态失效”，并停在可恢复步骤上，等待用户手动完成登录后再继续。
- 登录失效时，不能私自改用匿名抓取、公开搜索、替代站点、或完全不同的技术路线来冒充同一数据源。

### 5. 美股股票早报
- 适用场景：要看自选股票的最新价格、涨跌、驱动因素和重要新闻
- 默认观察名单：见 `instructions/us_stocks_watchlist_default.txt`；可复用版本允许留空，由使用者自行填写
- 信息源：
  - 最新价格：优先用 `web.finance`
  - 涨跌幅：用最新价和昨收价计算
  - 驱动因素：公司 IR、财报、官方博客、官方新闻稿
  - 重要新闻：优先 Reuters，其次公司官网和权威媒体
- 时间口径规则：
  - 默认使用“生成时最新价快照”，不是自动回退成“上一交易日收盘后版本”。
  - 全部股票必须来自同一轮 `web.finance` 查询，不能混用不同时间点或不同来源的价格。
  - 报告顶部必须写清 `as of` 时间；如果美股正在交易，要明确写“盘中最新价快照”。
  - 只有当用户明确要求“收盘版 / 复盘版 / 对应美东某交易日收盘后版本”时，才允许按收盘口径写，并且标题和注释都要写清对应交易日。
  - 分析和一句话判断必须和同一轮价格口径一致；不能拿前一日收盘分析去解释当前盘中价格。
  - 按北京时间处理周末与周一：
    - 周六运行：默认允许使用刚结束的周五收盘口径，做统一价格对比和驱动分析。
    - 周日运行：默认不做价格对比，只收集信息、催化、官方新闻和下周观察点。
    - 周一运行：默认写最近一个美股交易日的盘后价格波动和信息更新，不能伪装成新的周一盘中价格。
  - 周日和周一如果采用最近一个交易日收盘口径，板块顶部必须明确写清对应的是哪个美东交易日。

## 日报格式示例

说明里要给出最终 Markdown 的样子，不只讲规则。每个日报板块至少放 1-2 个条目示例，最后用 `...省略` 表示完整报告会更长。

### 合并版日报示例约束

```markdown
# Morning Brief | 2026-03-11

- 生成时间：2026-03-11 14:58 CST
- 合并来源：general_report.md / finance_report.md / tech_report.md / ai_daily_report.md + 美股股票早报
- 说明：综合/财经/科技/AI 深度板块以下均直接来自已有日报内容。

---

## 🌅 一、综合早报

### 🌍 全网速览

...这里直接贴 general_report.md 去掉首个 `# 标题` 后的正文...

---

## 📈 五、美股股票早报

...这里放美股正文...
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
  - 如用户要求便于阅读的导出，再额外输出同名 `.pdf`

## 合并版日报工作流

1. 先确认是否已有以下源文件：
   - `reports/YYYY-MM-DD/general_report.md`
   - `reports/YYYY-MM-DD/finance_report.md`
   - `reports/YYYY-MM-DD/tech_report.md`
   - `reports/YYYY-MM-DD/ai_daily_report.md`
2. 如果不存在，就先按对应 profile 生成。
3. 合并时按以下顺序直接拼接：
   - 综合早报
   - 财经早报
   - 科技早报
   - AI 深度日报
   - 美股股票早报
4. 对前四个板块，直接贴源文件原文，不改写。
5. 美股板块单独生成；如果用户提供了更完整的版本，用用户版本覆盖。
6. 最终合并稿默认同时输出两份：
   - `reports/YYYY-MM-DD/merged_daily_report.md`
   - `reports/YYYY-MM-DD/merged_daily_report.pdf`
7. 如果用户指定路径，则在用户路径下保存同名 `.md` 和 `.pdf`。

## 美股股票早报工作流

1. 读取用户给的股票列表；如果没给，就用默认观察名单。
2. 用一次 `web.finance` 调用获取所有股票的最新价格和昨收，锁定为同一轮行情快照。
3. 用搜索获取近 1-7 天的重要新闻：
   - 优先 Reuters
   - 其次公司 IR / 新闻稿
   - 再其次权威媒体
4. 先确定并写明价格时间口径：
   - 默认：`生成时最新价快照`
   - 仅在用户明确要求时：`上一交易日收盘后版本`
   - 北京时间周六：默认允许使用周五收盘口径
   - 北京时间周日：默认改为“信息版”，不做价格对比
   - 北京时间周一：默认改为“最近一个美股交易日盘后波动 + 信息版”
5. 对同一份报告里的所有股票，判断必须围绕同一轮价格口径来写；如果当天缺少个股催化，要明确写“主要受板块 / 市场情绪驱动”。
6. 对每只股票输出：
   - 最新价
   - 较昨收变动（绝对值和百分比）
   - 关键因素
   - 重要新闻链接
   - 一句话判断
7. 保存到 `reports/YYYY-MM-DD/us_stocks_report.md`
8. 如用户要求便于阅读的导出，再额外输出 `reports/YYYY-MM-DD/us_stocks_report.pdf`

### 美股股票早报模板

```markdown
# 美股股票早报 | YYYY-MM-DD

> 注：以下价格为北京时间 YYYY-MM-DD HH:MM 对应的盘中最新价快照；如用户明确要求收盘版，再改写为对应美东交易日收盘后版本。

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
