# 淘宝 / 箱包 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 搜索主图强调第一眼识别和点击欲，常见彩色背景、模特半身或全身、卖点区块和高主体占比。
- Category pattern: 箱包需要清楚展示包型、五金、容量感、肩带/手柄结构；可用手持、肩背或产品静物两条路线。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时提取高主体占比、明快背景、清楚版型，避免老式牛皮癣文字、边框拼图和价格角标。
- Category direction: 增加正面+侧面角度、五金微光、皮革/织物纹理、包型挺括度；模特图要保证包不被手臂遮挡。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/taobao/bags/taobao-bags-01.jpg` | untitled | https://pic.nximg.cn/file/20180814/4070314_143546945039_2.jpg
- `images/taobao/bags/taobao-bags-02.jpg` | untitled | https://pic.ibaotu.com/01/92/12/74s888piCXfY.jpg-0.jpg!ww7006
- `images/taobao/bags/taobao-bags-03.jpg` | untitled | https://photo.16pic.com/00/89/38/16pic_8938447_b.jpg
- `images/taobao/bags/taobao-bags-04.jpg` | untitled | https://pic6.sucaisucai.com/07/23/07323186_2.jpg
- `images/taobao/bags/taobao-bags-05.jpg` | untitled | https://pic2.sucaisucai.com/09/37/09837892_2.jpg
- `images/taobao/bags/taobao-bags-06.jpg` | untitled | https://pic47.photophoto.cn/20180424/0018090719875136_b.jpg
- `images/taobao/bags/taobao-bags-07.jpg` | untitled | https://pic.ibaotu.com/00/14/08/888piC1K888piCTku.jpg-0.jpg!ww7002
- `images/taobao/bags/taobao-bags-08.jpg` | untitled | https://pic.nximg.cn/20140801/18846129_140510745000_2.jpg
- `images/taobao/bags/taobao-bags-09.jpg` | untitled | https://pic2.sucaisucai.com/03/78/03478362_2.jpg
- `images/taobao/bags/taobao-bags-10.jpg` | untitled | https://pic48.photophoto.cn/20180906/0018090778829839_b.jpg
