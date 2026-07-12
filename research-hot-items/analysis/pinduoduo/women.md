# 拼多多 / 女装 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 转化导向明显，主体大、颜色亮、价格感强，样本中促销模板和信息密集图较多。
- Category pattern: 模特穿着图最能表达版型、衣长、肩腰比例和风格；半身图适合上衣，三分之二或全身图适合裙装/外套。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时只提取主体大、明亮直接、商品清楚的部分，排除价格牌、夸张营销词和杂乱贴片。
- Category direction: 增加风格化但不喧宾夺主的姿态：轻微转身、自然走步、手扶衣襟、侧身展示腰线；强调面料垂坠和轮廓。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/pinduoduo/women/pinduoduo-women-01.jpg` | untitled | https://pic2.zhimg.com/v2-1767fefd0b5194ab6af925733e3e23b9_r.jpg
- `images/pinduoduo/women/pinduoduo-women-02.png` | untitled | https://st-gdx.dancf.com/gaodingx/1570/articles/0/20201106-103848-7062.png
- `images/pinduoduo/women/pinduoduo-women-03.jpg` | untitled | https://gd-filems.dancf.com/gaoding/cms/mcm79j/mcm79j/27490/0256f445-5f82-4133-90fe-514b285c1e5a46922.jpg
- `images/pinduoduo/women/pinduoduo-women-04.jpg` | untitled | https://www.laiketui.com/wp-content/uploads/2022/09/1.jpeg
- `images/pinduoduo/women/pinduoduo-women-05.jpg` | untitled | https://gd-filems.dancf.com/gaoding/cms/mcm79j/mcm79j/53357/f65a676c-075c-4632-aa4f-3ff7414f22bb1785720.jpg
- `images/pinduoduo/women/pinduoduo-women-06.jpg` | untitled | https://pic1.zhimg.com/v2-21ce6d4eea8e0413126bca9f98d22a10_r.jpg
- `images/pinduoduo/women/pinduoduo-women-07.jpg` | untitled | https://xiuxiu-pro.meitudata.com/posters/1381662cee7e2329ac0d886f8f3339a7.jpg
- `images/pinduoduo/women/pinduoduo-women-08.jpg` | untitled | https://gd-filems.dancf.com/gaoding/cms/mcm79j/mcm79j/27490/55be389d-3c8f-42b3-a30e-6ca97db810e0445823.jpg
- `images/pinduoduo/women/pinduoduo-women-09.png` | untitled | https://n.sinaimg.cn/spider20201113/345/w550h595/20201113/7e44-kcunqze7057240.png
- `images/pinduoduo/women/pinduoduo-women-10.jpg` | untitled | https://bpic.588ku.com/templet_pic/21/08/05/4389484994670b71b287ece8e5a999f8.jpg!/fw/750/quality/90/unsharp/true/compress/true
