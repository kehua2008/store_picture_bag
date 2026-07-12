import {
  modelProfileDescriptions,
  modelProfileLabels,
  type ApparelScene,
  type CommercePlatform,
  type ModelProfile
} from "../apparel/options";
import type { VipshopCategory, VipshopAssetType } from "../vipshop/types";

export const apparelSceneDirections: Record<ApparelScene, string> = {
  street:
    "Create an outdoor street-style ecommerce image with natural daylight, restrained city background, clean depth, and a confident commercial fashion pose.",
  studio:
    "Create a strict indoor photography-studio ecommerce image. Use a controlled studio set, soft professional lighting, clean floor, realistic shadows, and a pure or near-solid neutral backdrop such as light gray, white, charcoal, or black. Do not create outdoor streets, home rooms, cafes, windowside lifestyle scenes, architecture, landscape, or complex environmental backgrounds. If a style/reference image is supplied, borrow only studio-safe elements such as simple stools, plinths, bags risers, floor marks, minimal props, or matching accessories placed inside the studio; keep the scene clearly indoors in a photography studio.",
  catalog:
    "Create a premium catalog editorial image with refined composition, high-end lighting, elegant styling, and a calm luxury retail mood.",
  white:
    "Create a strict pure white background ecommerce product image. The background must be RGB 255,255,255, clean, borderless, and without props."
};

export const apparelPlatformRules: Record<CommercePlatform, string> = {
  vipshop: "唯品会 listing style: clean premium sale image, practical composition, product centered and easy to inspect.",
  taobao: "天猫/淘宝 listing style: realistic merchant product image, clear product value, polished but not over-designed, no promotional text or graphic overlays.",
  pinduoduo: "拼多多 listing style: direct and bright product presentation, high clarity, no price badges or collage treatment.",
  jd: "京东 listing style: crisp, trustworthy, well-lit product image with restrained commercial styling.",
  douyin: "抖音 commerce style: strong vertical visual impact, clean scene, realistic fashion content without text overlays.",
  dewu: "得物 listing style: premium streetwear marketplace image, authentic material texture, clean product trust, and calibrated color.",
  xiaohongshu: "小红书 commerce style: tasteful lifestyle seeding image, realistic daily scene, soft editorial composition, product readable without hard-sell poster text.",
  kuaishou: "快手 commerce style: direct trustworthy live-commerce image, large readable subject, practical scene, strong mobile recognition without exaggerated promotional graphics.",
  wechat_channels: "视频号 commerce style: restrained social-commerce trust, clean product presentation, calm lifestyle context, no aggressive ad look.",
  amazon: "Amazon marketplace style: compliance-first product photography, pure white main image when selected, product occupies most of frame, no text, watermark, props or lifestyle clutter on main image.",
  ebay: "eBay marketplace style: truthful item gallery photography, clean angles, condition and scale readable, no borders, no marketing text and no watermark.",
  walmart: "Walmart marketplace style: crisp mass-retail trust, clean white-background primary image, practical secondary lifestyle, no promotional overlays.",
  etsy: "Etsy marketplace style: boutique handmade-friendly product photography, centered crop-safe focal point, warm craft or small-brand feel without clutter.",
  shopee: "Shopee marketplace style: mobile-first square clarity, bright clean product hero, high thumbnail readability for Southeast Asia shopping feeds.",
  lazada: "Lazada marketplace style: clean Southeast Asia mobile marketplace product image, large subject, clear benefit scene, no misleading content.",
  aliexpress: "AliExpress marketplace style: global buyer clarity, strong 1:1 product identity, practical details and use-case images without misleading props.",
  tiktok_shop_global: "TikTok Shop style: scroll-stopping but compliant shop-card image, clean square product hero, creator-style secondary lifestyle without text overlays.",
  shopify: "Shopify/DTC style: brand-owned premium product photography, consistent gallery system, reusable campaign crops, polished lifestyle differentiation.",
  free: "通用平台 ecommerce style: no strict platform-specific audit constraint; follow merchant size and image-type choices while keeping the product accurate, beautiful, modern and commercially usable."
};

