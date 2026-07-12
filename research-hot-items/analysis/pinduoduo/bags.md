# 拼多多 / 箱包 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 转化导向明显，主体大、颜色亮、价格感强，样本中促销模板和信息密集图较多。
- Category pattern: 箱包需要清楚展示包型、五金、容量感、肩带/手柄结构；可用手持、肩背或产品静物两条路线。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时只提取主体大、明亮直接、商品清楚的部分，排除价格牌、夸张营销词和杂乱贴片。
- Category direction: 增加正面+侧面角度、五金微光、皮革/织物纹理、包型挺括度；模特图要保证包不被手臂遮挡。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/pinduoduo/bags/pinduoduo-bags-01.jpg` | untitled | http://p7.zbjimg.com/service/2017-08/18/service/59967214916eb.jpg
- `images/pinduoduo/bags/pinduoduo-bags-02.jpg` | untitled | https://preview.qiantucdn.com/auto_machine/20220415/3b14da12-15f9-4bdc-9923-95cb91f37897.jpg!w1024_new_small_1
- `images/pinduoduo/bags/pinduoduo-bags-03.png` | untitled | https://1.s91i.faiusr.com/4/AFsIhK06EAQYACCY84rpBSiguITVAzCgBjigBg!500x500.png?_tm=3&v=1655688455
- `images/pinduoduo/bags/pinduoduo-bags-04.jpg` | untitled | https://preview.qiantucdn.com/58pic/36/35/37/66p58PICbajRbWt7HDcU58PIC_PIC2018.jpg!w1024_new_0_1
- `images/pinduoduo/bags/pinduoduo-bags-05.jpg` | untitled | https://bpic.588ku.com/Templet_origin_pic/20/21/10/30e052c13f1a8e09bca543f09846b872.jpg
- `images/pinduoduo/bags/pinduoduo-bags-06.png` | untitled | https://img.shetu66.com/2024/01/07/170461213381180915.png
- `images/pinduoduo/bags/pinduoduo-bags-07.jpg` | untitled | https://preview.qiantucdn.com/58pic/36/35/37/66p58PICbajRbWt7HDcU58PIC_PIC2018.jpg!w1024_new_4096_1
- `images/pinduoduo/bags/pinduoduo-bags-08.png` | untitled | https://img.shetu66.com/2024/01/06/170455558718146276.png
- `images/pinduoduo/bags/pinduoduo-bags-09.jpg` | untitled | https://pic.nximg.cn/file/20240204/34286498_150601506104_2.jpg
- `images/pinduoduo/bags/pinduoduo-bags-10.jpg` | untitled | https://pic.nximg.cn/file/20230928/31380678_092357122109_2.jpg
