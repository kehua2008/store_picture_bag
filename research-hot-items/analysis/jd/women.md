# 京东 / 女装 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 更偏可信、标准和品控感，白底/浅灰棚拍、完整商品、材质细节和干净构图更适合平台调性。
- Category pattern: 模特穿着图最能表达版型、衣长、肩腰比例和风格；半身图适合上衣，三分之二或全身图适合裙装/外套。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时强化稳定棚拍、可信光线、材质清晰和标准商品角度，减少夸张场景和强滤镜。
- Category direction: 增加风格化但不喧宾夺主的姿态：轻微转身、自然走步、手扶衣襟、侧身展示腰线；强调面料垂坠和轮廓。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/jd/women/jd-women-01.jpg` | untitled | https://photo.16pic.com/00/55/12/16pic_5512922_b.jpg
- `images/jd/women/jd-women-02.webp` | untitled | https://gd-hbimg.huaban.com/c97e42bb314c6f2e09fa8f39f7499bfafba080d030544-EQVCO2_fw658
- `images/jd/women/jd-women-03.png` | untitled | https://img.tuguaishou.com/ips_templ_preview/65/56/9b/lg_3627924_1608541680_5fe065f076901.jpg!w1024_w?auth_key=1897344000-0-0-534bdeae5708efc8760fdd1e8011013b
- `images/jd/women/jd-women-04.jpg` | untitled | https://pic.ibaotu.com/00/02/17/26K888piCUdf.jpg-2.jpg!ww7002v3
- `images/jd/women/jd-women-05.jpg` | untitled | https://picb4.photophoto.cn/29/261/29261304_1.jpg
- `images/jd/women/jd-women-06.jpg` | untitled | https://photo.16pic.com/00/54/01/16pic_5401377_b.jpg
- `images/jd/women/jd-women-07.webp` | untitled | https://gd-hbimg.huaban.com/273e2d8d7d500ed7e210d8bd30ee61b7ec20c8a71ffd2-1zCIWQ_fw658webp
- `images/jd/women/jd-women-08.jpg` | untitled | https://pic.ibaotu.com/00/02/17/26K888piCUdf.jpg-0.jpg!ww7002
- `images/jd/women/jd-women-09.jpg` | untitled | https://photo.16pic.com/00/80/55/16pic_8055197_b.jpg
- `images/jd/women/jd-women-10.jpg` | untitled | https://gd-filems.dancf.com/gaoding/gaoding/37442/a7994198-d43a-4a41-8f14-115bd43851a95569.jpg