export const apparelImageTypeDirections: Record<string, string> = {
  white_main:
    "Create a strict marketplace white-background main image: full product visible, centered, clean edges, no props, no text, and accurate product color.",
  scene_main:
    "Create a conversion-focused bag scene main image: the bag is the hero, composition is simple, carrying model, hand operation, or setting supports the bag without distracting from it.",
  studio_main:
    "Create a clean bag studio main image: stable commercial lighting, full bag silhouette visible, ecommerce-ready front, side, top, three-quarter or open angle. Handles, shoulder straps, zipper path, hardware, pocket layout, material texture, stitching and bag bottom should be easy to inspect. Studio means a controlled indoor photography set with a pure or near-solid gray, white, black, or neutral color backdrop by default. Do not use outdoor scenery, streets, home interiors, cafes, windowside lifestyle scenes, architecture, plants, or decorative environmental backgrounds. If a reference style is supplied, use only studio-appropriate plinths, floor surfaces, paper sweeps or restrained bag props inside the same controlled studio space.",
  mobile_long_main:
    "Create a mobile long main image: vertical mobile-first composition, full product or full outfit visible, strong ecommerce first-screen readability, no text or graphic overlays.",
  full_body_main:
    "Create a complete bag main image: show the whole bag product clearly or show it naturally hand-carried, shoulder-carried, crossbody, backpacked, or luggage-pulled with clean styling coverage and no awkward crop.",
  side_back_main:
    "Create a supplementary side/back main image: show a side angle, back angle, or construction angle of the same product, preserving all design details accurately.",
  detail_header_poster:
    "Create a Tmall-style detail-page first-screen advertising poster image: rich brand-campaign mood, elevated scene design, layered background patterns, vivid but tasteful color accents, premium catalog look, complete product visibility, and tasteful ecommerce poster typography generated directly inside the image. Text should be short, clean, brand-like, well aligned, must not cover the product, and should use a typography mood that matches the product scenario rather than a generic default font style.",
  detail_white_product:
    "Create a white-background product detail image: show the complete product clearly on pure white, with crisp edges and accurate color for detail-page inspection.",
  detail_model_fit:
    "Create a carrying-fit detail image: the bag must be carried naturally and shown as a clean ecommerce bag scene. Show bag silhouette, body scale, handle or strap length, carrying position, closure structure, material texture, and styling context clearly.",
  detail_texture:
    "Create a close-up bag material detail image: zoom in on the real leather, canvas, nylon, suede, woven texture, stitching, edge paint, panel seam, quilting, perforation, color blocking, and color accuracy. This should be a detail close-up, not a full outfit image.",
  detail_craft:
    "Create a bag craftsmanship close-up: focus on zipper teeth, puller, clasp, buckle, lock, handle base, strap attachment, metal feet, trolley wheel or handle when present, stitching, edge finishing, trims, lining, or hardware. The image must clearly show construction details.",
  detail_merchant_info_graphic:
    "Create a clean Tmall-style bag detail information graphic from the uploaded merchant reference image. Treat the uploaded reference as the source of truth for bag dimensions, capacity notes, shoulder-strap length, weight, laptop fit, luggage size, SKU/color names, product parameters, units, numbers, and table relationships. Preserve every readable number, unit, label, color/SKU name, size name, and row/column relationship exactly; do not invent, alter, translate, or remove merchant data. Redesign only the layout: straighten messy hand-drawn or screenshot content into a neat ecommerce detail card with clear grid/table hierarchy, readable typography, balanced spacing, neutral premium styling, and a 790px-wide vertical detail-page feel. If part of the source text is illegible, keep only visible reliable content and avoid hallucinating missing values.",
  detail_design_points:
    "Create a bag design-point detail image: highlight bag silhouette, handle shape, shoulder strap, zipper path, flap, side pocket, compartment layout, capacity structure, trolley wheel/handle when present, or distinctive design structure without adding text.",
  detail_size_fit:
    "Create a bag size and capacity explanation image without text unless merchant data is explicitly supplied: use flat-lay, open-bag, hand-scale, body-scale, or organized-item composition to communicate length, width, depth, shoulder-strap length, handle drop, capacity, compartments, laptop/tablet fit, luggage size, and carrying proportions visually.",
  detail_color_sku:
    "Create a color/SKU detail image: keep pure color accuracy and clean product presentation, suitable for showing SKU consistency without text or color labels.",
  detail_scene_lifestyle:
    "Create a bag lifestyle detail image: show the bag in a realistic usage scene, hand-carry, shoulder, crossbody, backpack, travel, commute, outdoor, office, or home context while keeping the bag visually dominant and inspectable.",
  detail_footer_trust:
    "Create a premium closing detail image: clean brand-like quality mood, material trust, refined composition, no text, suitable for the bottom of a product detail page.",
  live_cover:
    "Create a live-commerce cover image: strong visual entry point, clear product, no text or badges, suitable for a livestream card.",
  feed_card:
    "Create an information-feed image: high first-frame impact, clean scene, product instantly readable, no text overlays."
};

