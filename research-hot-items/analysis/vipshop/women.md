# 唯品会 / 女装 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 折扣场景强，主图偏商品清楚、主体居中、白底或浅色背景，活动图容易出现价格和促销文案。
- Category pattern: 模特穿着图最能表达版型、衣长、肩腰比例和风格；半身图适合上衣，三分之二或全身图适合裙装/外套。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时保留清晰商品轮廓、完整款式、克制浅背景，禁止价格、折扣、强促销字和第三方水印。
- Category direction: 增加风格化但不喧宾夺主的姿态：轻微转身、自然走步、手扶衣襟、侧身展示腰线；强调面料垂坠和轮廓。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/vipshop/women/vipshop-women-01.jpg` | untitled | https://photo.16pic.com/00/77/19/16pic_7719346_b.jpg
- `images/vipshop/women/vipshop-women-02.jpg` | untitled | https://img.redocn.com/sheji/20140918/taobaobaokuannvzhuangzhutusucai_3100557.jpg
- `images/vipshop/women/vipshop-women-03.jpg` | untitled | https://photo.16pic.com/00/81/45/16pic_8145761_b.jpg
- `images/vipshop/women/vipshop-women-04.jpg` | untitled | https://img.88tph.com/tphc.1/production/20180622/12579445.jpg
- `images/vipshop/women/vipshop-women-05.jpg` | untitled | https://pic.ibaotu.com/01/32/53/77i888piCdxn.jpg-0.jpg!ww7002
- `images/vipshop/women/vipshop-women-06.jpg` | untitled | https://picb8.photophoto.cn/26/910/26910248_1.jpg
- `images/vipshop/women/vipshop-women-07.webp` | untitled | https://gd-hbimg.huaban.com/510aefb02fd2e8c7c4e7bd25c695c74f0d8a0d2e15d6c-5sKT59_fw658webp
- `images/vipshop/women/vipshop-women-08.jpg` | untitled | https://preview.qiantucdn.com/auto_machine/20230811/cdfa577b-6318-4455-beb5-279ec2a588d8.jpg!w1024_new_small_1
- `images/vipshop/women/vipshop-women-09.jpg` | untitled | https://photo.16pic.com/00/53/87/16pic_5387543_b.jpg
- `images/vipshop/women/vipshop-women-10.jpg` | untitled | https://pic.nximg.cn/file/20230616/34569057_203349521122_2.jpg
