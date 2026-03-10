# bilibili-video-reader

读取 B 站视频内容的 skill。

这个 skill 的重点不是抓页面元信息，而是：

- 下载视频音频到临时目录
- 本地转写语音内容
- 基于 transcript 做总结

## Files

- [`SKILL.md`](./SKILL.md)
- [`scripts/read_bilibili_video.py`](./scripts/read_bilibili_video.py)
- [`agents/openai.yaml`](./agents/openai.yaml)

## Runtime Notes

依赖：

- `yt-dlp`
- `ffmpeg`
- `whisper-cli` from `whisper-cpp`

示例：

```bash
python3 scripts/read_bilibili_video.py "https://www.bilibili.com/video/BV..."
```

默认会清理临时文件；排查问题时才使用 `--keep-temp`。
