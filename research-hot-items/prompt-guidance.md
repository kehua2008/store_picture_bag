# Prompt Guidance From Hot Item Reference Research

## Summary

This research folder contains 300 publicly accessible ecommerce reference images: 6 platforms x 5 categories x 10 images. The samples are useful as a conversion-pattern pool, not as assets to copy. Public image search mixed modern product visuals with older promotional templates, so the prompt guidance separates useful visual mechanics from negative elements.

## Global Prompt Rules

- Main images should prioritize one clear subject, high product readability, accurate color, clean edges, realistic fabric or material behavior, and a stable ecommerce crop.
- Use high-conversion structure without copying promotional clutter: large subject, clear silhouette, simple background hierarchy, good contrast, and visible material texture.
- Keep text out of generated listing images unless the selected image type is a detail-page poster. For non-poster images, explicitly forbid prices, badges, QR codes, URLs, platform logos, watermarks, dense copy, and collage borders.
- Vary the image set by role: main image for immediate recognition, model-fit image for wearing effect, detail image for material/craft, scene image for lifestyle conversion, SKU image for color and shape consistency.
- Add controlled diversity to prompts through camera angle, pose, scene variant, lighting, and styling attitude instead of random decorative backgrounds.

## Platform Directions

- 唯品会: clean discount-retail clarity. Prefer centered product, pale or white background, complete garment outline, SKU-friendly crops, restrained styling.
- 淘宝: click-oriented but still clean. Use brighter backgrounds, stronger subject occupancy, natural model energy, and visible selling-point details without text blocks.
- 京东: credible and standardized. Use white, light gray, modern studio, sharp texture, practical angles, and minimal props.
- 抖音: dynamic vertical commerce. Use motion, lifestyle scenes, stronger depth, and punchier lighting while keeping the product dominant.
- 得物: trend and material credibility. Use clean street/studio scenes, lower clutter, detail close-ups, sneaker/bag texture, and premium neutral palettes.
- 拼多多: direct recognition. Use large subject, bright exposure, simple background, and clear product shape while excluding price-heavy graphics.

## Category Directions

- 女装: emphasize fit, waistline, hem movement, fabric drape, neckline/sleeve details, and style identity. Use natural walk, half-turn, hand at lapel, or relaxed standing poses.
- 男装: emphasize shoulder line, outerwear structure, trouser length, layering, and practical context. Use walking, cuff-adjusting, hands-in-pocket, or clean front/side poses.
- 童装: emphasize comfort, safe childlike movement, bright clean background, correct child proportions, and no adultized styling.
- 鞋靴: emphasize 3/4 side view, sole texture, upper material, heel support, real ground shadow, and optional dynamic context for sports/outdoor shoes.
- 箱包: emphasize bag silhouette, hardware, handle/strap structure, capacity impression, leather/fabric texture, and unobstructed hand-carry or shoulder-carry views.

## Concrete Prompt Additions

- Add to main-image prompts: "single dominant product subject, ecommerce-readable silhouette, product occupies 70-80% of frame, clean background hierarchy, no price text, no collage, no watermark".
- Add to model prompts: "natural commerce pose that reveals garment structure, accurate fit, realistic fabric tension, arms not hiding key design details".
- Add to detail prompts: "macro ecommerce detail, sharp material texture, one design feature per image, clean neutral background, no text labels unless poster mode".
- Add to scene prompts: "lifestyle context supports the product category, background lower contrast than product, product remains the first visual priority".
- Add to negative prompt: "price tag, discount badge, QR code, platform logo, watermark, dense Chinese promotional copy, collage layout, old campaign banner, over-retouched face, distorted hands, unrelated props".
- For poster or callout text, make typography scene-aware instead of generic: premium womenswear can lean elegant and editorial, menswear can lean clean and structural, kids can lean rounded and playful, shoes can lean technical and compact, bags can lean minimal and refined.
- Keep typography concise and integrated with the composition. The goal is not decorative art text everywhere; the goal is to make the copy look native to the image scenario.

## Style Diversity System

To make generated images genuinely varied, do not rely on one long prompt or a vague instruction like "make it diverse". Diversity should come from structured style variables with image-role constraints. The system should combine a stable product identity lock with controlled variation in style, scene, camera, lighting, pose, palette, and commerce intensity.

