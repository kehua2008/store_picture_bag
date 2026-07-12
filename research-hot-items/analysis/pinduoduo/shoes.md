# 拼多多 / 鞋靴 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 转化导向明显，主体大、颜色亮、价格感强，样本中促销模板和信息密集图较多。
- Category pattern: 鞋靴爆款图常见大主体、三分之二侧角、鞋面/鞋底/鞋跟细节，运动鞋可用动态地面或户外场景。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时只提取主体大、明亮直接、商品清楚的部分，排除价格牌、夸张营销词和杂乱贴片。
- Category direction: 增加 3/4 side view、低机位、鞋面材质、鞋底纹理、后跟支撑和真实阴影；白底图保持边缘干净。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/pinduoduo/shoes/pinduoduo-shoes-01.jpg` | untitled | https://pic4.zhimg.com/v2-859b48d57acc9e250e392e173ed783db_r.jpg
- `images/pinduoduo/shoes/pinduoduo-shoes-02.webp` | untitled | https://y.zdmimg.com/202404/17/661f38e699f6e4573.png_e600.jpg
- `images/pinduoduo/shoes/pinduoduo-shoes-03.jpg` | untitled | https://picb5.photophoto.cn/03/868/03868085_1.jpg
- `images/pinduoduo/shoes/pinduoduo-shoes-04.jpg` | untitled | https://picx.zhimg.com/v2-bc5e4eaa8f8232025f038a3facfb278d_r.jpg?source=1def8aca
- `images/pinduoduo/shoes/pinduoduo-shoes-05.jpg` | untitled | https://img.redocn.com/shejigao/20140604/20140603_7da3bac002d7575139aeARuN7TGTYMY4.jpg
- `images/pinduoduo/shoes/pinduoduo-shoes-06.jpg` | untitled | https://pic.ntimg.cn/file/20181209/10395187_095407216000_2.jpg
- `images/pinduoduo/shoes/pinduoduo-shoes-07.webp` | untitled | https://y.zdmimg.com/202408/22/66c6f05f756174833.png_e600.jpg
- `images/pinduoduo/shoes/pinduoduo-shoes-08.jpg` | untitled | https://pic.nximg.cn/file/20210312/27763593_110155764089_2.jpg
- `images/pinduoduo/shoes/pinduoduo-shoes-09.jpg` | untitled | https://pic.nximg.cn/file/20211028/21706564_115504703103_2.jpg
- `images/pinduoduo/shoes/pinduoduo-shoes-10.jpg` | untitled | https://pic.nximg.cn/file/20210311/27763593_115828033229_2.jpg
