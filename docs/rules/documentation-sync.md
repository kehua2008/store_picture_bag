# 文档同步规则

任何修改代码的变更都必须检查是否需要同步对应细粒度文档。

必须同步文档的情况：

- 新增或修改 API 行为。
- 新增或修改领域模型字段。
- 修改后台风格库流程。
- 修改用户端经典风格选择或生成逻辑。
- 修改导出/导入 schema。
- 修改 Codex Skill 输入输出约定。

风格库相关改动至少检查：

- `docs/style-library/raw-sample-pool.md`
- `docs/style-library/raw-candidate-pool.md`
- `docs/style-library/export-manifest.md`
- `docs/style-library/codex-skill-analysis.md`
- `docs/style-library/style-analysis-result-schema.md`
- `docs/style-library/style-board-lifecycle.md`
- `docs/frontend/classic-style-selection.md`
