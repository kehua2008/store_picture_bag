# 拼多多 / 男装 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 转化导向明显，主体大、颜色亮、价格感强，样本中促销模板和信息密集图较多。
- Category pattern: 更依赖干净背景、直立姿态、通勤/户外/潮流三类场景切换，服装廓形和肩线要清楚。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时只提取主体大、明亮直接、商品清楚的部分，排除价格牌、夸张营销词和杂乱贴片。
- Category direction: 增加利落站姿、走路、整理袖口、手插口袋等动作；强调肩线、裤长、外套开合和层次搭配。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/pinduoduo/men/pinduoduo-men-01.jpg` | untitled | https://pic1.zhimg.com/v2-ef920a7db717afdcbd31098f18bff9ae_r.jpg?source=1def8aca
- `images/pinduoduo/men/pinduoduo-men-02.jpg` | untitled | https://picx.zhimg.com/50/v2-3f59e0e68d3e258fdc8cd5559d95b81d_720w.jpg?source=1def8aca
- `images/pinduoduo/men/pinduoduo-men-03.jpg` | untitled | https://picx.zhimg.com/v2-c4dc4550cc291087ff9ec834d46d7823_r.jpg?source=1def8aca
- `images/pinduoduo/men/pinduoduo-men-04.png` | untitled | https://imgpp.ztupic.com/upload/deal1747205216882_e886566d.png?x-oss-process=image/resize,w_290/crop,h_435/quality,q_85/sharpen,100
- `images/pinduoduo/men/pinduoduo-men-05.jpg` | untitled | https://picx.zhimg.com/v2-a2fda37d030510849ae37039a3cb1e25_r.jpg?source=1def8aca
- `images/pinduoduo/men/pinduoduo-men-06.jpg` | untitled | https://pica.zhimg.com/v2-7dd2a6baa51e6147aa06089004170637_r.jpg?source=1940ef5c
- `images/pinduoduo/men/pinduoduo-men-07.jpg` | untitled | https://pic.nximg.cn/file/20231120/26515297_095332056100_2.jpg
- `images/pinduoduo/men/pinduoduo-men-08.webp` | untitled | https://y.zdmimg.com/202407/08/668b506661f417786.png_e600.jpg
- `images/pinduoduo/men/pinduoduo-men-09.jpg` | untitled | https://pic1.zhimg.com/50/v2-5f522d70d89de72bef8ead3c56481d52_720w.jpg?source=1940ef5c
- `images/pinduoduo/men/pinduoduo-men-10.jpg` | untitled | https://picx.zhimg.com/v2-ac7f85c40595174534a1e5c0adef813e_r.jpg?source=1def8aca
