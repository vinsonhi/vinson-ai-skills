---
name: bilibili-video-reader
description: Read and summarize Bilibili videos from video URLs by downloading audio, transcribing speech locally with whisper.cpp, and extracting key points. Use when a user shares a Bilibili video link, asks to watch/read/summarize a Bilibili video, asks for a transcript of spoken content, or when metadata/comments are insufficient and the actual video audio must be processed. The workflow uses temporary files and automatically cleans up downloaded audio and wav files unless explicitly asked to keep them.
---

# Bilibili Video Reader

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
