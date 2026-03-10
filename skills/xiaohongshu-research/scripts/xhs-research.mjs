#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { chromium, devices } from "playwright";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILL_DIR = path.resolve(__dirname, "..");
const RUNTIME_DIR = path.join(SKILL_DIR, ".runtime");
const PROFILE_DIR = path.join(RUNTIME_DIR, "chromium-profile");
const ARTIFACTS_DIR = path.join(RUNTIME_DIR, "artifacts");
const DEBUG_LOG_PATH = path.join(RUNTIME_DIR, "debug.log");
const DEFAULT_TIMEOUT_MS = 45_000;
const PER_NOTE_TIMEOUT_MS = 60_000;
const MOBILE_DEVICE_NAME = "iPhone 14 Pro Max";
const BLOCKED_PATTERNS = [
  "当前笔记暂时无法浏览",
  "当前内容仅支持在小红书 APP 内查看",
  "请打开小红书App扫码查看",
  "你访问的页面不见了"
];

const MARKETING_TERMS = [
  "民宿",
  "酒店",
  "度假村",
  "旅行社",
  "定制",
  "代订",
  "地接",
  "客服",
  "管家",
  "顾问",
  "咨询",
  "预定",
  "接单",
  "团购",
  "领队",
  "官方",
  "私信",
  "滴滴我",
  "vx",
  "v:",
  "v信",
  "微信",
  "报价",
  "套餐",
  "最后几间",
  "放心住",
  "闭眼入",
  "冲",
  "可订",
  "联系我"
];

const AUTHENTIC_TERMS = [
  "踩雷",
  "避坑",
  "不推荐",
  "一般",
  "缺点",
  "实际",
  "转船",
  "船程",
  "延误",
  "价格",
  "加钱",
  "噪音",
  "虫",
  "海草",
  "水浑",
  "浪大",
  "餐食",
  "信号",
  "wifi"
];

const GENERIC_TOPIC_TERMS = [
  "水屋",
  "果冻海",
  "旅游",
  "旅行",
  "攻略",
  "酒店",
  "民宿",
  "度假村",
  "海岛",
  "潜水",
  "浮潜"
];

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function logDebug(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  await ensureDir(RUNTIME_DIR);
  await fs.appendFile(DEBUG_LOG_PATH, line, "utf8").catch(() => null);
  console.log(message);
}

function envFlag(name) {
  const value = process.env[name];
  if (!value) {
    return false;
  }
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function slugify(input) {
  return String(input)
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{Letter}\p{Number}-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "item";
}

function timestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate())
  ].join("") + "-" + [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join("");
}

function deriveTopicTerms(keyword = "") {
  const terms = new Set();
  const normalized = String(keyword).trim();
  if (!normalized) {
    return [];
  }
  terms.add(normalized);
  let remainder = normalized;
  for (const term of GENERIC_TOPIC_TERMS) {
    if (normalized.includes(term)) {
      terms.add(term);
      remainder = remainder.split(term).join(" ");
    }
  }
  for (const chunk of remainder.split(/[\s/|,，。！!？?、\-]+/)) {
    const clean = chunk.trim();
    if (clean.length >= 2 && clean.length <= 8) {
      terms.add(clean);
    }
  }
  return Array.from(terms);
}

function parseArgs(argv) {
  const [, , command, ...rest] = argv;
  const options = {};
  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (!token.startsWith("--")) {
      continue;
    }
    const key = token.slice(2);
    const next = rest[i + 1];
    if (!next || next.startsWith("--")) {
      options[key] = true;
      continue;
    }
    options[key] = next;
    i += 1;
  }
  return { command, options };
}

function requireOption(options, key) {
  const value = options[key];
  if (!value || value === true) {
    throw new Error(`Missing required option --${key}`);
  }
  return String(value);
}

function resolveHeadless(command, options) {
  if (Object.prototype.hasOwnProperty.call(options, "headless")) {
    return String(options.headless) === "true";
  }
  return command !== "login";
}

