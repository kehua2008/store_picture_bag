# 得物 / 男装 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 更偏潮流质感、单品细节、干净背景、低杂讯构图，鞋靴和箱包样本更有参考价值。
- Category pattern: 更依赖干净背景、直立姿态、通勤/户外/潮流三类场景切换，服装廓形和肩线要清楚。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时强调潮流质感、材质可信、干净背景、低饱和高级色和细节特写。
- Category direction: 增加利落站姿、走路、整理袖口、手插口袋等动作；强调肩线、裤长、外套开合和层次搭配。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/dewu/men/dewu-men-01.png` | untitled | https://img.tuguaishou.com/ips_templ_preview/d6/f5/f4/lg_3138800_1591406123_5edaee2b04b7a.jpg!w1024_w?auth_key=1897344000-0-0-6745312663886ba3b30990b0c347de53
- `images/dewu/men/dewu-men-02.jpg` | untitled | https://preview.qiantucdn.com/desgin_photo/40067/7867_detail.jpg!w1024_new_0_1
- `images/dewu/men/dewu-men-03.jpg` | untitled | https://pic2.sucaisucai.com/07/40/07340102_2.jpg
- `images/dewu/men/dewu-men-04.jpg` | untitled | https://pic8.sucaisucai.com/06/62/06762068_2.jpg
- `images/dewu/men/dewu-men-05.webp` | untitled | https://img.alicdn.com/imgextra/https://img.alicdn.com/imgextra/i1/92688455/O1CN012cAuGk2CKRSA5yxGD_!!92688455.jpg
- `images/dewu/men/dewu-men-06.jpg` | untitled | https://imgs.design006.com/202307/Design006_TFnc4xjFZz.jpg?x-oss-process=style/prev_w_460_mh_1600
- `images/dewu/men/dewu-men-07.jpg` | untitled | https://picb1.photophoto.cn/28/938/28938841_1.jpg
- `images/dewu/men/dewu-men-08.webp` | untitled | https://gd-hbimg.huaban.com/4f77aee6c9ca18bbf64ca2339ed80ecd452262f32d9e3-oKR5cf_fw658
- `images/dewu/men/dewu-men-09.webp` | untitled | https://img.alicdn.com/imgextra/i1/4004811045/O1CN01HUXoF51JaeXh9V8l0_!!4004811045.jpg
- `images/dewu/men/dewu-men-10.png` | untitled | https://img.tuguaishou.com/moive_preview/frame_preview/0_/03/c1/0_03c1a2538cf9630444174be8b3df58ff_7a520050a4cecc379618d30db4bf75b4_149.png!w1024_w?auth_key=1897344000-0-0-8c6f24c3398b85cabc2a93cd0dea6050
