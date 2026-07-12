# 得物 / 箱包 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 更偏潮流质感、单品细节、干净背景、低杂讯构图，鞋靴和箱包样本更有参考价值。
- Category pattern: 箱包需要清楚展示包型、五金、容量感、肩带/手柄结构；可用手持、肩背或产品静物两条路线。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时强调潮流质感、材质可信、干净背景、低饱和高级色和细节特写。
- Category direction: 增加正面+侧面角度、五金微光、皮革/织物纹理、包型挺括度；模特图要保证包不被手臂遮挡。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/dewu/bags/dewu-bags-01.jpg` | untitled | https://preview.qiantucdn.com/auto_machine/20241016/d6ebb508-12b4-4362-a8a9-3fe915ceb713.jpg!w1024_new_small_1
- `images/dewu/bags/dewu-bags-02.webp` | untitled | https://gd-hbimg.huaban.com/74ca6ec098a0e3ee809caddd8c88fb3fadaf939837966-RfvcXC_fw658webp
- `images/dewu/bags/dewu-bags-03.jpg` | untitled | https://preview.qiantucdn.com/auto_machine/20221111/d8e3ebff-90b1-41fb-a6cf-ab57839128f1.jpg!w1024_new_small_1
- `images/dewu/bags/dewu-bags-04.jpg` | untitled | https://pic2.zhimg.com/v2-b68fa6c128ec6ac219a3d8a6474f31d5_r.jpg
- `images/dewu/bags/dewu-bags-05.jpg` | untitled | https://pic.ntimg.cn/file/20230215/12629094_172702073102_2.jpg
- `images/dewu/bags/dewu-bags-06.jpg` | untitled | https://img95.699pic.com/desgin_photo/40080/6486_detail.jpg!detail860/fw/820/crop/0x1309a0a0/quality/90
- `images/dewu/bags/dewu-bags-07.webp` | untitled | https://gd-hbimg.huaban.com/ecd7c8deaee352aaee9ce2189ba3ef2ee37caf29301ba-1nv5hT_fw658webp
- `images/dewu/bags/dewu-bags-08.jpg` | untitled | https://pic.ibaotu.com/00/02/94/82C888piCHMg.jpg-0.jpg!ww7002v3
- `images/dewu/bags/dewu-bags-09.png` | untitled | https://img.shetu66.com/2024/01/07/170462117646280313.png
- `images/dewu/bags/dewu-bags-10.webp` | untitled | https://gd-hbimg.huaban.com/a73b763fd9865f42f82b76e32735319aafb0625e6decc-RZFv5h_fw658webp
