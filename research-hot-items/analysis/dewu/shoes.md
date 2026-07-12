# 得物 / 鞋靴 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 更偏潮流质感、单品细节、干净背景、低杂讯构图，鞋靴和箱包样本更有参考价值。
- Category pattern: 鞋靴爆款图常见大主体、三分之二侧角、鞋面/鞋底/鞋跟细节，运动鞋可用动态地面或户外场景。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时强调潮流质感、材质可信、干净背景、低饱和高级色和细节特写。
- Category direction: 增加 3/4 side view、低机位、鞋面材质、鞋底纹理、后跟支撑和真实阴影；白底图保持边缘干净。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/dewu/shoes/dewu-shoes-01.jpg` | untitled | https://preview.qiantucdn.com/auto_machine/20230324/cb1f0028-c345-47bb-b671-af828815556e.jpg!w1024_new_small_1
- `images/dewu/shoes/dewu-shoes-02.jpg` | untitled | https://img.redocn.com/sheji/20170424/xiezibaokuanshangpinzhitongchecuxiaozhutu_8139388.jpg
- `images/dewu/shoes/dewu-shoes-03.webp` | untitled | https://gd-hbimg.huaban.com/22cbfbd0b6547f330aec7df43f65c1c031cab96e3163e-AHrC1W_fw658webp
- `images/dewu/shoes/dewu-shoes-04.jpg` | untitled | https://pic1.zhimg.com/v2-bd4f961926df4698cf5153b8b0519114_r.jpg
- `images/dewu/shoes/dewu-shoes-05.webp` | untitled | https://img.alicdn.com/imgextra/i3/2208122869050/O1CN0134IJ432GixQN6Nfqz-2208122869050.jpg
- `images/dewu/shoes/dewu-shoes-06.webp` | untitled | https://gd-hbimg.huaban.com/41311890b02e7e064e816453e06ecb44d1703f80152bf-Hy1AIk_fw658
- `images/dewu/shoes/dewu-shoes-07.jpg` | untitled | https://pic4.zhimg.com/v2-6fde62b1303c515723c41a1366ca585b_r.jpg
- `images/dewu/shoes/dewu-shoes-08.jpg` | untitled | https://pic4.zhimg.com/v2-0466d14b7ee99e23e3f425124701fddf_r.jpg
- `images/dewu/shoes/dewu-shoes-09.jpg` | untitled | https://pic2.zhimg.com/v2-bbb4773b74ade3ee1f5a7b9115153f05_r.jpg
- `images/dewu/shoes/dewu-shoes-10.png` | untitled | https://img.shetu66.com/2024/02/15/170797841678249530.png?x-oss-process=image/resize,h_800/watermark,image_d2F0ZXJtYXJrL2JhY2tncm91cDAxLnBuZw==,g_se,x_0,y_10/watermark,text_6K6-5Zu-572RIOe8luWPtzo2NDU2MzA5NjE5OTU4ODE2NTM=,type_ZmFuZ3poZW5naGVpdGk,color_FFFFFF,size_12,g_se,x_15,y_16