### Style Variables

- `style_family`: old money, urban commute, high-street trend, gorpcore, Korean relaxed, modern Chinese, dopamine sweet-cool, minimal premium.
- `scene`: pure white, modern studio, street, home, outdoor, magazine set, lifestyle environment.
- `camera`: front view, side view, 3/4 view, low angle, eye-level, half body, full body, macro close-up.
- `lighting`: soft window light, crisp daylight, bright commercial light, hard side light, low-contrast studio light, outdoor natural light.
- `pose`: neutral standing, walking, half turn, looking back, adjusting cuff, holding lapel, hand in pocket, seated, carrying bag.
- `background_palette`: pure white, off-white/gray, muted neutral, bright color-block, urban concrete, natural green/brown, warm wood/stone.
- `commerce_intensity`: audit-safe, balanced marketplace, strong click-through, vertical content cover.

### Role-Based Constraints

- Main image: keep the subject large, readable, and platform-safe. Use limited variation; avoid complex scenes and text.
- Model-fit image: allow the largest variation in pose, camera, and scene because this role communicates wearing effect and style identity.
- Detail image: keep style variation low. Focus on one material, craft, closure, pocket, sole, handle, strap, or hardware detail per image.
- Scene/lifestyle image: allow stronger atmosphere, but keep the product as the first visual priority.
- Activity or cover image: allow stronger color, depth, movement, and vertical composition, especially for Douyin-style assets.
- White/SKU image: keep stable and inspection-friendly. Do not chase stylistic novelty here.

### Variation Strength

- `safe`: platform audit-friendly, low variation, clean background, stable crop. Best for white images, SKU images, and strict main images.
- `balanced`: default setting. Style is visible, but product identity, color, and structure remain dominant.
- `bold`: stronger scene, pose, color, and camera variation. Best for Douyin covers, lifestyle images, and campaign-style visuals.

### Prompt Assembly Rule

Each generated image should assemble one option from each variable group, then apply role constraints:

`product identity + platform rule + image role + style_family + scene + camera + lighting + pose + palette + commerce_intensity + negative constraints`

The model should not randomize everything at once. For a suite, keep product identity, platform rules, and category details fixed; vary only 2-4 visual variables per image. This creates a coherent but non-repetitive set.

### Example Combinations

- Women / Korean relaxed / window-light home scene / half-body slight turn / cream palette / balanced marketplace.
- Women / high-street trend / urban concrete street / low-angle walking pose / black-denim-gray palette / strong click-through.
- Men / urban commute / glass office facade / eye-level walking pose / slate-taupe palette / balanced marketplace.
- Kids / dopamine sweet-cool / bright studio / natural standing or gentle movement / clean pastel palette / balanced marketplace.
- Shoes / gorpcore / trail or wet pavement / 3/4 low-angle product view / moss-stone palette / bold lifestyle.
- Bags / old money / warm stone wall or quiet lounge / hand-carry 3/4 view / camel-ivory palette / balanced marketplace.

### Implementation Guidance

- Expand `topSellerStylePresets` from single text directions into structured presets with options for scene, camera, pose, lighting, palette, and forbidden elements.
- Add a `variationStrength` option with `safe`, `balanced`, and `bold` values.
- In prompt generation, choose style variables based on `platform + category + imageType + variationStrength`.
- Assign different style strategies across a suite so 7 images do not look like the same composition with only a background change.
- Keep poster typography as an explicit exception; all other image roles should forbid generated text.
- Treat price-heavy, watermark-heavy, collage-like public reference images as negative examples, not as visual targets.

## Integration Notes

- Existing `topSellerStylePresets` can absorb these findings by adding stronger composition controls per style: subject occupancy, pose family, background hierarchy, and forbidden promo clutter.
- Existing image-type directions should distinguish main image, model-fit, detail texture, craft, SKU, and poster typography more sharply.
- Poster typography should remain an explicit exception; all other image types should keep generated text disabled.
- Typography styling should be handled as a scene-specific exception for poster/callout modules, not as a universal decoration layer for every ecommerce image.