export const apparelModelDetailRule =
  "Model detail direction: use the selected gender/child type, age range, ethnicity style, hairstyle, and body presence as concrete casting guidance only when a person is needed. Keep the model commercially appropriate and make the bag silhouette, body scale, carry pose, strap/handle visibility, and product readability the priority.";

export const apparelIdentityLock =
  "PRODUCT IDENTITY IS THE HIGHEST PRIORITY. Preserve the exact bag product from the uploaded image. Keep the original color, bag silhouette, body proportions, handles, shoulder straps, strap attachments, zipper path, buckles, clasps, locks, wheels or trolley handle when present, pocket layout, flap shape, compartment structure, leather/canvas/nylon texture, stitching, edge paint, trims, hardware, small logo-like marks, labels, printed graphics, lettering, decorative motifs, edges, and visible details unchanged. If the bag has any monogram, stripe, panel, quilting, perforation, logo-like mark, label, texture, color blocking, lock, buckle, strap, embroidery, or printed decoration, reproduce it in the same position, scale, color, and visual prominence.";

export const apparelProductSourceRule =
  "The uploaded bag image is the source of truth. The uploaded product image is the source of truth for the bag itself. Product reference images define bag identity only. Style reference images may control only environment, background, lighting, lens/camera, composition, color grading, commercial retouching mood, and scene styling. Style references, top-merchant style presets, scene changes, model choices, and merchant extra instructions must never redesign, recolor, simplify, remove, replace, blur, crop out, cover, or hide the bag's own silhouette, material, handles, shoulder straps, zipper path, pockets, compartments, logo-like marks, panels, stitching, trims, hardware, printed graphics, pattern, structure, craftsmanship, or construction details.";

export const apparelGarmentFitRule =
  "When a model option is selected, the bag should look naturally carried, worn, placed, opened, or handled: preserve the bag shape, material texture, handles, shoulder strap, zipper, hardware, pockets, stitching and color while fitting naturally with the body scale. For any model image, keep the crop commercially appropriate around hand, shoulder, torso, back, waist, stroller, suitcase handle, or tabletop use context; do not let clothing, props, hands, hair, or pose cover the bag's key structure.";

export const apparelHumanAnatomyRule =
  "If hands, shoulders, torso, back, legs or a model are used, keep anatomy natural with correct hand grip, shoulder posture, arm scale, strap placement, carry tension, limbs and movement. The bag must remain the visual subject.";

export const apparelCustomModelConsistencyRule =
  "Use the second uploaded reference image as the face identity reference only when a full model scene is selected. Transfer the face identity, facial features, face shape, expression temperament, and recognizable facial likeness onto the selected model type. Keep the body type, age range, ethnicity style, hairstyle direction, carry pose, outfit styling, and model presentation controlled by the earlier model selections unless they directly conflict with natural face integration. Do not use the uploaded face photo to change the bag product from the first uploaded product image.";

export const apparelForbiddenContentRule =
  "Do not add text, watermark, price, discount badge, QR code, URL, border, collage layout, old campaign banner, dense Chinese promotional copy, platform logo, third-party logo, messy background, over-retouched face, deformed limbs, duplicate bodies, extra fingers, or unrelated props.";

