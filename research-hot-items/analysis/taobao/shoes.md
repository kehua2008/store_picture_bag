# 淘宝 / 鞋靴 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 搜索主图强调第一眼识别和点击欲，常见彩色背景、模特半身或全身、卖点区块和高主体占比。
- Category pattern: 鞋靴爆款图常见大主体、三分之二侧角、鞋面/鞋底/鞋跟细节，运动鞋可用动态地面或户外场景。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时提取高主体占比、明快背景、清楚版型，避免老式牛皮癣文字、边框拼图和价格角标。
- Category direction: 增加 3/4 side view、低机位、鞋面材质、鞋底纹理、后跟支撑和真实阴影；白底图保持边缘干净。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/taobao/shoes/taobao-shoes-01.jpg` | untitled | https://img.redocn.com/sheji/20140902/taobaoqiudongbaokuanxiezizhutuzhitongche_3001995.jpg
- `images/taobao/shoes/taobao-shoes-02.jpg` | untitled | https://photo.16pic.com/00/24/74/16pic_2474080_b.jpg
- `images/taobao/shoes/taobao-shoes-03.jpg` | untitled | https://pic3.sucaisucai.com/00/07/00107483_2.jpg
- `images/taobao/shoes/taobao-shoes-04.jpg` | untitled | https://pic6.sucaisucai.com/12/36/12336706_2.jpg
- `images/taobao/shoes/taobao-shoes-05.jpg` | untitled | https://pic.ntimg.cn/file/20190523/7121777_210510754087_2.jpg
- `images/taobao/shoes/taobao-shoes-06.jpg` | untitled | https://pic.nximg.cn/file/20161031/20980339_190743175031_2.jpg
- `images/taobao/shoes/taobao-shoes-07.jpg` | untitled | https://photo.16pic.com/00/79/53/16pic_7953357_b.jpg
- `images/taobao/shoes/taobao-shoes-08.jpg` | untitled | https://pic.nximg.cn/file/20241016/23377731_122910670122_2.jpg
- `images/taobao/shoes/taobao-shoes-09.jpg` | untitled | https://pic.ntimg.cn/file/20150419/18048135_230856960000_2.jpg
- `images/taobao/shoes/taobao-shoes-10.jpg` | untitled | https://pic.ibaotu.com/00/96/90/87M888piCAqI.jpg-0.jpg!ww7006
