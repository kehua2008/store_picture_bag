# 淘宝 / 男装 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 搜索主图强调第一眼识别和点击欲，常见彩色背景、模特半身或全身、卖点区块和高主体占比。
- Category pattern: 更依赖干净背景、直立姿态、通勤/户外/潮流三类场景切换，服装廓形和肩线要清楚。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时提取高主体占比、明快背景、清楚版型，避免老式牛皮癣文字、边框拼图和价格角标。
- Category direction: 增加利落站姿、走路、整理袖口、手插口袋等动作；强调肩线、裤长、外套开合和层次搭配。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/taobao/men/taobao-men-01.jpg` | untitled | https://picb7.photophoto.cn/04/939/04939747_1.jpg
- `images/taobao/men/taobao-men-02.jpg` | untitled | https://pic.nximg.cn/file/20201012/24179748_101618414030_2.jpg
- `images/taobao/men/taobao-men-03.jpg` | untitled | https://picb9.photophoto.cn/01/919/01919579_1.jpg
- `images/taobao/men/taobao-men-04.jpg` | untitled | https://pic.nximg.cn/file/20201012/24179748_101627899032_2.jpg
- `images/taobao/men/taobao-men-05.jpg` | untitled | https://img.redocn.com/sheji/20150819/taobaoqiudongxinpinnanzhuangzhutumoban_4836492.jpg
- `images/taobao/men/taobao-men-06.jpg` | untitled | https://img.redocn.com/sheji/20150723/taobaoqiujinanzhuangzhutumoban_4709934.jpg
- `images/taobao/men/taobao-men-07.jpg` | untitled | https://pic.nximg.cn/file/20201012/24179748_101623157031_2.jpg
- `images/taobao/men/taobao-men-08.jpg` | untitled | https://pic.ibaotu.com/01/30/16/06S888piCeJI.jpg-0.jpg!ww7006
- `images/taobao/men/taobao-men-09.jpg` | untitled | https://pic.ibaotu.com/01/25/89/52Q888piCDS4.jpg-0.jpg!ww7002
- `images/taobao/men/taobao-men-10.jpg` | untitled | https://img.redocn.com/sheji/20150819/taobaoqiudongdapainanzhuangzhutumoban_4836488.jpg
