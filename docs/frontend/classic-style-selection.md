# 经典电商风格选择

用户端经典风格包括两类来源：

- 内置爆款风格预设。
- 后台发布的正式风格板。

后台风格板必须满足：

- `status=published`
- `showOnHome=true`

用户端不展示 prompt、negative prompt、风格规则或 AI 参数。界面只展示风格名称、样本数量和面向用户的简短说明。

生成任务提交时，正式风格板会作为 `customStylePrompts` 传给后端。prompt 内容来自后台导入的 `promptCore`、`promptVariants`、规则词汇和 negative prompt。
