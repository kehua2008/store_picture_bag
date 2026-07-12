# 分析包 Manifest

`manifest.json` 是后台导出分析包时生成的线上到本地同步清单，不是线上固定文件。

导出 zip 结构：

```text
manifest.json
images/001-style-sample-xxx.png
images/002-style-sample-yyy.jpg
```

manifest 关键字段：

- `schemaVersion`：当前为 `style-export-manifest.v1`。
- `batchId` / `batchName`：来源候选批次。
- `exportedAt`：导出时间。
- `sampleIds`：导出样本 ID 列表。
- `samples[]`：每张图片的文件映射、线上样本 ID、来源、粗标签、备注、原始文件名和创建时间。

本地分析结果必须使用 `sampleId` 回连线上样本，不允许用文件名猜测线上记录。