async function launchContext({ headless = false } = {}) {
  const userDataDir = process.env.XHS_CHROME_USER_DATA_DIR || PROFILE_DIR;
  await ensureDir(userDataDir);
  const baseOptions = {
    headless,
    viewport: { width: 1440, height: 1200 },
    locale: "zh-CN",
    args: [
      "--disable-blink-features=AutomationControlled",
      ...(process.env.XHS_CHROME_PROFILE_DIRECTORY
        ? [`--profile-directory=${process.env.XHS_CHROME_PROFILE_DIRECTORY}`]
        : [])
    ]
  };

  let context;
  try {
    context = await chromium.launchPersistentContext(userDataDir, {
      ...baseOptions,
      channel: envFlag("XHS_DISABLE_SYSTEM_CHROME") ? undefined : "chrome"
    });
  } catch (error) {
    if (process.env.XHS_CHROME_USER_DATA_DIR) {
      throw new Error(
        "Failed to open the requested Chrome profile. Close Chrome completely and retry, or unset XHS_CHROME_USER_DATA_DIR to use the dedicated automation profile."
      );
    }
    context = await chromium.launchPersistentContext(userDataDir, baseOptions);
  }
  const page = context.pages()[0] || await context.newPage();
  page.setDefaultTimeout(DEFAULT_TIMEOUT_MS);
  return { context, page };
}

async function launchMobileContext(storageState, { headless = false } = {}) {
  const browser = await chromium.launch({
    headless,
    channel: envFlag("XHS_DISABLE_SYSTEM_CHROME") ? undefined : "chrome",
    args: ["--disable-blink-features=AutomationControlled"]
  });
  const mobileContext = await browser.newContext({
    ...devices[MOBILE_DEVICE_NAME],
    locale: "zh-CN",
    storageState
  });
  const mobilePage = await mobileContext.newPage();
  mobilePage.setDefaultTimeout(DEFAULT_TIMEOUT_MS);
  return { browser, mobileContext, mobilePage };
}

async function isLoggedIn(page) {
  await page.goto("https://www.xiaohongshu.com", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const loginVisible = await page.locator("text=登录").first().isVisible().catch(() => false);
  return !loginVisible;
}

async function ensureLoggedIn(page, { interactive = false } = {}) {
  const loggedIn = await isLoggedIn(page);
  if (loggedIn) {
    return;
  }
  if (!interactive) {
    throw new Error("Not logged in. Run `node xhs-research.mjs login` first.");
  }
  console.log("浏览器已打开，请扫码登录小红书。登录成功后脚本会自动继续。");
  await logDebug("interactive login opened");
  for (let attempt = 0; attempt < 72; attempt += 1) {
    await page.waitForTimeout(5000);
    if (await isLoggedIn(page)) {
      console.log("登录状态已保存。");
      await logDebug("login state saved");
      return;
    }
  }
  throw new Error("Login timed out after 6 minutes.");
}

async function searchNotes(page, keyword, limit) {
  await logDebug(`[search] start keyword=${keyword} limit=${limit}`);
  const searchUrl = `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(keyword)}`;
  await page.goto(searchUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);
  for (let i = 0; i < 6; i += 1) {
    await page.mouse.wheel(0, 1800);
    await page.waitForTimeout(1500);
  }
  const results = await page.evaluate((maxResults) => {
    const cards = Array.from(document.querySelectorAll("section.note-item, [data-v-a264b01a], .note-item"));
    const seen = new Set();
    const items = [];
    for (const card of cards) {
      const links = Array.from(card.querySelectorAll("a[href]"));
      const link = links.find((node) => {
        const href = node.getAttribute("href") || "";
        return href.includes("/explore/") || href.includes("/search_result/");
      });
      if (!link) {
        continue;
      }
      const href = link.getAttribute("href") || "";
      const url = href.startsWith("http") ? href : `https://www.xiaohongshu.com${href}`;
      if (seen.has(url)) {
        continue;
      }
      seen.add(url);
      const titleCandidates = Array.from(card.querySelectorAll("span, div, a"))
        .map((node) => node.textContent?.trim())
        .filter((text) => text && text.length >= 4);
      const title = titleCandidates.sort((a, b) => b.length - a.length)[0] || "未知标题";
      const author =
        card.querySelector(".author, .name, .username")?.textContent?.trim() ||
        "";
      items.push({ title, url, author });
      if (items.length >= maxResults) {
        break;
      }
    }
    return items;
  }, limit);
  await logDebug(`[search] collected ${results.length} results`);
  return results;
}

async function collectNotesFromSearchResults(page, mobilePage, searchResults, options) {
  const notes = [];
  const desktopDetailPage = await page.context().newPage();
  desktopDetailPage.setDefaultTimeout(DEFAULT_TIMEOUT_MS);

  try {
    for (let index = 0; index < searchResults.length; index += 1) {
      const result = searchResults[index];
      await logDebug(`[collect] opening result ${index + 1}/${searchResults.length}`);
      const title = result.title || "未知标题";
      const author = result.author || "";
      const detailUrl = result.url || null;

      if (!detailUrl) {
        notes.push({
          title,
          author: author?.trim() || "",
          url: "",
          content: "",
          comments: [],
          marketing_score: 100,
          marketing_reasons: ["无法从搜索结果解析详情链接"],
          media: {
            page_screenshot: "",
            images: [],
            video_frames: [],
            video_poster: null
          }
        });
        continue;
      }

      await logDebug(`[collect] resolved detail url ${detailUrl}`);

      try {
        const collected = await Promise.race([
          collectNoteWithFallback(
            desktopDetailPage,
            mobilePage,
            { url: detailUrl, title, author },
            options
          ),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error("note_timeout")), PER_NOTE_TIMEOUT_MS);
          })
        ]);
        notes.push(collected);
      } catch (error) {
        notes.push({
          title,
          author: author?.trim() || "",
          url: detailUrl,
          content: "",
          comments: [],
          marketing_score: 100,
          marketing_reasons: [`采集失败: ${error.message}`],
          media: {
            page_screenshot: "",
            images: [],
            video_frames: [],
            video_poster: null
          }
        });
      }
    }

    return notes;
  } finally {
    await desktopDetailPage.close().catch(() => null);
  }
}

