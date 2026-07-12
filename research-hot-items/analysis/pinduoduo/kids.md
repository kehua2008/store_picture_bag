# 拼多多 / 童装 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 转化导向明显，主体大、颜色亮、价格感强，样本中促销模板和信息密集图较多。
- Category pattern: 明亮背景、自然童趣、完整穿着效果和舒适感更重要；避免成人化姿态和过度成熟妆造。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时只提取主体大、明亮直接、商品清楚的部分，排除价格牌、夸张营销词和杂乱贴片。
- Category direction: 增加儿童自然动作：站立、轻走、转身、抱玩具但不遮挡服装；强调柔软、舒适、活泼和尺码比例自然。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/pinduoduo/kids/pinduoduo-kids-01.jpg` | untitled | https://globalimg.sucai999.com/preimg/DBC456/1000/DBC456/201/ba62c38fa01c9c14fd8214116131ef.jpg?x-oss-process=image
- `images/pinduoduo/kids/pinduoduo-kids-02.png` | untitled | https://imgpp.ztupic.com/upload/deal1747363232024_c26bb4e1.png?x-oss-process=image/resize,w_290/crop,h_435/quality,q_85/sharpen,100
- `images/pinduoduo/kids/pinduoduo-kids-03.webp` | untitled | https://qnam.smzdm.com/202202/18/620f46385adf14705.png_e1080.jpg
- `images/pinduoduo/kids/pinduoduo-kids-04.jpg` | untitled | https://pic2.zhimg.com/50/v2-bd804ea0896e80aba0ca54b441787eca_hd.jpg?source=1940ef5c
- `images/pinduoduo/kids/pinduoduo-kids-05.png` | untitled | https://qnam.smzdm.com/202202/21/62132eb482cdd4564.png_e1080.jpg
- `images/pinduoduo/kids/pinduoduo-kids-06.webp` | untitled | https://qnam.smzdm.com/202202/21/6213283368c613426.png_e1080.jpg
- `images/pinduoduo/kids/pinduoduo-kids-07.png` | untitled | http://wenhui.whb.cn/u/cms/www/202008/24094706ti0v.png
- `images/pinduoduo/kids/pinduoduo-kids-08.webp` | untitled | https://qnam.smzdm.com/202202/18/620f4e463b7523957.png_e1080.jpg
- `images/pinduoduo/kids/pinduoduo-kids-09.png` | untitled | https://imgpp.ztupic.com/upload/deal1747363693241_1927228e.png?x-oss-process=image/resize,w_290/crop,h_435/quality,q_85/sharpen,100
- `images/pinduoduo/kids/pinduoduo-kids-10.png` | untitled | https://qnam.smzdm.com/202202/21/621331659eb3c9348.png_e1080.jpg
