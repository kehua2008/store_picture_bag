# Vipshop Bags Image Evaluation Rubric

首版上线标准：评测集中“可直接上架”和“轻微修改可用”的比例达到 80% 以上。

## Dataset

- 品类：女包、男包、双肩包/电脑包、旅行箱/旅行袋、童包/小皮具。
- 每个品类至少 30 个商品任务。
- 每个任务至少包含一张参考图、商品标题、颜色、材质/风格、目标资产类型。
- 样本来源允许平台合规采集和人工导入；来源必须记录。

## Labels

- `ready`: 可直接用于唯品会上架。
- `minor_edit`: 只需轻微裁切、压缩或局部重试即可使用。
- `rejected`: 商品失真、规则违规、主体裁切、色差明显或商业质感不足。

## Blocking Rejection Reasons

- 尺寸、比例、格式、大小不符合目标规格。
- 出现文字、水印、二维码、价格、网址、第三方 Logo、拼接边框。
- 白底图不是纯白背景，或有明显阴影/渐变/抠图痕迹。
- 商品主体不完整、被裁切，或包型、颜色、手柄、肩带、拉链路径、五金、口袋、包底/轮组与参考图不一致。
- 主图背景杂乱，视觉中心不在商品。
- 持包、肩背、斜挎、双肩背或拉杆行走比例不自然，包款被身体、手部或道具遮挡关键结构。

## Reporting

每轮 prompt 或 provider 调整后记录：

- prompt recipe version
- provider and model
- category
- asset type
- ready count
- minor_edit count
- rejected count
- acceptance rate
- top rejection reasons
