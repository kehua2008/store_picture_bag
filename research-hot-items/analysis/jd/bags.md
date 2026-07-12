# 京东 / 箱包 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 更偏可信、标准和品控感，白底/浅灰棚拍、完整商品、材质细节和干净构图更适合平台调性。
- Category pattern: 箱包需要清楚展示包型、五金、容量感、肩带/手柄结构；可用手持、肩背或产品静物两条路线。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时强化稳定棚拍、可信光线、材质清晰和标准商品角度，减少夸张场景和强滤镜。
- Category direction: 增加正面+侧面角度、五金微光、皮革/织物纹理、包型挺括度；模特图要保证包不被手臂遮挡。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/jd/bags/jd-bags-01.jpg` | untitled | https://picb9.photophoto.cn/03/873/03873139_1.jpg
- `images/jd/bags/jd-bags-02.jpg` | untitled | https://preview.qiantucdn.com/auto_machine/20201210/6449c274-369b-4693-8cae-d57c3fbdcbfb.jpg!w1024_new_small_1
- `images/jd/bags/jd-bags-03.jpg` | untitled | https://pic.nximg.cn/file/20180717/15097685_131835930089_2.jpg
- `images/jd/bags/jd-bags-04.webp` | untitled | https://gd-hbimg.huaban.com/fe3cb5153d8d4fe747e876ba12b0970235992406c0bc9-V7kMud_fw658
- `images/jd/bags/jd-bags-05.jpg` | untitled | https://pic.nximg.cn/file/20210706/1248069_164419035127_2.jpg
- `images/jd/bags/jd-bags-06.png` | untitled | http://n.sinaimg.cn/spider20230606/261/w1265h596/20230606/023d-021256f108e58bfd30ca53dcd72f78da.png
- `images/jd/bags/jd-bags-07.jpg` | untitled | https://picb7.photophoto.cn/06/274/06274817_1.jpg
- `images/jd/bags/jd-bags-08.jpg` | untitled | https://pic.ibaotu.com/00/68/41/22f888piCGyS.jpg-0.jpg!ww7002
- `images/jd/bags/jd-bags-09.jpg` | untitled | https://pic49.photophoto.cn/20181025/0018090758411119_b.jpg
- `images/jd/bags/jd-bags-10.webp` | untitled | https://gd-hbimg.huaban.com/86cd4df72277df83e1118d079066952f87ebe6331d17c-LRSf5U_fw658webp
