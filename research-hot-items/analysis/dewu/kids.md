# 得物 / 童装 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 更偏潮流质感、单品细节、干净背景、低杂讯构图，鞋靴和箱包样本更有参考价值。
- Category pattern: 明亮背景、自然童趣、完整穿着效果和舒适感更重要；避免成人化姿态和过度成熟妆造。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时强调潮流质感、材质可信、干净背景、低饱和高级色和细节特写。
- Category direction: 增加儿童自然动作：站立、轻走、转身、抱玩具但不遮挡服装；强调柔软、舒适、活泼和尺码比例自然。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/dewu/kids/dewu-kids-01.jpg` | untitled | https://pic.nximg.cn/file/20200412/12286942_095138874000_2.jpg
- `images/dewu/kids/dewu-kids-02.jpg` | untitled | https://picb7.photophoto.cn/28/961/28961037_1.jpg
- `images/dewu/kids/dewu-kids-03.jpg` | untitled | https://bpic.588ku.com/templet_pic/21/05/13/7575ddf71e7421447b46c87cbfb97b0c.jpg!/fw/750/quality/90/unsharp/true/compress/true
- `images/dewu/kids/dewu-kids-04.jpg` | untitled | https://pic.ntimg.cn/file/20200412/12286942_095136690000_2.jpg
- `images/dewu/kids/dewu-kids-05.jpg` | untitled | https://picb0.photophoto.cn/03/672/03672810_1.jpg
- `images/dewu/kids/dewu-kids-06.png` | untitled | https://img.shetu66.com/2023/12/24/1703371024076213.png
- `images/dewu/kids/dewu-kids-07.png` | untitled | https://img.shetu66.com/2023/12/24/1703370044390495.png
- `images/dewu/kids/dewu-kids-08.jpg` | untitled | https://pic.nximg.cn/file/20200412/12286942_104410422000_2.jpg
- `images/dewu/kids/dewu-kids-09.jpg` | untitled | https://photo.16pic.com/00/86/88/16pic_8688762_b.jpg
- `images/dewu/kids/dewu-kids-10.jpg` | untitled | https://photo.16pic.com/00/89/38/16pic_8938861_b.jpg
