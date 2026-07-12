# 抖音 / 鞋靴 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 更容易出现封面式构图、强对比色、动态姿态、竖版冲击力和生活化场景。
- Category pattern: 鞋靴爆款图常见大主体、三分之二侧角、鞋面/鞋底/鞋跟细节，运动鞋可用动态地面或户外场景。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时保留竖版冲击力、动态姿态和场景氛围，但仍要求商品是视觉主体，禁止二维码和直播间贴片。
- Category direction: 增加 3/4 side view、低机位、鞋面材质、鞋底纹理、后跟支撑和真实阴影；白底图保持边缘干净。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/douyin/shoes/douyin-shoes-01.webp` | untitled | https://pic3.zhimg.com/80/v2-f7342711483bb5fc2f3eb04ecbe03e4e_720w.webp
- `images/douyin/shoes/douyin-shoes-02.jpg` | untitled | https://pica.zhimg.com/v2-015a03e1e20214556ff94f59848b7580_r.jpg
- `images/douyin/shoes/douyin-shoes-03.jpg` | untitled | https://pica.zhimg.com/v2-2c97ae00bbf4b1d740cb2f26d8f368c8_r.jpg
- `images/douyin/shoes/douyin-shoes-04.jpg` | untitled | https://picx.zhimg.com/v2-d8c2f0fae8b8fdeead6d056155c87f84_720w.jpg?source=172ae18b
- `images/douyin/shoes/douyin-shoes-05.jpg` | untitled | https://x0.ifengimg.com/res/2023/DFD5A28B993C53A777FD2F0811686BE0F997BBCB_size95_w628_h1118.jpg
- `images/douyin/shoes/douyin-shoes-06.jpg` | untitled | https://pica.zhimg.com/v2-52a23e0f5dd19aca50162cd6eb8b7024_720w.jpg?source=172ae18b
- `images/douyin/shoes/douyin-shoes-07.png` | untitled | https://cdn-static.chanmama.com/uploads/20230707/12cdf84636576c85918084b627ad75a7.png
- `images/douyin/shoes/douyin-shoes-08.png` | untitled | https://public.fxbaogao.com/report-image/2023/07/15/3847347-1.png?x-oss-process=image/crop
- `images/douyin/shoes/douyin-shoes-09.jpg` | untitled | https://preview.qiantucdn.com/auto_machine/20231027/4b2c39e3-2e9f-4c04-8cb1-63a8ad15e8d4.jpg!w1024_new_small_1
- `images/douyin/shoes/douyin-shoes-10.webp` | untitled | https://am.zdmimg.com/202312/28/658ce94d84c0f2752.png_e1080.jpg
