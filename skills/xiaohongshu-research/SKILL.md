---
name: xiaohongshu-research
description: Research Xiaohongshu through logged-in browser automation with mobile web detail pages, using a persistent Chrome or Chromium profile to search, open notes, inspect comments, capture screenshots, and extract evidence from images and videos while filtering likely advertiser or merchant content. Use when Codex needs logged-in Xiaohongshu research with stable access to notes, comments, images, and videos without relying on the restricted desktop detail pages.
---

# Xiaohongshu Research

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
