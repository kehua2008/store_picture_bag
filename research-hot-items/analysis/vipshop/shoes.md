# 唯品会 / 鞋靴 Hot Item Reference Analysis

## Sample Set

- Count: 10
- Source: public Bing image search results, downloaded only when the original image URL was publicly accessible.
- Quality note: the public search pool contains both product photos and high-conversion promotional templates. Promotional text, price tags, watermarks, and old campaign layouts should be treated as negative examples for generation unless the selected image type explicitly allows poster typography.

## Visual Understanding

- Platform pattern: 折扣场景强，主图偏商品清楚、主体居中、白底或浅色背景，活动图容易出现价格和促销文案。
- Category pattern: 鞋靴爆款图常见大主体、三分之二侧角、鞋面/鞋底/鞋跟细节，运动鞋可用动态地面或户外场景。
- Useful positive signals: large readable product, clear silhouette, strong first-screen recognition, camera angle chosen to reveal fit or structure, simple background hierarchy, visible material texture.
- Negative signals observed in this source type: dense Chinese copy, price stickers, old discount campaign banners, watermarks, collage borders, unrelated decorative props, blurry faces, over-compressed images.

## Prompt Guidance

- Platform direction: 用于 prompt 时保留清晰商品轮廓、完整款式、克制浅背景，禁止价格、折扣、强促销字和第三方水印。
- Category direction: 增加 3/4 side view、低机位、鞋面材质、鞋底纹理、后跟支撑和真实阴影；白底图保持边缘干净。
- Composition instruction: keep the product or worn outfit as the dominant subject, usually 65-85% of the frame for main images and 45-65% for lifestyle images.
- Detail instruction: reserve separate detail images for fabric texture, craft, closure, pocket, sole, handle, strap, or hardware instead of forcing every detail into the main image.
- Compliance instruction: do not generate prices, discount badges, platform logos, QR codes, watermarks, collage frames, or dense promotional text.

## Samples

- `images/vipshop/shoes/vipshop-shoes-01.jpg` | untitled | https://preview.qiantucdn.com/58pic/32/69/44/17458PICFa4zpWiv23xET_PIC2018.jpg!w1024_new_small_1
- `images/vipshop/shoes/vipshop-shoes-02.png` | untitled | https://preview.qiantucdn.com/58pic/43/36/52/03U58PICBgDKE58PICX6uvmRt_PIC2018.png!w1024_new_0_1
- `images/vipshop/shoes/vipshop-shoes-03.jpg` | untitled | https://pic.nximg.cn/file/20150509/18116742_132118211000_2.jpg
- `images/vipshop/shoes/vipshop-shoes-04.png` | untitled | https://preview.qiantucdn.com/58pic/43/99/72/80T58PICR3thBPYmZt2y8_PIC2018.png!w1024_new_0_1
- `images/vipshop/shoes/vipshop-shoes-05.png` | untitled | https://img.shetu66.com/2023/12/29/170381173953788271.png?x-oss-process=image/resize,h_800/watermark,image_d2F0ZXJtYXJrL2JhY2tncm91cDAxLnBuZw==,g_se,x_0,y_10/watermark,text_6K6-5Zu-572RIOe8luWPtzo2MjgxNTQ2NjY1NzU4NjA3ODQ=,type_ZmFuZ3poZW5naGVpdGk,color_FFFFFF,size_12,g_se,x_15,y_16
- `images/vipshop/shoes/vipshop-shoes-06.jpg` | untitled | https://pic5.sucaisucai.com/06/84/06984465_2.jpg
- `images/vipshop/shoes/vipshop-shoes-07.jpg` | untitled | https://photo.16pic.com/00/79/05/16pic_7905579_b.jpg
- `images/vipshop/shoes/vipshop-shoes-08.jpg` | untitled | https://photo.16pic.com/00/79/01/16pic_7901726_b.jpg
- `images/vipshop/shoes/vipshop-shoes-09.jpg` | untitled | https://imgpp.ztupic.com/bup/so/20210521/c5d0856aa82b56c46d296991aa11a722-1.jpg?x-oss-process=image/resize,w_290/crop,h_435/quality,q_85/sharpen,100
- `images/vipshop/shoes/vipshop-shoes-10.png` | untitled | https://img.tuguaishou.com/ips_templ_preview/41/22/16/lg_2653190_1580558107_5e35671b5621d.jpg!w1024_w?auth_key=1897344000-0-0-81aab2e568591050cc06f919ab8d5315