async function scrollComments(page) {
  for (let i = 0; i < 8; i += 1) {
    await page.evaluate(() => {
      const container =
        document.querySelector(".comments-container") ||
        document.querySelector(".comment-list") ||
        document.scrollingElement;
      if (container) {
        container.scrollBy(0, 1200);
      }
    });
    await page.waitForTimeout(1200);
  }
}

function scoreMarketing(note) {
  const reasons = [];
  let score = 0;
  const corpus = [
    note.title,
    note.author,
    note.content,
    ...(note.comments || []).map((comment) => comment.content)
  ].join("\n").toLowerCase();

  for (const term of MARKETING_TERMS) {
    if (corpus.includes(term.toLowerCase())) {
      score += 8;
      reasons.push(`包含营销词: ${term}`);
    }
  }

  const numericMatches = corpus.match(/\d{2,4}/g) || [];
  if (numericMatches.length >= 3) {
    score -= 8;
    reasons.push("包含较多具体数字，信息密度较高");
  }

  for (const term of AUTHENTIC_TERMS) {
    if (corpus.includes(term.toLowerCase())) {
      score -= 6;
      reasons.push(`出现真实体验信号: ${term}`);
    }
  }

  if ((note.comments || []).length === 0) {
    score += 10;
    reasons.push("评论较少，缺少旁证");
  }

  if ((note.content || "").length < 40) {
    score += 10;
    reasons.push("正文信息量低");
  }

  if (/(冲|闭眼入|绝美|封神)/.test(note.title || "")) {
    score += 12;
    reasons.push("标题营销感较强");
  }

  const profile = note.author_profile || {};
  const nickname = profile.nickname || note.author || "";
  const bio = profile.bio || "";
  const recentTitles = profile.recent_titles || [];
  const topicTerms = profile.topic_terms || [];
  const profileCorpus = [nickname, bio, ...recentTitles].join("\n").toLowerCase();

  if (nickname && MARKETING_TERMS.some((term) => nickname.toLowerCase().includes(term.toLowerCase()))) {
    score += 18;
    reasons.push("昵称带明显营销身份词");
  }

  if (bio && MARKETING_TERMS.some((term) => bio.toLowerCase().includes(term.toLowerCase()))) {
    score += 18;
    reasons.push("简介带咨询/交易导向");
  }

  if (topicTerms.length > 0) {
    const nicknameTopicHits = topicTerms.filter((term) => nickname.includes(term));
    if (nicknameTopicHits.length >= 1 && MARKETING_TERMS.some((term) => profileCorpus.includes(term.toLowerCase()))) {
      score += 24;
      reasons.push(`昵称与搜索主题强相关: ${nicknameTopicHits.join("、")}`);
    }

    const relatedRecentCount = recentTitles.filter((title) => topicTerms.some((term) => title.includes(term))).length;
    const unrelatedRecentCount = recentTitles.length - relatedRecentCount;

    if (relatedRecentCount >= 3) {
      score += 18;
      reasons.push("主页近期内容高度集中在同一搜索主题");
    }
    if (relatedRecentCount >= Math.max(3, Math.ceil(recentTitles.length * 0.7)) && recentTitles.length >= 4) {
      score += 12;
      reasons.push("主页近期内容对当前主题的集中度异常高");
    }
    if (unrelatedRecentCount >= 3 && relatedRecentCount <= 1) {
      score -= 12;
      reasons.push("主页近期内容大多是无关日常，偏素人账号");
    }
  }

  score = Math.max(0, Math.min(100, score));
  return {
    marketing_score: score,
    marketing_reasons: Array.from(new Set(reasons))
  };
}

