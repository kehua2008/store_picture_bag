# 淘宝 / 童装 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 搜索主图强调第一眼识别和点击欲，常见彩色背景、模特半身或全身、卖点区块和高主体占比。
- Category pattern: 明亮背景、自然童趣、完整穿着效果和舒适感更重要；避免成人化姿态和过度成熟妆造。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时提取高主体占比、明快背景、清楚版型，避免老式牛皮癣文字、边框拼图和价格角标。
- Category direction: 增加儿童自然动作：站立、轻走、转身、抱玩具但不遮挡服装；强调柔软、舒适、活泼和尺码比例自然。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/taobao/kids/taobao-kids-01.jpg` | untitled | https://picb5.photophoto.cn/18/919/18919715_1.jpg
- `images/taobao/kids/taobao-kids-02.jpg` | untitled | https://pic.ntimg.cn/file/20190719/26073257_162242990001_2.jpg
- `images/taobao/kids/taobao-kids-03.jpg` | untitled | https://photo.16pic.com/00/90/21/16pic_9021802_b.jpg
- `images/taobao/kids/taobao-kids-04.jpg` | untitled | https://pic.ibaotu.com/00/26/68/4888piCS888piCXnb.jpg-1.jpg!ww7002
- `images/taobao/kids/taobao-kids-05.jpg` | untitled | https://pic.nximg.cn/file/20150320/1515468_144002129000_2.jpg
- `images/taobao/kids/taobao-kids-06.jpg` | untitled | https://pic.nximg.cn/file/20150320/1515468_143638502000_2.jpg
- `images/taobao/kids/taobao-kids-07.png` | untitled | https://img.shetu66.com/2024/07/09/172050979071682632.png
- `images/taobao/kids/taobao-kids-08.jpg` | untitled | https://picb4.photophoto.cn/01/733/01733104_1.jpg
- `images/taobao/kids/taobao-kids-09.jpg` | untitled | https://picb0.photophoto.cn/25/054/25054680_1.jpg
- `images/taobao/kids/taobao-kids-10.jpg` | untitled | https://pic.ntimg.cn/file/20200412/12286942_095155659000_2.jpg
