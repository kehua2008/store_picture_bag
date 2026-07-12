# 唯品会 / 童装 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 折扣场景强，主图偏商品清楚、主体居中、白底或浅色背景，活动图容易出现价格和促销文案。
- Category pattern: 明亮背景、自然童趣、完整穿着效果和舒适感更重要；避免成人化姿态和过度成熟妆造。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时保留清晰商品轮廓、完整款式、克制浅背景，禁止价格、折扣、强促销字和第三方水印。
- Category direction: 增加儿童自然动作：站立、轻走、转身、抱玩具但不遮挡服装；强调柔软、舒适、活泼和尺码比例自然。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/vipshop/kids/vipshop-kids-01.jpg` | untitled | https://photo.16pic.com/00/89/38/16pic_8938869_b.jpg
- `images/vipshop/kids/vipshop-kids-02.webp` | untitled | https://gd-hbimg.huaban.com/500c3a0aa71805f9875954a5d10c75528fbb65e93a5f0a-J9bLyW_fw658webp
- `images/vipshop/kids/vipshop-kids-03.jpg` | untitled | https://photo.16pic.com/00/89/38/16pic_8938849_b.jpg
- `images/vipshop/kids/vipshop-kids-04.jpg` | untitled | https://pic.ntimg.cn/file/20200412/12286942_110950941000_2.jpg
- `images/vipshop/kids/vipshop-kids-05.jpg` | untitled | https://pic.nximg.cn/file/20250619/24187384_160645547103_2.jpg
- `images/vipshop/kids/vipshop-kids-06.jpg` | untitled | https://photo.16pic.com/00/89/38/16pic_8938837_b.jpg
- `images/vipshop/kids/vipshop-kids-07.jpg` | untitled | https://photo.16pic.com/00/86/76/16pic_8676468_b.jpg
- `images/vipshop/kids/vipshop-kids-08.jpg` | untitled | https://photo.16pic.com/00/89/38/16pic_8938804_b.jpg
- `images/vipshop/kids/vipshop-kids-09.png` | untitled | https://img.tuguaishou.com/ips_templ_preview/1c/f1/37/lg_3364851_1601482221_5f74aded5a2d8.jpg!w1024_w?auth_key=1897344000-0-0-128c78dcd6f60536c5868993573c608d
- `images/vipshop/kids/vipshop-kids-10.jpg` | untitled | https://imgs.design006.com/202404/Design006_zp4eZ4iNmC.jpg?x-oss-process=style/prev_w_750_h_auto