async function inspectAuthorProfile(context, profileUrl, topicTerms) {
  if (!profileUrl) {
    return {
      profile_url: "",
      nickname: "",
      bio: "",
      recent_titles: [],
      topic_terms: topicTerms
    };
  }

  const profilePage = await context.newPage();
  profilePage.setDefaultTimeout(DEFAULT_TIMEOUT_MS);
  try {
    await profilePage.goto(profileUrl, { waitUntil: "domcontentloaded" });
    await profilePage.waitForTimeout(4000);
    await profilePage.mouse.wheel(0, 1200);
    await profilePage.waitForTimeout(1200);
    return await profilePage.evaluate((terms) => {
      const pickText = (selectors) => {
        for (const selector of selectors) {
          const node = document.querySelector(selector);
          const value = node?.textContent?.trim();
          if (value) {
            return value;
          }
        }
        return "";
      };

      const titles = [];
      const seen = new Set();
      const anchors = Array.from(document.querySelectorAll('a[href*="/explore/"], a[href*="noteId="]'));
      for (const anchor of anchors) {
        const text = anchor.textContent?.trim()?.replace(/\s+/g, " ");
        if (!text || text.length < 4 || text.length > 60 || seen.has(text)) {
          continue;
        }
        seen.add(text);
        titles.push(text);
        if (titles.length >= 8) {
          break;
        }
      }

      return {
        profile_url: window.location.href,
        nickname: pickText([".username", ".user-name", ".nickname", "h1", ".name"]),
        bio: pickText([".desc", ".bio", ".signature", ".user-desc", ".profile-desc"]),
        recent_titles: titles,
        topic_terms: terms
      };
    }, topicTerms);
  } finally {
    await profilePage.close().catch(() => null);
  }
}

async function downloadFile(url, targetPath) {
  if (!url) {
    return null;
  }
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0"
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(targetPath, Buffer.from(arrayBuffer));
  return targetPath;
}

async function extractVideoFrames(page, mediaDir, noteSlug) {
  const video = page.locator("video").first();
  const exists = await video.count();
  if (!exists) {
    return { frames: [], poster: null };
  }

  const box = await video.boundingBox();
  if (!box) {
    return { frames: [], poster: null };
  }

  const framePaths = [];
  const posterPath = path.join(mediaDir, `${noteSlug}-video-poster.png`);
  await video.screenshot({ path: posterPath }).catch(() => null);

  const duration = await video.evaluate((node) => Number(node.duration || 0)).catch(() => 0);
  const checkpoints = duration > 1 ? [0.05, 0.25, 0.5, 0.75] : [0];

  for (let index = 0; index < checkpoints.length; index += 1) {
    const ratio = checkpoints[index];
    if (duration > 1) {
      await video.evaluate(
        async (node, time) => {
          node.currentTime = time;
          await new Promise((resolve) => {
            const done = () => {
              node.removeEventListener("seeked", done);
              resolve();
            };
            node.addEventListener("seeked", done, { once: true });
          });
        },
        duration * ratio
      ).catch(() => null);
      await page.waitForTimeout(500);
    }
    const framePath = path.join(mediaDir, `${noteSlug}-video-frame-${index + 1}.png`);
    await page.screenshot({
      path: framePath,
      clip: {
        x: Math.max(0, box.x),
        y: Math.max(0, box.y),
        width: box.width,
        height: box.height
      }
    });
    framePaths.push(framePath);
  }

  return { frames: framePaths, poster: posterPath };
}

