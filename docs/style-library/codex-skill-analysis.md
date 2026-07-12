# Codex Skill 离线分析

风格候选批次的最终归类由本地 Codex Skill 完成。Skill 位于 `.codex/skills/style-library-analyst/SKILL.md`。

分析职责：

- 读取分析包图片和 `manifest.json`。
- 根据视觉特征自动聚类为若干经典风格组，而不是沿用后台上传时的占位标签。
- 为每组命名短中文风格名。
- 输出商品/品类范围、图片类型范围、商品简介和场景简介。
- 倒推可复用的 `promptCore`、`promptVariants`、`negativePrompt`。
- 输出背景、光线、构图、色彩、姿态/商品角度和规避规则。

分析边界：

- 不接线上视觉 API。
- 不复制样本图、品牌标识、文字、脸、具体商家布局。
- 不把候选阶段的粗标签当成最终判断。
- 如果 manifest 中出现 `free/general/style_candidate/待 Codex 分析`，必须视为上传占位，不得作为风格结论。
- 不直接发布首页风格。
