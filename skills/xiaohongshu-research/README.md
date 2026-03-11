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

## 安装

最简单的说法：

```text
帮我安装这个 skill：https://github.com/vinsonhi/AI-Skills/tree/main/skills/xiaohongshu-research
```

如果对方支持 GitHub 仓库路径安装，通常这句话就够了。

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

## 输出示例

下面不是完整输出，只是最终呈现形式的示意。真实回答会列更多样本和证据，结尾用 `...省略` 收束。

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

- 样本 A：正文给出 4 人用餐，总价 680，明确写了 皮皮虾、花蟹、扇贝 和加工费，评论区 7 条在讨论“加工费偏高”。
- 样本 B：图片里直接拍了摊位价签和称重过程，评论区有人补充“这家会先确认做法再下锅”，可信度较高。

一句话结论：

在小红书上看海鲜攻略，最有用的不是找“最好吃”，而是找 愿意把价格、称重、加工费和踩坑细节写明白 的真实用户帖子。

...省略
```
