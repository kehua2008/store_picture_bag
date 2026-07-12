# AI代写与成本追踪后续备忘录

更新时间：2026-07-02

## 当前已定方向

- AI代写提示词继续走现有云雾 OpenAI-compatible API。
- 测试阶段使用低成本视觉小模型：`gpt-4o-mini`。
- 暂不单独扣用户积分，先记录真实调用消耗，积累样本后再定价。
- AI代写/改写成功后会记录 usage 到 `.data/video-prompt-writer-usage.json`。

## 当前推荐配置

```env
VIDEO_PROMPT_WRITER_BASE_URL=https://yunwu.ai
VIDEO_PROMPT_WRITER_MODEL=gpt-4o-mini
VIDEO_PROMPT_WRITER_PRICE_TABLE_JSON={}
```

说明：

- `VIDEO_PROMPT_WRITER_API_KEY` 暂时不用单独配置，默认复用 `YUNWU_API_KEY`。
- 如果后续给 AI代写单独买了更便宜的 key，再补 `VIDEO_PROMPT_WRITER_API_KEY`。
- 不要用生图模型 `gpt-image-2` 来做代写；代写只需要看图和写提示词。

## 后续需要你补充的信息

1. 云雾 `gpt-4o-mini` 的真实价格
   - 输入 token：每百万 token 多少钱。
   - 输出 token：每百万 token 多少钱。
   - 是否图片输入另有计费规则。

2. 如果测试 `gpt-4o-mini` 质量不够，再对比一个更强但仍便宜的模型
   - 备选：`gpt-4.1-mini` 或云雾后台同价位视觉模型。
   - 对比标准：商品理解准确度、分镜具体程度、修改意见是否真的重写。

3. 视频生成、视频超分、AI代写三类价格表
   - 草稿视频：按模型、清晰度、时长、是否生成声音。
   - 超分视频：按源清晰度、目标清晰度、时长。
   - AI代写：按模型、输入 token、输出 token。

## 价格表填写格式

AI代写价格表后续填这里：

```env
VIDEO_PROMPT_WRITER_PRICE_TABLE_JSON={
  "gpt-4o-mini": {
    "inputPerMillionCny": 0,
    "outputPerMillionCny": 0
  }
}
```

成本公式：

```text
代写成本 =
  promptTokens / 1_000_000 * inputPerMillionCny
+ completionTokens / 1_000_000 * outputPerMillionCny
```

如果供应商只返回 `total_tokens`，系统会先保留原始 `rawUsage`，成本先标记为 `missing_price` 或按后续规则估算。

## 当前记录字段

每次 AI代写/改写成功后记录：

- `customerId`
- `mode`：`draft` 或 `revise`
- `provider`
- `model`
- `promptTokens`
- `completionTokens`
- `totalTokens`
- `imageCount`
- `estimatedCostCny`
- `costStatus`
- `rawUsage`
- `createdAt`

## 后续积分策略建议

先观察 50-100 次真实 AI代写调用，再决定积分：

- 如果平均成本极低：可以免费并入视频生成服务，提高体验。
- 如果平均成本稳定但可控：每次 AI代写收 1 点，AI改写收 1 点。
- 如果用户大量反复改写：可做每天免费次数，超出后扣点。

不要现在拍脑袋定价；先用真实 usage 反推“实际成本 + 目标毛利率”。

## 后续升级事项

- 后台增加 AI代写成本看板：按天、按用户、按模型统计调用次数、tokens、成本。
- 后台增加价格表编辑入口，避免每次改 `.env.local`。
- 记录失败调用：失败原因、供应商状态码、是否产生费用。
- 视频生成记录里展示“AI代写已使用/未使用”和代写成本状态。
- 定期抽样检查代写质量：是否真的理解商品图、是否按修改意见重写、是否避免虚假卖点。
- 如果云雾模型价格波动，优先更换 `VIDEO_PROMPT_WRITER_MODEL`，不要影响生图和视频生成模型。