export const apparelPosterForbiddenContentRule =
  "Poster text is allowed only for the selected detail-page header poster. Do not add watermark, price, discount badge, QR code, URL, border, collage layout, old campaign banner, dense promotional copy, platform logo, third-party logo, messy background, over-retouched face, deformed limbs, duplicate bodies, extra fingers, or unrelated props. Do not invent real brand names or logos.";

export const apparelNegativePrompt =
  "text, watermark, price tag, discount badge, QR code, URL, platform logo, third-party logo, dense Chinese promotional copy, collage layout, old campaign banner, border, messy background, unrelated props, over-retouched face, inaccurate color, redesigned bag, changed bag shape, changed handle, changed strap, changed zipper, changed hardware, changed pocket layout, changed material texture, missing original color, removed logo-like mark, changed product pattern, distorted bag, collapsed bag shape, impossible capacity, deformed hands, deformed limbs, extra fingers, duplicate body, low resolution, blur";

export const apparelPosterNegativePrompt =
  "watermark, price tag, discount badge, QR code, URL, platform logo, third-party logo, dense Chinese promotional copy, collage layout, old campaign banner, border, messy background, unrelated props, over-retouched face, inaccurate color, redesigned bag, changed bag shape, changed handle, changed strap, changed zipper, changed hardware, changed pocket layout, changed material texture, missing original color, removed logo-like mark, changed product pattern, distorted bag, collapsed bag shape, impossible capacity, deformed hands, deformed limbs, extra fingers, duplicate body, low resolution, blur, misspelled text, broken typography, unreadable typography";

export function apparelModelDirection(modelProfile: ModelProfile): string {
  if (modelProfile === "product_only") {
    return "Model direction: no human model. Create a clean product-only ecommerce image with the bag as the sole subject.";
  }

  return `Model direction: ${modelProfileLabels[modelProfile]}, ${modelProfileDescriptions[modelProfile]}. Generate the uploaded bag naturally hand-carried, shoulder-carried, crossbody-worn, backpack-worn, luggage-pulled, opened, placed, or styled with the model as appropriate, with realistic scale, strap tension, hand grip, shoulder placement, body contact, bag volume, and capacity impression.`;
}

export const legacyCategoryLabel: Record<VipshopCategory, string> = {
  top: "bag styling support item",
  bottom: "lower-body styling support item",
  shoes: "bag product"
};

export const legacyVipshopAssetDirection: Record<VipshopAssetType, string> = {
  main_scene:
    "Create a clean premium ecommerce bag product image for listing use. Keep the bags identity unchanged and present it as a commercial marketplace image.",
  main_side_back:
    "Create a secondary full-view ecommerce image that clearly shows bag side/back/bottom shape, construction, capacity and carry proportion without cropping the product.",
  detail:
    "Create a close detail image focused on bag material, zipper, hardware, strap attachment, stitching, trims, craftsmanship, and color accuracy while preserving the same bag identity.",
  white_bg:
    "Create a strict pure white background product image on RGB 255,255,255 with the product centered, complete, and occupying 70% to 85% of the canvas.",
  sku_color:
    "Create a single SKU color image on a pure white background, showing only the exact selected color and no model or scene."
};

export const legacyVipshopIdentityLock =
  "Preserve the exact bag identity from the uploaded reference image. Do not redesign the bag silhouette, colorway, body proportions, handles, shoulder straps, zipper path, buckles, clasps, locks, wheels or trolley handle when present, pocket layout, flap shape, compartment structure, material texture, stitching, edge paint, trims, carry proportion, or visible details. Treat the reference image as the product source of truth.";

export const legacyVipshopQualityRule =
  "The product must be complete, centered, realistic, professionally lit, sharp, color-accurate, and ready for ecommerce listing.";

export const legacyVipshopForbiddenContentRule =
  "Do not add text, watermark, price, QR code, URL, border, collage layout, unrelated props, or third-party logo.";

export const legacyVipshopNegativePrompt =
  "text, watermark, logo, QR code, price tag, URL, collage, border, messy background, cropped product, distorted product, inaccurate color, heavy shadow";
