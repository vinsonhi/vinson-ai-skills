# Morning Brief 合并说明

## 目标

把综合早报、财经早报、科技早报、AI 深度日报、美股股票早报合并成一个 Markdown 文件，并同时导出一份便于阅读的 PDF。

## 严格规则

1. 先生成或读取各板块源文件。
2. `general_report.md`、`finance_report.md`、`tech_report.md`、`ai_daily_report.md` 是合并稿的事实来源，必须原文贴入。
3. 不要对前四个板块做二次摘要、改写或统一文风。
4. 如果用户给了某个板块的完整内容，按用户版本原文覆盖。
5. 如果缺少某个源文件或当天数据不足，明确写“数据缺口”，不要编造。
6. 最终默认交付 `.md` 和 `.pdf` 两份。
7. PDF 要保留 Markdown 的原始阅读结构和链接，优先用 HTML 阅读页导出，不要重新设计版式。
8. HTML 导出 PDF 时，浏览器必须直接打开完整 HTML 页面，例如本地 HTTP 地址或可直接访问的 HTML 文件页面；不要把完整 HTML 通过 `data:` URL 塞给浏览器。
9. 不允许把 `reportlab` 作为“HTML 保真导出”的 fallback。它只能用于明确接受重排的程序化 PDF，不适用于 Morning Brief 这类阅读页保真输出。
10. 如果浏览器打印链路失败，必须明确报“PDF 被阻塞 / 未完成”，而不是交付一个样式失真的 fallback PDF 冒充完成品。
11. 合并稿主标题默认使用 `Morning Brief | YYYY-MM-DD`。
12. 合并稿保留外层章节标题，并去掉各源文件自身的首个 `# 标题` 行，避免重复大标题。
13. 外层章节标题保留 emoji，例如 `🌅 一、综合早报`、`💰 二、财经早报`。

## PDF 导出与核对

Morning Brief 的 PDF 交付前，必须完成下面的固定流程：

1. 先生成完整 Markdown。
2. 再渲染成完整 HTML 阅读页，并把 HTML 单独落盘。
3. 让浏览器直接打开该 HTML 页面后打印 PDF。
4. 导出后执行 `pdfinfo`，确认页数没有异常偏少。
5. 导出后执行 `pdftotext`，对比 PDF 尾部文本与 HTML 尾部文本，确保最后一个板块和最后几段内容一致落盘。
6. 用 `pdftoppm -png` 渲染最后 1-2 页，人工确认没有空白、截断、缺页或停在中间章节。

只要 HTML 和 PDF 尾部不一致，就必须视为导出失败，重导，不得交付。
如果浏览器打印根本跑不通，就交付 Markdown/HTML 并明确说明 PDF 阻塞原因；不得把 `reportlab` 或其他重排版导出物当作“已完成 PDF”。

## 推荐顺序

1. 综合早报
2. 财经早报
3. 科技早报
4. AI 深度日报
5. 美股股票早报

## 允许新增的内容

- 合并稿标题
- 生成时间
- 数据窗口说明
- 板块标题和分隔线
- 缺口说明

## 保存路径

- 如果用户指定路径，保存到用户路径。
- 如果用户未指定，保存到：
  - `reports/YYYY-MM-DD/merged_daily_report.md`
  - `reports/YYYY-MM-DD/merged_daily_report.pdf`