async function enrichVideoWithFfmpeg(framePaths) {
  if (framePaths.length === 0) {
    return;
  }
  const montagePath = path.join(path.dirname(framePaths[0]), "video-frames-contact-sheet.jpg");
  const args = [
    "-y",
    "-i",
    framePaths[0],
    "-i",
    framePaths[1] || framePaths[0],
    "-i",
    framePaths[2] || framePaths[0],
    "-i",
    framePaths[3] || framePaths[framePaths.length - 1],
    "-filter_complex",
    "xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0",
    montagePath
  ];
  try {
    await execFileAsync("ffmpeg", args);
  } catch {
    return;
  }
}

async function collectImages(page, mediaDir, noteSlug) {
  const imageUrls = await page.evaluate(() => {
    const urls = new Set();
    const candidates = Array.from(document.querySelectorAll("img"));
    for (const image of candidates) {
      const src = image.getAttribute("src") || image.getAttribute("data-src") || "";
      if (!src) {
        continue;
      }
      if (src.startsWith("data:")) {
        continue;
      }
      urls.add(src.startsWith("//") ? `https:${src}` : src);
    }
    return Array.from(urls);
  });

  const saved = [];
  for (let index = 0; index < imageUrls.length; index += 1) {
    const imageUrl = imageUrls[index];
    const ext = imageUrl.includes(".png") ? ".png" : ".jpg";
    const targetPath = path.join(mediaDir, `${noteSlug}-image-${index + 1}${ext}`);
    try {
      await downloadFile(imageUrl, targetPath);
      saved.push(targetPath);
    } catch {
      continue;
    }
  }
  return saved;
}

async function extractNoteData(page) {
  return page.evaluate(() => {
    const text = (selectorList) => {
      for (const selector of selectorList) {
        const node = document.querySelector(selector);
        const value = node?.textContent?.trim();
        if (value) {
          return value;
        }
      }
      return "";
    };

    const comments = [];
    const commentNodes = document.querySelectorAll(
      "div.comment-item, div.commentItem, div.comment-content, div.comment-wrapper, section.comment, div.feed-comment"
    );
    for (const node of Array.from(commentNodes).slice(0, 40)) {
      const user =
        node.querySelector(".author, .name, .username")?.textContent?.trim() ||
        "";
      const content =
        node.querySelector(".content, .text, p, span")?.textContent?.trim() ||
        node.textContent?.trim() ||
        "";
      const time =
        node.querySelector(".date, .time")?.textContent?.trim() ||
        "";
      if (content) {
        comments.push({ user, content, time });
      }
    }

    return {
      title: text(["#detail-title", "div.title", "h1"]),
      author: text(["span.username", "a.name", ".author-wrapper .username", ".info .name"]),
      publish_time: text(["span.date", ".bottom-container .date", ".date"]),
      content: text(["#detail-desc", ".note-content", ".desc", ".content"]),
      page_title: document.title,
      current_url: window.location.href,
      profile_url: (() => {
        const anchors = Array.from(document.querySelectorAll("a[href]"));
        const match = anchors.find((node) => {
          const href = node.getAttribute("href") || "";
          return href.includes("/user/profile/") || href.includes("/user/");
        });
        if (!match) {
          return "";
        }
        const href = match.getAttribute("href") || "";
        return href.startsWith("http") ? href : `https://www.xiaohongshu.com${href}`;
      })(),
      comments
    };
  });
}

