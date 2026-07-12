# 抖音 / 箱包 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 更容易出现封面式构图、强对比色、动态姿态、竖版冲击力和生活化场景。
- Category pattern: 箱包需要清楚展示包型、五金、容量感、肩带/手柄结构；可用手持、肩背或产品静物两条路线。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时保留竖版冲击力、动态姿态和场景氛围，但仍要求商品是视觉主体，禁止二维码和直播间贴片。
- Category direction: 增加正面+侧面角度、五金微光、皮革/织物纹理、包型挺括度；模特图要保证包不被手臂遮挡。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/douyin/bags/douyin-bags-01.jpg` | untitled | https://p6.itc.cn/q_70/images01/20230920/7be1977cf4ed40eca37671f708ab4089.jpeg
- `images/douyin/bags/douyin-bags-02.jpg` | untitled | https://www.vogeutop.com/uploads/allimg/251017/145R124O-0.jpg
- `images/douyin/bags/douyin-bags-03.jpg` | untitled | https://x0.ifengimg.com/res/2023/44F74EC0CCFDA6ECB98C19C6FF0499486596354C_size78_w720_h641.jpg
- `images/douyin/bags/douyin-bags-04.jpg` | untitled | https://file.digitaling.com/eImg/uimages/20230801/1690876059876175.jpg
- `images/douyin/bags/douyin-bags-05.jpg` | untitled | https://pic4.zhimg.com/v2-57ea3fea8197d2842a4f16c416fdcadb_b.jpg
- `images/douyin/bags/douyin-bags-06.jpg` | untitled | https://pic3.zhimg.com/v2-949df307f8be4ef2b200ab3e10f7323e_r.jpg
- `images/douyin/bags/douyin-bags-07.jpg` | untitled | https://pic2.zhimg.com/v2-bb95fe40c71bd22a1839cf9dac92058d_r.jpg
- `images/douyin/bags/douyin-bags-08.jpg` | untitled | https://marketplace.canva.cn/EAFekaCkr_c/1/0/400w/canva-ShitZpF4EcM.jpg
- `images/douyin/bags/douyin-bags-09.jpg` | untitled | https://pic36.photophoto.cn/20150717/0018090778663785_b.jpg
- `images/douyin/bags/douyin-bags-10.jpg` | untitled | https://pic1.zhimg.com/v2-763b677b668d0a3af4fc9a3f47f338a0_b.jpg
