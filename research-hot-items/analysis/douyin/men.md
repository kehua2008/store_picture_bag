# 抖音 / 男装 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 更容易出现封面式构图、强对比色、动态姿态、竖版冲击力和生活化场景。
- Category pattern: 更依赖干净背景、直立姿态、通勤/户外/潮流三类场景切换，服装廓形和肩线要清楚。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时保留竖版冲击力、动态姿态和场景氛围，但仍要求商品是视觉主体，禁止二维码和直播间贴片。
- Category direction: 增加利落站姿、走路、整理袖口、手插口袋等动作；强调肩线、裤长、外套开合和层次搭配。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/douyin/men/douyin-men-01.jpg` | untitled | https://socialbeta.oss-cn-hangzhou.aliyuncs.com/upload/198728-1726199064.jpg
- `images/douyin/men/douyin-men-02.jpg` | untitled | https://socialbeta.oss-cn-hangzhou.aliyuncs.com/upload/204546-1695699508.jpg
- `images/douyin/men/douyin-men-03.jpg` | untitled | https://socialbeta.oss-cn-hangzhou.aliyuncs.com/upload/198728-1726198791.jpg
- `images/douyin/men/douyin-men-04.jpg` | untitled | https://gd-filems.dancf.com/gaoding/gaoding/21500/826f06e4-10a2-4bd9-bfa5-d164e33f63c6262420.jpg
- `images/douyin/men/douyin-men-05.jpg` | untitled | http://www.cctime.com/upLoadFile/2024/11/8/20241189256580.jpg
- `images/douyin/men/douyin-men-06.jpg` | untitled | https://i-blog.csdnimg.cn/img_convert/7327f2a274276116d30e469deb14d8af.jpeg
- `images/douyin/men/douyin-men-07.jpg` | untitled | https://socialbeta.oss-cn-hangzhou.aliyuncs.com/upload/204546-1695699514.jpg
- `images/douyin/men/douyin-men-08.jpg` | untitled | https://n.sinaimg.cn/spider20241108/373/w800h1173/20241108/d04b-79f2b1ad8afb1400882bcd5040ec405c.jpg
- `images/douyin/men/douyin-men-09.webp` | untitled | https://gd-hbimg.huaban.com/6569ba29e382087eb28d4608fcb00c612f4fb8e316b17-CQV4AX_fw658webp
- `images/douyin/men/douyin-men-10.jpg` | untitled | https://socialbeta.oss-cn-hangzhou.aliyuncs.com/upload/198728-1726198761.jpg
