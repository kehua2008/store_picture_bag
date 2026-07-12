# Style Analysis Result Schema

导入后台的分析结果文件名建议为 `style-analysis-result.json`。

必填结构：

```json
{
  "batchId": "style-candidate-batch-...",
  "analyzedAt": "2026-06-06T00:00:00.000Z",
  "analyst": "codex-style-library-analyst",
  "styleGroups": []
}
```

`styleGroups[]` 必填字段：

- `styleName`：后台和前台展示的风格名。
- `sampleIds`：该风格组关联的线上样本 ID。
- `promptCore`：稳定风格核心提示词。

推荐字段：

- `platform`
- `category`
- `categoryScope`
- `imageType`
- `imageTypeScope`
- `productBrief`
- `sceneBrief`
- `promptVariants`
- `negativePrompt`
- `rules.background`
- `rules.lighting`
- `rules.camera`
- `rules.pose`
- `rules.palette`
- `rules.composition`
- `rules.color`
- `rules.avoid`
- `rules.mustUse`

导入后系统按 `sampleIds` 回连线上样本，并生成 `ready_to_publish` 风格板。导入不会自动发布到首页。
