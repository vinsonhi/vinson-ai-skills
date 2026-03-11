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

## 输出示例

下面不是完整输出，只是最终呈现形式的示意。真实回答会更完整，结尾用 `...省略` 收束。

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
