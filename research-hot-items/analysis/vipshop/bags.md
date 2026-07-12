# 唯品会 / 箱包 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 折扣场景强，主图偏商品清楚、主体居中、白底或浅色背景，活动图容易出现价格和促销文案。
- Category pattern: 箱包需要清楚展示包型、五金、容量感、肩带/手柄结构；可用手持、肩背或产品静物两条路线。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时保留清晰商品轮廓、完整款式、克制浅背景，禁止价格、折扣、强促销字和第三方水印。
- Category direction: 增加正面+侧面角度、五金微光、皮革/织物纹理、包型挺括度；模特图要保证包不被手臂遮挡。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/vipshop/bags/vipshop-bags-01.jpg` | untitled | https://pic.ibaotu.com/00/37/31/594888piCIMT.jpg-0.jpg!ww7002v3
- `images/vipshop/bags/vipshop-bags-02.jpg` | untitled | https://pic.nximg.cn/file/20180717/15097685_131743390083_2.jpg
- `images/vipshop/bags/vipshop-bags-03.jpg` | untitled | https://preview.qiantucdn.com/auto_machine/20241106/4192f327-a5b2-4165-8863-a789f399ee52.jpg!w1024_new_small_1
- `images/vipshop/bags/vipshop-bags-04.jpg` | untitled | https://pic45.photophoto.cn/20171123/0018090782285296_b.jpg
- `images/vipshop/bags/vipshop-bags-05.jpg` | untitled | https://pic.ibaotu.com/00/37/31/594888piCIMT.jpg-1.jpg!ww7002
- `images/vipshop/bags/vipshop-bags-06.jpg` | untitled | https://pic.ibaotu.com/00/37/31/594888piCIMT.jpg-2.jpg!ww7002v3
- `images/vipshop/bags/vipshop-bags-07.webp` | untitled | https://gd-hbimg.huaban.com/7aa8bdd0a3cf1ce30ae1eb54f67678b23b838993c432-tdUaXT_fw658webp
- `images/vipshop/bags/vipshop-bags-08.jpg` | untitled | https://pic6.sucaisucai.com/04/19/04419086_2.jpg
- `images/vipshop/bags/vipshop-bags-09.jpg` | untitled | https://imgpp.ztupic.com/bup/so/20220114/c8d6ba502d9e0ab89478962ed71fa5a5-1.jpg?x-oss-process=image/resize,w_290/crop,h_435/quality,q_85/sharpen,100
- `images/vipshop/bags/vipshop-bags-10.jpg` | untitled | https://pic8.sucaisucai.com/14/71/14171248_2.jpg
