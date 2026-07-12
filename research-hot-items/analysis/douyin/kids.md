# 抖音 / 童装 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 更容易出现封面式构图、强对比色、动态姿态、竖版冲击力和生活化场景。
- Category pattern: 明亮背景、自然童趣、完整穿着效果和舒适感更重要；避免成人化姿态和过度成熟妆造。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时保留竖版冲击力、动态姿态和场景氛围，但仍要求商品是视觉主体，禁止二维码和直播间贴片。
- Category direction: 增加儿童自然动作：站立、轻走、转身、抱玩具但不遮挡服装；强调柔软、舒适、活泼和尺码比例自然。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/douyin/kids/douyin-kids-01.png` | untitled | https://sochao.com/zb_users/upload/2025/09/20250925194010175880041041487.png
- `images/douyin/kids/douyin-kids-02.jpg` | untitled | https://picb8.photophoto.cn/28/938/28938528_1.jpg
- `images/douyin/kids/douyin-kids-03.png` | untitled | https://sochao.com/zb_users/upload/2025/09/20250925194011175880041128024.png
- `images/douyin/kids/douyin-kids-04.jpg` | untitled | https://photo.16pic.com/00/77/21/16pic_7721808_b.jpg
- `images/douyin/kids/douyin-kids-05.jpg` | untitled | http://images.myguancha.com/default/20230608/2ccb19d1b8a257faeb598ef402f1d071.jpg!watermark
- `images/douyin/kids/douyin-kids-06.jpg` | untitled | https://photo.16pic.com/00/89/38/16pic_8938845_b.jpg
- `images/douyin/kids/douyin-kids-07.png` | untitled | https://imgpp.ztupic.com/upload/deal1707973315055_ffa411f8.png?x-oss-process=image/resize,w_290/crop,h_435/quality,q_85/sharpen,100
- `images/douyin/kids/douyin-kids-08.jpg` | untitled | http://www.88hgz.com/upload/attached/image/20190704/20190704153628_9521.jpg
- `images/douyin/kids/douyin-kids-09.jpg` | untitled | https://gd-filems.dancf.com/gaoding/gaoding/16670/bc711b99-1ac8-4bf9-98bf-5f4b0942b3bb81789.jpg
- `images/douyin/kids/douyin-kids-10.png` | untitled | http://images.myguancha.com/default/20230608/4941409f267cd37455dc75d5cdffaf43.png!watermark
