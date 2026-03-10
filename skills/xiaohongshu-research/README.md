# xiaohongshu-research

小红书研究型 skill。

当前实现重点：

- 优先使用浏览器搜索页做候选筛选，而不是按结果顺序逐条打开
- 详情页优先走移动端视图
- 结合正文、评论、图片、视频和作者主页做分析
- 区分原帖证据和评论证据
- 支持过滤高风险营销号，并优先保留更像普通用户的帖子

## Files

- [`SKILL.md`](./SKILL.md)
- [`references/marketing-filter.md`](./references/marketing-filter.md)
- [`scripts/xhs-research.mjs`](./scripts/xhs-research.mjs)
- [`agents/openai.yaml`](./agents/openai.yaml)

## Runtime Notes

脚本依赖 Playwright：

```bash
cd skills/xiaohongshu-research/scripts
npm install
```

如果要复用本机 Chrome 登录态，可以设置：

```bash
export XHS_CHROME_USER_DATA_DIR="$HOME/Library/Application Support/Google/Chrome"
export XHS_CHROME_PROFILE_DIRECTORY="Default"
```

首次登录后也可以使用 skill 自己的持久化 profile，避免每次重新扫码。
