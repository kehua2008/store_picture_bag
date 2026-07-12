# 京东 / 男装 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 更偏可信、标准和品控感，白底/浅灰棚拍、完整商品、材质细节和干净构图更适合平台调性。
- Category pattern: 更依赖干净背景、直立姿态、通勤/户外/潮流三类场景切换，服装廓形和肩线要清楚。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时强化稳定棚拍、可信光线、材质清晰和标准商品角度，减少夸张场景和强滤镜。
- Category direction: 增加利落站姿、走路、整理袖口、手插口袋等动作；强调肩线、裤长、外套开合和层次搭配。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/jd/men/jd-men-01.jpg` | untitled | https://photo.16pic.com/00/93/97/16pic_9397021_b.jpg
- `images/jd/men/jd-men-02.jpg` | untitled | https://m.360buyimg.com/babel/jfs/t1/220355/28/30192/71761/6471ba99Fbc25ce70/67020238462379fe.jpg
- `images/jd/men/jd-men-03.jpg` | untitled | https://img.redocn.com/sheji/20150413/taobaotianmaojingdongnanzhuangTxuzhitongche_4124186.jpg
- `images/jd/men/jd-men-04.webp` | untitled | https://gd-hbimg.huaban.com/6ce0e75372cb3daaa0266f82a89942c06eb15b984d3ba-DQvXcu_fw658
- `images/jd/men/jd-men-05.png` | untitled | https://img1.mydrivers.com/img/20220927/dfe116e2-b898-44d6-ad66-ed56bfbb5652.png
- `images/jd/men/jd-men-06.webp` | untitled | https://y.zdmimg.com/202211/09/636b6d8a41f4372.jpg_e600.jpg
- `images/jd/men/jd-men-07.jpg` | untitled | https://img.redocn.com/sheji/20150925/taobaotianmaojingdongnanzhuangcuxiaohaibao_5024232.jpg
- `images/jd/men/jd-men-08.jpg` | untitled | https://m.360buyimg.com/babel/jfs/t1/110604/39/42725/73999/64b2b700Fe74a003a/29d35a9fad4668fc.jpg
- `images/jd/men/jd-men-09.jpg` | untitled | https://photo.16pic.com/00/93/97/16pic_9397022_b.jpg
- `images/jd/men/jd-men-10.webp` | untitled | https://y.zdmimg.com/202305/30/6475ab576f26b2954.jpg_d250.jpg
