# 🌄 Daily Morning Briefing Instructions

This file defines how the **AI Agent** should construct the Daily Morning Briefing report. 

> **INPUT**: A large JSON object containing `global_scan`, `hn_ai`, and `github_trending` lists.
> **OUTPUT**: A single, comprehensive Markdown report.

---

## ⚠️ Anti-Laziness Protocol (STRICT)

1.  **Volume Target (REAL ITEMS ONLY)**: The input JSON usually contains ~60+ items.
    *   **Target**: Aim for **20-25 distinct items**, but **NEVER invent items to meet this number**.
    *   **Global Scan**: Pick top 10-15 real items.
    *   **HN AI**: Pick top 5-8 real items.
    *   **GitHub**: Pick top 8-10 real items.
2.  **No Aggregation**: Do NOT summarize multiple distinct news items into one bullet point. One Item = One Section.
3.  **Deep Dive & Linking**:
    *   **Hacker News**: You **MUST** include `[Discussion](hn_url)` next to the Source.
    *   **Context**: Use the `content` field for deep analysis.
4.  **Freshness Is Mandatory**:
    *   `Global Scan` is for today's news, not "recent enough" background.
    *   Before finalizing top items, compare candidate titles/themes against the last 3 delivered daily briefs if available.
    *   If an item already appeared recently and today's dataset does not contain a clear new development, do **NOT** reuse it as a lead item.
    *   If a repeated topic truly has a meaningful update, label it explicitly as follow-up / continued development instead of presenting it as a brand-new headline.
5.  **Data Gaps Over Stale Fillers**:
    *   If today's public sources are thin, write a `数据缺口` note.
    *   Do **NOT** fill the section with an older official post just because it is reliable and easy to cite.

---

## 📝 Report Structure

### Part 1: 🌍 Global Scan (全网速览)
*   **Goal**: Broad coverage of the most important news across all sources.
*   **Selection Logic**:
    *   Prioritize "Breaking News" and "High Heat" items.
    *   Ensure diversity: Include at least 1 item from Finance, 1 from China Tech, 1 from Silicon Valley.
    *   Reject stale repeats: an item that already led a recent brief without a same-day update cannot stay in the top slots.
*   **Format**:
    *   **Format (Strict 4-Line List)**:
    ```markdown
    #### 1. [Title (Translated)](original_url)
    - **Source**: XYZ | **Time**: 2h ago | **Heat**: 🔥 High
    - **Hacker News**: [Discussion](hn_url) (REQUIRED if Source is HN)
    - **Summary**: Concise summary in Chinese.
    - **Deep Dive**: 💡 **Insight**: Context, impact, or why this matters.
    ```

### Part 2: 🦄 Hacker News AI Deep Dive (AI 深度读)
*   **Goal**: Specific focus on AI/LLM technical discussions.
*   **Selection Logic**:
    *   Focus on heavy technical discussions (HN comments link is mandatory).
    *   Look for "Show HN", "Launch", or controversial AI policy/ethics discussions.
*   **Format**:
    *   **Format (Strict 4-Line List)**:
    ```markdown
    #### 1. [Title](url)
    - **Hacker News**: [Discussion](hn_url) | **Time**: 4h ago
    - **Summary**: One sentence technical summary.
    - **Deep Dive**: 💡 **Insight**: Technical breakdown or impact analysis.
    ```

### Part 3: 🐙 GitHub Trending (开源精选)
*   **Goal**: Discovery of new, high-quality open source tools.
*   **Selection Logic**:
    *   Prioritize new tools over established ones (e.g. `FlashMLA` > `React`).
*   **Format**:
    *   **Format (Strict 4-Line List)**:
    ```markdown
    #### 1. [Repo/Name](url)
    - **Stats**: 🌟 Stars | **Lang**: Python | **Time**: Today
    - **Summary**: What problem does it solve?
    - **Deep Dive**: 💡 **Insight**: Why is it trending? (e.g. #RAG #LocalFirst)
    ```

---

## 🎨 Tone & Style
*   **Language**: Simplified Chinese (简体中文).
*   **Style**: Professional, Insightful, "Tech Magazine" vibe.
*   **Objective**: Make the user feel they have completely absorbed the world's most important tech information in 5 minutes.