async function collectCurrentNotePage(page, noteInput, options) {
  const artifactDir = options.artifactDir;
  const commentsLimit = options.commentsLimit;
  const topicTerms = options.topicTerms || [];
  await page.waitForTimeout(6000);
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(1500);
  await scrollComments(page);

  const note = await extractNoteData(page);
  note.url = page.url();
  note.input_title = noteInput.title || "";
  note.comments = (note.comments || []).slice(0, commentsLimit);
  note.access_mode = "web";
  note.author_profile = await inspectAuthorProfile(page.context(), note.profile_url, topicTerms).catch(() => ({
    profile_url: note.profile_url || "",
    nickname: note.author || "",
    bio: "",
    recent_titles: [],
    topic_terms: topicTerms
  }));

  const blockedText = await page.locator("body").textContent().catch(() => "");
  if (BLOCKED_PATTERNS.some((pattern) => (blockedText || "").includes(pattern))) {
    await logDebug("[collect-note] blocked on current page");
    throw new Error("app_only_or_blocked");
  }

  const noteSlug = slugify(note.title || note.input_title || timestamp());
  const noteDir = path.join(artifactDir, noteSlug);
  const mediaDir = path.join(noteDir, "media");
  await ensureDir(mediaDir);

  const pageScreenshotPath = path.join(noteDir, "note-page.png");
  await page.screenshot({ path: pageScreenshotPath, fullPage: true });

  const images = await collectImages(page, mediaDir, noteSlug);
  const video = await extractVideoFrames(page, mediaDir, noteSlug);
  await enrichVideoWithFfmpeg(video.frames);

  const scored = scoreMarketing(note);
  return {
    ...note,
    ...scored,
    media: {
      page_screenshot: pageScreenshotPath,
      images,
      video_frames: video.frames,
      video_poster: video.poster
    }
  };
}

async function collectNote(page, noteInput, options) {
  const url = noteInput.url;
  await logDebug(`[collect-note] goto ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  return collectCurrentNotePage(page, noteInput, options);
}

async function openMobileNoteViaSearch(page, noteInput, keyword) {
  const detailId = (noteInput.url.match(/explore\/([^/?#]+)/) || [])[1] || "";
  const searchUrl = `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(keyword)}`;
  await logDebug(`[mobile-search] goto ${searchUrl}`);
  await page.goto(searchUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const clicked = await page.evaluate(({ id, title }) => {
      const anchors = Array.from(document.querySelectorAll('a[href*="/explore/"]'));
      const target = anchors.find((node) => {
        const href = node.getAttribute("href") || "";
        const text = node.textContent || "";
        return (id && href.includes(id)) || (title && text.includes(title.slice(0, 8)));
      });
      if (!target) {
        return false;
      }
      target.click();
      return true;
    }, { id: detailId, title: noteInput.title || "" });

    if (clicked) {
      await page.waitForTimeout(5000);
      return true;
    }

    await page.mouse.wheel(0, 1800);
    await page.waitForTimeout(1200);
  }

  return false;
}

async function collectNoteWithFallback(desktopPage, mobilePage, noteInput, options) {
  try {
    await logDebug("[fallback] trying desktop detail");
    return await collectNote(desktopPage, noteInput, options);
  } catch (error) {
    if (error.message !== "app_only_or_blocked") {
      throw error;
    }
  }

  await logDebug("[fallback] switching to mobile detail");
  const openedViaSearch = options.keyword
    ? await openMobileNoteViaSearch(mobilePage, noteInput, options.keyword)
    : false;
  const mobileNote = openedViaSearch
    ? await collectCurrentNotePage(mobilePage, noteInput, options)
    : await collectNote(mobilePage, noteInput, options);
  mobileNote.access_mode = "mobile";
  return mobileNote;
}

function buildReport(keyword, notes, artifactDir) {
  const ranked = [...notes].sort((a, b) => a.marketing_score - b.marketing_score);
  const lines = [
    `# 小红书研究报告`,
    ``,
    `- 关键词: ${keyword}`,
    `- 样本数: ${notes.length}`,
    `- 产物目录: ${artifactDir}`,
    ``,
    `## 低营销风险优先排序`,
    ``
  ];

  ranked.forEach((note, index) => {
    lines.push(`${index + 1}. ${note.title || note.input_title || "未知标题"}`);
    lines.push(`   - 作者: ${note.author || "未知作者"}`);
    if (note.author_profile?.nickname || (note.author_profile?.recent_titles || []).length > 0) {
      lines.push(`   - 主页抽样: ${note.author_profile.nickname || note.author || "未知昵称"} / ${(note.author_profile.recent_titles || []).slice(0, 3).join(" | ") || "无近期内容样本"}`);
    }
    lines.push(`   - 访问通道: ${note.access_mode || "unknown"}`);
    lines.push(`   - 营销分: ${note.marketing_score}`);
    lines.push(`   - 时间: ${note.publish_time || "未知"}`);
    lines.push(`   - 链接: ${note.url}`);
    lines.push(`   - 过滤原因: ${note.marketing_reasons.join("；") || "无明显营销信号"}`);
    lines.push(`   - 正文摘要: ${(note.content || "").replace(/\s+/g, " ").slice(0, 140) || "无"}`);
    const commentPreview = (note.comments || []).slice(0, 3).map((comment) => `${comment.user || "匿名"}: ${comment.content}`).join(" | ");
    lines.push(`   - 评论样本: ${commentPreview || "无"}`);
    lines.push(`   - 媒体: ${note.media.images.length} 张图，${note.media.video_frames.length} 个视频帧`);
    lines.push(``);
  });

  lines.push(`## 可信结论写作要求`);
  lines.push(``);
  lines.push(`- 优先引用营销分最低且包含具体细节的样本。`);
  lines.push(`- 如图片和视频帧与正文不一致，以媒体和评论为准。`);
  lines.push(`- 对广告嫌疑样本，保留为反例，不作为主结论。`);
  lines.push(``);
  return `${lines.join("\n")}\n`;
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await logDebug(`[write-json] ${filePath}`);
}

