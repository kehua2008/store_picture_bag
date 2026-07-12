# 京东 / 鞋靴 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 更偏可信、标准和品控感，白底/浅灰棚拍、完整商品、材质细节和干净构图更适合平台调性。
- Category pattern: 鞋靴爆款图常见大主体、三分之二侧角、鞋面/鞋底/鞋跟细节，运动鞋可用动态地面或户外场景。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时强化稳定棚拍、可信光线、材质清晰和标准商品角度，减少夸张场景和强滤镜。
- Category direction: 增加 3/4 side view、低机位、鞋面材质、鞋底纹理、后跟支撑和真实阴影；白底图保持边缘干净。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/jd/shoes/jd-shoes-01.jpg` | untitled | https://img11.360buyimg.com/cms/jfs/t1/326425/35/21910/160653/68cd2b04F10820d2f/eedf3c826fd14be6.jpg
- `images/jd/shoes/jd-shoes-02.png` | untitled | https://img13.360buyimg.com/cms/jfs/t1/309273/26/15494/111267/686d179fF2e374055/83c146ee80624167.png
- `images/jd/shoes/jd-shoes-03.jpg` | untitled | https://m.360buyimg.com/babel/jfs/t1/106155/3/38237/201775/6412b31aF4bc4bd24/d7e556b7415143ac.jpg
- `images/jd/shoes/jd-shoes-04.png` | untitled | https://img.shetu66.com/2023/11/14/1699942387044338.png
- `images/jd/shoes/jd-shoes-05.jpg` | untitled | https://gd-filems.dancf.com/gaoding/gaoding/20752/19614f38-574c-472b-b60f-82081529de11816004.jpg
- `images/jd/shoes/jd-shoes-06.jpg` | untitled | https://pic.nximg.cn/file/20241102/12106414_191625080129_2.jpg
- `images/jd/shoes/jd-shoes-07.png` | untitled | https://img.shetu66.com/2023/12/29/170381163157064373.png?x-oss-process=image/resize,h_800/watermark,image_d2F0ZXJtYXJrL2JhY2tncm91cDAxLnBuZw==,g_se,x_0,y_10/watermark,text_6K6-5Zu-572RIOe8luWPtzo2MjgxNTQyMTIxMjcyMTcyODc=,type_ZmFuZ3poZW5naGVpdGk,color_FFFFFF,size_12,g_se,x_15,y_16
- `images/jd/shoes/jd-shoes-08.png` | untitled | https://preview.qiantucdn.com/58pic/71/04/14/70w58PICu6V73nsjJKA3Z_PIC2018.png!w1024_new_0_1
- `images/jd/shoes/jd-shoes-09.jpg` | untitled | https://pic.nximg.cn/file/20150105/10601332_105111486000_2.jpg
- `images/jd/shoes/jd-shoes-10.jpg` | untitled | https://pic.nximg.cn/file/20190212/9521228_151906631086_2.jpg
