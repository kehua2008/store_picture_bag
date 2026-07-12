# 风格板生命周期

正式风格板来自分析结果导入或旧流程重建。

推荐主流程是分析结果导入：一批候选图由 Codex 自动聚类为多个经典风格，每个风格板保存该风格下的样本图片、通用提示词核心、提示词变体和负面词。旧流程重建只用于兼容历史粗分组。

状态：

- `draft`：旧流程或人工草稿。
- `ready_to_publish`：分析结果已导入，等待管理员审核发布。
- `published`：可被前台读取。
- `archived`：归档，不再使用。

首页展示规则：

- 只有 `status=published` 且 `showOnHome=true` 的风格板出现在用户端经典电商风格区。
- `displayOrder` 决定首页展示顺序。
- `version` 每次发布状态关键变化或重建时递增。

生成规则：

- 用户端只展示风格名、样本数量和视觉提示。
- 用户选择正式风格后，后端使用该风格板的 `promptCore` 和 `promptVariants`。
- `promptVariants` 用于轮换或随机化，避免同一风格输出过于单一。
- 用户端不展示 prompt 或 negative prompt。
