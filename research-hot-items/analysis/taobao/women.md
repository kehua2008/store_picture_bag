# 淘宝 / 女装 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 搜索主图强调第一眼识别和点击欲，常见彩色背景、模特半身或全身、卖点区块和高主体占比。
- Category pattern: 模特穿着图最能表达版型、衣长、肩腰比例和风格；半身图适合上衣，三分之二或全身图适合裙装/外套。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时提取高主体占比、明快背景、清楚版型，避免老式牛皮癣文字、边框拼图和价格角标。
- Category direction: 增加风格化但不喧宾夺主的姿态：轻微转身、自然走步、手扶衣襟、侧身展示腰线；强调面料垂坠和轮廓。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/taobao/women/taobao-women-01.jpg` | untitled | https://pic.nximg.cn/file/20181126/21497072_131039187000_2.jpg
- `images/taobao/women/taobao-women-02.jpg` | untitled | https://pic.nximg.cn/file/20181126/21497072_131121250000_2.jpg
- `images/taobao/women/taobao-women-03.webp` | untitled | https://gd-hbimg.huaban.com/510aefb02fd2e8c7c4e7bd25c695c74f0d8a0d2e15d6c-5sKT59_fw658
- `images/taobao/women/taobao-women-04.jpg` | untitled | https://pic.nximg.cn/file/20141119/19747880_203446158778_2.jpg
- `images/taobao/women/taobao-women-05.jpg` | untitled | https://pic7.sucaisucai.com/04/63/04263577_2.jpg
- `images/taobao/women/taobao-women-06.png` | untitled | https://preview.qiantucdn.com/58pic/70/82/09/51c58PICwKIJzKinCTqq6_PIC2018.png!w1024_new_0_1
- `images/taobao/women/taobao-women-07.jpg` | untitled | https://pic.nximg.cn/file/20181126/21497072_131551795000_2.jpg
- `images/taobao/women/taobao-women-08.jpg` | untitled | https://pic.nximg.cn/file/20181107/21497072_142325738000_2.jpg
- `images/taobao/women/taobao-women-09.jpg` | untitled | https://pic.nximg.cn/file/20190319/24304480_191930189087_2.jpg
- `images/taobao/women/taobao-women-10.jpg` | untitled | https://pic.nximg.cn/file/20181107/21497072_142005256000_2.jpg
