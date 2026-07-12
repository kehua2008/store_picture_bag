# 京东 / 童装 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 更偏可信、标准和品控感，白底/浅灰棚拍、完整商品、材质细节和干净构图更适合平台调性。
- Category pattern: 明亮背景、自然童趣、完整穿着效果和舒适感更重要；避免成人化姿态和过度成熟妆造。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时强化稳定棚拍、可信光线、材质清晰和标准商品角度，减少夸张场景和强滤镜。
- Category direction: 增加儿童自然动作：站立、轻走、转身、抱玩具但不遮挡服装；强调柔软、舒适、活泼和尺码比例自然。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/jd/kids/jd-kids-01.png` | untitled | https://upload.qudong.com/2023/0329/1680076264754.png
- `images/jd/kids/jd-kids-02.png` | untitled | https://x0.ifengimg.com/res/2023/7B44D082B86B07EAEC9AA7E0F2CAB2ECCE45BAC1_size1116_w1242_h565.png
- `images/jd/kids/jd-kids-03.jpg` | untitled | https://pic.nximg.cn/file/20250508/1391920_083351376122_2.jpg
- `images/jd/kids/jd-kids-04.jpg` | untitled | https://pic8.sucaisucai.com/11/77/11377818_2.jpg
- `images/jd/kids/jd-kids-05.jpg` | untitled | https://img.xpwin7.com/2023/0206/202302061675665945607204.jpg
- `images/jd/kids/jd-kids-06.png` | untitled | https://upload.qudong.com/2023/0329/1680076264634.png
- `images/jd/kids/jd-kids-07.webp` | untitled | https://gd-hbimg.huaban.com/f70f0c4d3849c75d3279182b5a483f5a13fa725924ef89-1wqNX2_fw658webp
- `images/jd/kids/jd-kids-08.jpg` | untitled | https://photo.16pic.com/00/89/38/16pic_8938535_b.jpg
- `images/jd/kids/jd-kids-09.png` | untitled | https://imgpp.ztupic.com/upload/deal1747363090604_d62a125a.png?x-oss-process=image/resize,w_290/crop,h_435/quality,q_85/sharpen,100
- `images/jd/kids/jd-kids-10.jpg` | untitled | https://pic.nximg.cn/file/20150320/1515468_143836969000_2.jpg