async function main() {
  const { command, options } = parseArgs(process.argv);
  if (!command || ["help", "--help", "-h"].includes(command)) {
    console.log("Usage: node xhs-research.mjs <login|search|collect|research> [--keyword ...] [--url ...] [--limit 8] [--comments 30]");
    return;
  }

  await ensureDir(ARTIFACTS_DIR);
  await fs.writeFile(DEBUG_LOG_PATH, "", "utf8").catch(() => null);
  await logDebug(`[main] command=${command}`);
  const headless = resolveHeadless(command, options);
  const { context, page } = await launchContext({ headless });
  let mobileBrowser = null;
  let mobileContext = null;
  let mobilePage = null;

  try {
    switch (command) {
      case "login": {
        await ensureLoggedIn(page, { interactive: true });
        break;
      }
      case "search": {
        const keyword = requireOption(options, "keyword");
        const limit = Number(options.limit || 10);
        await ensureLoggedIn(page);
        const results = await searchNotes(page, keyword, limit);
        console.log(JSON.stringify(results, null, 2));
        break;
      }
      case "collect": {
        const url = requireOption(options, "url");
        await logDebug(`[main] collect url=${url}`);
        const runDir = path.join(ARTIFACTS_DIR, `${timestamp()}-${slugify("single-note")}`);
        await ensureDir(runDir);
        await ensureLoggedIn(page);
        const storageState = await context.storageState();
        ({ browser: mobileBrowser, mobileContext, mobilePage } = await launchMobileContext(storageState, {
          headless
        }));
        const note = await collectNoteWithFallback(page, mobilePage, { url, title: "" }, {
          artifactDir: runDir,
          commentsLimit: Number(options.comments || 30),
          topicTerms: deriveTopicTerms(options.keyword || "")
        });
        await writeJson(path.join(runDir, "notes.json"), [note]);
        const report = buildReport(url, [note], runDir);
        await fs.writeFile(path.join(runDir, "report.md"), report, "utf8");
        console.log(runDir);
        break;
      }
      case "research": {
        const keyword = requireOption(options, "keyword");
        const limit = Number(options.limit || 8);
        const commentsLimit = Number(options.comments || 30);
        const topicTerms = deriveTopicTerms(keyword);
        await logDebug(`[main] research keyword=${keyword} limit=${limit} comments=${commentsLimit}`);
        const runDir = path.join(ARTIFACTS_DIR, `${timestamp()}-${slugify(keyword)}`);
        await ensureDir(runDir);
        await ensureLoggedIn(page);
        const storageState = await context.storageState();
        ({ browser: mobileBrowser, mobileContext, mobilePage } = await launchMobileContext(storageState, {
          headless
        }));
        const searchResults = await searchNotes(page, keyword, limit);
        await writeJson(path.join(runDir, "search-results.json"), searchResults);
        const notes = await collectNotesFromSearchResults(page, mobilePage, searchResults, {
          artifactDir: runDir,
          commentsLimit,
          topicTerms
        });
        await writeJson(path.join(runDir, "notes.json"), notes);
        const report = buildReport(keyword, notes, runDir);
        await fs.writeFile(path.join(runDir, "report.md"), report, "utf8");
        console.log(runDir);
        break;
      }
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } finally {
    if (mobileContext) {
      await mobileContext.close().catch(() => null);
    }
    if (mobileBrowser) {
      await mobileBrowser.close().catch(() => null);
    }
    await context.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
