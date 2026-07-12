# 抖音 / 女装 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 更容易出现封面式构图、强对比色、动态姿态、竖版冲击力和生活化场景。
- Category pattern: 模特穿着图最能表达版型、衣长、肩腰比例和风格；半身图适合上衣，三分之二或全身图适合裙装/外套。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时保留竖版冲击力、动态姿态和场景氛围，但仍要求商品是视觉主体，禁止二维码和直播间贴片。
- Category direction: 增加风格化但不喧宾夺主的姿态：轻微转身、自然走步、手扶衣襟、侧身展示腰线；强调面料垂坠和轮廓。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/douyin/women/douyin-women-01.png` | untitled | https://img.tuguaishou.com/ips_templ_preview/6e/f0/74/lg_3344158_1600433081_5f64abb90eb3b.jpg!w1024_w?auth_key=1897344000-0-0-107ab353d6755eaf8e26f3ab99dc2add
- `images/douyin/women/douyin-women-02.jpg` | untitled | https://pic.nximg.cn/file/20181126/21497072_131222004000_2.jpg
- `images/douyin/women/douyin-women-03.jpg` | untitled | https://pic3.zhimg.com/v2-d3cb5c950e5ceb2d8de32c1b30b172e8_r.jpg
- `images/douyin/women/douyin-women-04.jpg` | untitled | https://preview.qiantucdn.com/58pic/35/76/83/83u58PICi3H98iCe8EfU6_PIC2018.jpg!w1024_new_small_1
- `images/douyin/women/douyin-women-05.webp` | untitled | https://img.alicdn.com/imgextra/i4/2201209716054/O1CN01H93ejd1uamornBjVv_!!2201209716054.jpg
- `images/douyin/women/douyin-women-06.webp` | untitled | https://image.woshipm.com/2025/09/24/06cac294-9947-11f0-8601-00163e4b86a1.jpg
- `images/douyin/women/douyin-women-07.png` | untitled | https://oss-invest-images.cbndata.org/wechat-image-mirror/82c3b2828c66d2f15e7e21f2a7c8cb27
- `images/douyin/women/douyin-women-08.jpg` | untitled | http://das.mobtou.com/ueditor/php/upload/image/20231101/1698818153751108.jpeg
- `images/douyin/women/douyin-women-09.jpg` | untitled | https://marketplace.canva.cn/EAFekVtO_Bc/1/0/800w/canva-l9PJWx4NpUc.jpg
- `images/douyin/women/douyin-women-10.jpg` | untitled | https://marketplace.canva.cn/EAFekaCkr_c/1/0/800w/canva-XgeolS38mUw.jpg
