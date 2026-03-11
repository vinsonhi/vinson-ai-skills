---
name: xiaohongshu-research
description: Research Xiaohongshu through logged-in browser automation with mobile web detail pages, using a persistent Chrome or Chromium profile to search, open notes, inspect comments, capture screenshots, and extract evidence from images and videos while filtering likely advertiser or merchant content. Use when Codex needs logged-in Xiaohongshu research with stable access to notes, comments, images, and videos without relying on the restricted desktop detail pages.
---

# Xiaohongshu Research

## Install

Simplest instruction for another AI tool:

```text
帮我安装这个 skill：https://github.com/vinsonhi/AI-Skills/tree/main/skills/xiaohongshu-research
```

If the tool supports GitHub path based skill installation, this is usually enough.

Use browser automation by default:

- desktop web for search-result discovery
- mobile web for note detail pages
- persistent login state so the user does not need to re-scan every run

Do not rely on the desktop detail page alone. When desktop detail pages show `当前笔记暂时无法浏览` or app-only restrictions, reopen the same note in a mobile browser context with an authenticated session.

## Runtime Choice

Prefer this order:

1. persistent Chrome or Chromium profile plus mobile web detail pages
2. a dedicated automation profile that logs in once and reuses saved cookies/storage state
3. Android phone automation only if browser detail pages are blocked even in mobile mode

## Setup

Prepare the local machine:

```bash
brew install --cask google-chrome
brew install ffmpeg
```

Optional environment variables:

```bash
export XHS_CHROME_USER_DATA_DIR="$HOME/Library/Application Support/Google/Chrome"
export XHS_CHROME_PROFILE_DIRECTORY="Default"
```

If you point at the user's real Chrome profile, Chrome should be fully closed first so the profile lock does not block automation.

If you do not set those variables, the script uses its own persistent profile under `.runtime/chromium-profile`, which also avoids repeated QR login after the first successful login.

## Browser Strategy

Use:

- one persistent browser context for login and search pages
- one mobile browser context with iPhone-style viewport and user agent for note details
- shared storage state between them

## Workflow

1. Ensure the browser context is authenticated.
2. Search the keyword on Xiaohongshu web search pages.
3. Browse the search-result page like a human first instead of opening notes strictly by rank order.
4. Build a candidate pool from the search page before opening details:
   - include different post types such as help-seeking posts, experience posts,攻略帖,图文帖,视频帖
   - include different account types, but do not let obvious sellers dominate the sample
   - avoid sequential sampling bias from simply opening result 1 to result N
5. Open only the selected candidate notes in a mobile browser context that reuses the same login state.
6. Use browser automation to:
   - search the keyword
   - open candidate notes
   - capture screenshots for cover,正文,评论区,图片,视频帧
   - extract visible正文 and评论
   - inspect the author profile when authenticity is relevant
   - record whether evidence came from title,正文,图片,视频,一级评论, or回复
7. Store each note under an artifact directory with:
   - raw screenshots
   - parsed text and comments
   - extracted observations
   - marketing-risk score and reasons
8. Build the final summary only from browser-derived evidence that was collected from the mobile detail page, not the blocked desktop placeholder.

## Output Rules

Always separate:

- `可信结论`
- `争议点`
- `营销风险`
- `证据样本`

When the content is image-heavy or video-heavy, summarize what is actually shown, not what the title claims.

When the user asks for a real research summary, do not stop at a shallow narrative. Report:

- how many posts were searched, how many were selected for analysis, and why
- how many comments were actually loaded
- which points came from original posts versus comments
- how many independent mentions each key point received
- named examples for each point, including who said it and whether it was in the post body or comment thread

If the sample is too small to support that structure, keep collecting before summarizing. As a default target, aim for at least 30 analyzed notes for broad travel or product topics unless the search space itself is small.

Treat media review as a separate evidence stream:

- `正文已读`
- `图片已看`
- `视频已看`
- `评论已读`

Do not claim media was reviewed unless it was actually opened or sampled.

## Marketing Filter

Apply [references/marketing-filter.md](references/marketing-filter.md).

Favor notes and comments with:

- specific prices, dates, route details, constraints, or negative details
- visible wear, crowding, weather, transfer conditions, or room issues in screenshots
- non-promotional wording and mixed sentiment

Down-rank notes with:

- seller-style account names
- nicknames or profile bios that are tightly coupled to the current search topic
- profile histories that repeatedly post about the same destination, product line, brand, or booking angle
- booking CTA language
- repetitive praise with no operational detail
- comments that redirect to private contact

Treat "author profile mostly daily life or unrelated topics" as a positive authenticity signal rather than neutral background noise.

## Files To Read Only When Needed

- [references/marketing-filter.md](references/marketing-filter.md): scoring heuristics
- [scripts/xhs-research.mjs](scripts/xhs-research.mjs): primary browser automation entrypoint
- [scripts/xhs-android-adb.py](scripts/xhs-android-adb.py): fallback only when browser detail pages are unusable

## Output Example

The final answer should read like a compact research note with explicit evidence separation. For example:

```markdown
这轮小红书我主要看的是“海鲜市场怎么买不踩坑”，重点看了正文、评论、图片和作者主页，结论先给你：

## 可信结论

- 最稳定的建议不是“去哪家最便宜”，而是 先问清计价方式、加工费、是否足斤足两。很多避坑经验都集中在这里。
- 真正有参考价值的帖子，通常会给出 价格、品类、人数、加工方式、最终总价 这些硬信息，而不是只说“好吃”“推荐”。
- 评论区里反复出现的风险点是：低价揽客后临时换高价品、称重不透明、加工费单独加得很高。

## 争议点

- 有些帖子说“凌晨去最新鲜”，也有不少评论认为普通游客没必要为了那一点点差异专门早起，关键还是看商户透明度。
- “网红店”评价分化明显。正文常常偏正面，但评论区更容易出现排队久、价格高、服务一般的反馈。

## 营销风险

- 一部分账号主页长期只发某个海鲜市场、某类餐馆、固定商户，营销嫌疑偏高。
- 真普通用户的帖子，更常见的是混合表达：会夸新鲜，也会吐槽贵、排队、加工一般。

## 证据样本

- 样本 A：正文给出 4 人用餐，总价 680，明确写了皮皮虾、花蟹、扇贝和加工费，评论区 7 条在讨论“加工费偏高”。
- 样本 B：图片里直接拍了摊位价签和称重过程，评论区有人补充“这家会先确认做法再下锅”，可信度较高。

一句话结论：

在小红书上看海鲜攻略，最有用的不是找“最好吃”，而是找 愿意把价格、称重、加工费和踩坑细节写明白 的真实用户帖子。

...省略
```
