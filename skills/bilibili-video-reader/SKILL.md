---
name: bilibili-video-reader
description: Read and summarize Bilibili videos from video URLs by downloading audio, transcribing speech locally with whisper.cpp, and extracting key points. Use when a user shares a Bilibili video link, asks to watch/read/summarize a Bilibili video, asks for a transcript of spoken content, or when metadata/comments are insufficient and the actual video audio must be processed. The workflow uses temporary files and automatically cleans up downloaded audio and wav files unless explicitly asked to keep them.
---

# Bilibili Video Reader

## Install

Simplest instruction for another AI tool:

```text
帮我安装这个 skill：https://github.com/vinsonhi/AI-Skills/tree/main/skills/bilibili-video-reader
```

If the tool supports GitHub path based skill installation, this is usually enough.

Use this skill when the request requires the video's spoken content, not just title, description, or comments.

## Workflow

1. Run the script:

```bash
python3 ~/.codex/skills/bilibili-video-reader/scripts/read_bilibili_video.py "https://www.bilibili.com/video/BV..."
```

2. Read the JSON result:
- `metadata`: title, uploader, duration, counts, description
- `transcript`: locally transcribed speech content
- `cleanup`: whether temp files were auto-removed

3. Summarize from the transcript first. Use metadata only to frame the summary, not as a substitute for actually reading the spoken content.

4. If the user wants a faster answer, provide:
- `3-5` key takeaways
- the speaker's main recommendation
- any caveats or target audience mentioned in the video

## Cleanup

The script uses a temporary directory and deletes downloaded audio, converted wav files, and transcript scratch files automatically on success or failure.

Use `--keep-temp` only for debugging:

```bash
python3 ~/.codex/skills/bilibili-video-reader/scripts/read_bilibili_video.py "URL" --keep-temp
```

## Requirements

- `yt-dlp`
- `ffmpeg`
- `whisper-cli` from `whisper-cpp`
- a local whisper.cpp model, default:
  `~/.agent-reach/models/ggml-base.bin`

If the model is missing, install it with:

```bash
mkdir -p ~/.agent-reach/models
curl -L -o ~/.agent-reach/models/ggml-base.bin \
  https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin
```

Install tooling if needed:

```bash
brew install ffmpeg whisper-cpp
/opt/homebrew/bin/python3.11 -m pip install --user yt-dlp
```

## Notes

- Prefer transcript-based summaries over page scraping.
- If the video already has usable subtitles from another source, you can use them, but still keep temp downloads out of the workspace.
- Never create Bilibili audio/video files inside the user workspace. Use temp storage only.

## Output Example

Show the user a polished Markdown summary, not raw transcript dumps. A good answer should look like this:

```markdown
这期视频的主线很清楚，核心是在讲 MiniMax 财报 + 中国大模型为什么正在变成“制造业”逻辑。

关键点我给你压成 5 条：

- 视频最核心的判断是：中国正在把 AI 做成低成本、高供给、可规模化的制造业，而不只是硅谷那种“冲 AGI 叙事”的高估值故事。
- 他特别强调 token 成本快速下降 的意义。以前很多 AI 用法想不出来，不是因为需求不存在，而是因为 token 太贵，成本限制了工作流设计和想象力。
- 视频里拿 MiniMax 举例，认为它现在有竞争力的关键不是“绝对最强”，而是 便宜、够用、压缩做得狠，所以能在很多实际场景里跑赢更贵的模型。
- 他在讨论一个很重要的转变：现在用 AI 不能再用“省 token”的穷人思维。如果一个任务重要，就应该把 token 当生产资料去投入，而不是抠着用。
- 从商业角度，他的结论是：AI 的价值越来越像雇人。不是看会员订阅费，而是看“这些 token 能不能稳定换来产出”。

再压成一句话就是：

这视频的结论是，中国大模型正在从“讲故事的 AI”转向“低成本、可量产、能替代部分脑力劳动的 AI 基础设施”，MiniMax 是这个趋势的代表之一。

如果你要，我可以继续给你做一版更“投资/商业分析”视角的总结，或者一版更“普通用户怎么用 AI 才不亏”的实用版。

...省略
```
