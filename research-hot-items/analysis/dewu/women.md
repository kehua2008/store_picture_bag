# 得物 / 女装 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 更偏潮流质感、单品细节、干净背景、低杂讯构图，鞋靴和箱包样本更有参考价值。
- Category pattern: 模特穿着图最能表达版型、衣长、肩腰比例和风格；半身图适合上衣，三分之二或全身图适合裙装/外套。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时强调潮流质感、材质可信、干净背景、低饱和高级色和细节特写。
- Category direction: 增加风格化但不喧宾夺主的姿态：轻微转身、自然走步、手扶衣襟、侧身展示腰线；强调面料垂坠和轮廓。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/dewu/women/dewu-women-01.webp` | untitled | https://gd-hbimg.huaban.com/f949658494fc1bd7a9b704d5be56069d0c061563e3da2-NcVcdr_fw658
- `images/dewu/women/dewu-women-02.jpg` | untitled | https://gd-filems.dancf.com/gaoding/gaoding/84097/40967d82-2e97-409a-9b52-29718fce3f04114897.jpg
- `images/dewu/women/dewu-women-03.jpg` | untitled | https://pic.nximg.cn/file/20181107/21497072_142412372000_2.jpg
- `images/dewu/women/dewu-women-04.webp` | untitled | https://gd-hbimg.huaban.com/5aabbdf721acb2e1042ab42dfa79fafba8180e8211489-aaSniY_fw658webp
- `images/dewu/women/dewu-women-05.jpg` | untitled | https://xiuxiu-pro.meitudata.com/posters/f077207ba5ddc7cbd8faf50e5c0c0a8d.jpg
- `images/dewu/women/dewu-women-06.png` | untitled | https://material-center.meitudata.com/material/image/6427ce88a6cac3241.png
- `images/dewu/women/dewu-women-07.webp` | untitled | https://gd-hbimg.huaban.com/ed15b8810c6e1f9f3060091cce2ae4acfc9446631a361-Frqcqv_fw658
- `images/dewu/women/dewu-women-08.jpg` | untitled | https://preview.qiantucdn.com/auto_machine/20240702/97944145-8138-427e-9022-9807779e9d23.jpg!w1024_new_small_1
- `images/dewu/women/dewu-women-09.jpg` | untitled | https://img95.699pic.com/desgin_photo/40095/5777_detail.jpg!detail860/fw/820/crop/0x1309a0a0/quality/90
- `images/dewu/women/dewu-women-10.jpg` | untitled | https://pic.nximg.cn/file/20181107/21497072_142005263000_2.jpg
