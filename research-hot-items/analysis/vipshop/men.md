# 唯品会 / 男装 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 折扣场景强，主图偏商品清楚、主体居中、白底或浅色背景，活动图容易出现价格和促销文案。
- Category pattern: 更依赖干净背景、直立姿态、通勤/户外/潮流三类场景切换，服装廓形和肩线要清楚。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时保留清晰商品轮廓、完整款式、克制浅背景，禁止价格、折扣、强促销字和第三方水印。
- Category direction: 增加利落站姿、走路、整理袖口、手插口袋等动作；强调肩线、裤长、外套开合和层次搭配。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/vipshop/men/vipshop-men-01.jpg` | untitled | https://preview.qiantucdn.com/auto_machine/20230812/6acd472e-1b9b-4c43-944b-d12d5af4925d.jpg!w1024_new_small_1
- `images/vipshop/men/vipshop-men-02.webp` | untitled | https://gd-hbimg.huaban.com/8fbb5edab80a24bef16d50f1cf7ae24368d9595e13cf2-Tc499o_fw658
- `images/vipshop/men/vipshop-men-03.webp` | untitled | https://gd-hbimg.huaban.com/6ce0e75372cb3daaa0266f82a89942c06eb15b984d3ba-DQvXcu_fw658webp
- `images/vipshop/men/vipshop-men-04.jpg` | untitled | https://img.88tph.com/tphc.1/ec/1b/7BukMFrcEemFqwARMiynhQ.jpg
- `images/vipshop/men/vipshop-men-05.jpg` | untitled | https://pic.nximg.cn/file/20141223/14781915_154416949000_2.jpg
- `images/vipshop/men/vipshop-men-06.jpg` | untitled | https://preview.qiantucdn.com/auto_machine/20230811/3772e8f0-9108-4b61-a4da-dc36011b452b.jpg!w1024_new_small_1
- `images/vipshop/men/vipshop-men-07.jpg` | untitled | https://pic9.sucaisucai.com/13/24/13024319_2.jpg
- `images/vipshop/men/vipshop-men-08.jpg` | untitled | https://pic.nximg.cn/file/20151226/17532527_084312131000_2.jpg
- `images/vipshop/men/vipshop-men-09.webp` | untitled | https://gd-hbimg.huaban.com/40d6f7daece7a8dde4d80cf20ce3be8cc0581b5c11daf-ULw1NX_fw658
- `images/vipshop/men/vipshop-men-10.jpg` | untitled | https://img.88tph.com/tphc.1/34/3a/NDrPIFrPEemFqwARMiynhQ.jpg
