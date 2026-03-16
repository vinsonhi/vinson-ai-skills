# AI-Skills

个人正在使用的 AI Skills 集合。

## Skills

- [`xiaohongshu-research`](./skills/xiaohongshu-research/SKILL.md)
  使用已登录浏览器和小红书搜索/详情页做研究，结合正文、评论、图片、视频和作者主页来汇总真实用户反馈，并过滤高风险营销内容。
- [`bilibili-video-reader`](./skills/bilibili-video-reader/SKILL.md)
  读取 B 站视频的真实语音内容，下载音频后本地转写，再基于 transcript 做摘要，而不是只看标题、简介或评论。
- [`self-daily-briefing-skill`](./skills/self-daily-briefing-skill/SKILL.md)
  自用日报 skill，支持综合早报、财经早报、科技早报、AI 深度日报，以及美股自选股票早报。

## Install

把某个 skill 目录复制到你的 Codex skills 目录即可，例如：

```bash
mkdir -p ~/.codex/skills
cp -R skills/xiaohongshu-research ~/.codex/skills/
cp -R skills/bilibili-video-reader ~/.codex/skills/
cp -R skills/self-daily-briefing-skill ~/.codex/skills/
```

也可以按需只复制单个 skill。

如果你只想装这个日报 skill：

```bash
mkdir -p ~/.codex/skills
cp -R skills/self-daily-briefing-skill ~/.codex/skills/
```

## Notes

- 仓库只放可复用的 skill 文件，不放本地运行缓存
- 某些 skill 依赖本机环境，例如浏览器、Playwright、ffmpeg、whisper-cpp

## Structure

每个 skill 独立放在 `skills/<skill-name>/` 下，通常包含：

- `SKILL.md`
- `README.md`
- `references/`
- `scripts/`
- `agents/`

不提交本地运行缓存，例如 `.runtime/`。
