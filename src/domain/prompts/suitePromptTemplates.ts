import { platformLabels, type CommercePlatform } from "../apparel/options";
import type { ProductAnalysis } from "../suites/productAnalysis";
import type { SuiteImageRole } from "../suites/suitePresets";

const roleDirections: Record<SuiteImageRole, string> = {
  white_hero:
    "Suite role: white background hero image. Pure white background, complete product centered, no text, no props, product easy to inspect.",
  detail_white:
    "Suite role: detail-page white product display. Pure white or very clean background, complete product visible, accurate color and edges, designed as a detail-page module rather than a listing main image.",
  scene_hero:
    "Suite role: bag scene hero image. The bag is the hero in a realistic ecommerce scene with a strong first impression and no graphic text. Use hand-carry, shoulder, crossbody, backpack, luggage pulling, hand-operation, product-turntable, or clean lifestyle setup that matches the selected style; avoid generic full-body fashion posing that hides the bag.",
  studio_hero:
    "Suite role: bag studio main image. Stable commercial studio lighting, complete bag product visible, clear front/side/top/open or three-quarter silhouette and marketplace-ready composition. Show handles, straps, zipper path, hardware, pockets, material texture, stitching and bag bottom from an angle different from the scene hero.",
  mobile_long:
    "Suite role: mobile long bag main image. Vertical mobile-first composition, complete bag visibility, strong first-screen readability, no text overlays. If a model is present, favor hand, shoulder, torso, backpack, luggage-pulling or hand-operation crops that keep the bag dominant.",
  side_back:
    "Suite role: side/back supplementary bag image. Show side angle, back angle, top opening, bottom, interior, strap connection, trolley wheel or bag structure faithfully without redesigning the product. Use a clearly different viewpoint from the hero image.",
  key_features:
    "Suite role: key feature base image. Leave a clean side area for three engineered feature labels; keep product complete and readable.",
  single_feature:
    "Suite role: single bag feature highlight base image. Emphasize one capacity, compartment, shoulder comfort, lightweight, waterproof, anti-theft, travel-wheel, hardware, or material selling point with a calm copy-safe area.",
  material_detail:
    "Suite role: bag material detail image. Close-up on leather, canvas, nylon, suede or woven texture, panel seams, edge paint, quilting, perforation, stitching, lining and color fidelity.",
  model_fit:
    "Suite role: carrying-fit image. Show the bag naturally hand-carried, shoulder-carried, crossbody, backpacked, or luggage-pulled with commercially appropriate hand, shoulder, torso or full styling context. Use a fit-inspection pose such as side walk, standing three-quarter, seated handling, shoulder strap adjustment, open-bag capacity action, or back/side inspection depending on style. Do not let clothes, hair, other bags, props, or pose distract from the bag.",
  detail_header:
    "Suite role: detail-page first-screen poster image. Tmall-style campaign scene, richer visual background, premium catalog mood, complete product visibility, clean composition, no text overlays unless merchant copy is explicitly provided.",
  craft_detail:
    "Suite role: bag craftsmanship detail image. Focus on zipper teeth and puller, clasp, buckle, lock, handle base, strap attachment, metal feet, trolley wheel or handle when present, stitching, edge finishing, trims, lining, pocket structure or hardware construction.",
  sku_color:
    "Suite role: multi-color SKU overview. Show all provided colors as clean product-only items, accurate colors, orderly alignment, no model, no human body, no lifestyle scene.",
  size_info:
    "Suite role: bag size and capacity information module. Create a clean information-friendly visual area for dimensions, capacity, weight, shoulder-strap length, laptop fit, luggage size, compartments, or specifications; no model unless merchant data explicitly requires it, no invented numbers.",
  trust_footer:
    "Suite role: bag care and quality trust closing module. Refined clean composition for cleaning/care, material quality, hardware durability, stitching reliability, capacity reassurance or service notes; product detail or information graphic style, no model."
};

const platformTone: Record<CommercePlatform, string> = {
  vipshop: "Vipshop sale-commerce tone: clean, premium, practical and easy to audit.",
  taobao: "Taobao/Tmall suite tone: content-magazine ecommerce, quality feeling, warm but not cluttered.",
  jd: "JD suite tone: rational, trustworthy, crisp, detail-oriented and restrained.",
  douyin: "Douyin commerce suite tone: scene-driven, vertical impact, natural content feel, product still dominant.",
  dewu: "Dewu suite tone: trend marketplace, material credibility, clean streetwear quality.",
  pinduoduo: "Pinduoduo suite tone: direct, bright, high readability, simple conversion-oriented presentation.",
  xiaohongshu: "Xiaohongshu suite tone: lifestyle seeding, tasteful editorial realism, save-worthy composition.",
  kuaishou: "Kuaishou suite tone: direct live-commerce trust, warm real-use scenes and large product readability.",
  wechat_channels: "Channels suite tone: restrained social-commerce trust, calm clean scenes and credible product detail.",
  amazon: "Amazon suite tone: compliance-first white hero plus truthful lifestyle and detail gallery.",
  ebay: "eBay suite tone: truthful item inspection, condition clarity and useful multi-angle gallery.",
  walmart: "Walmart suite tone: mass-retail trust, clean practical product details and family-friendly lifestyle.",
  etsy: "Etsy suite tone: boutique craft warmth, crop-safe product focus and tactile material story.",
  shopee: "Shopee suite tone: mobile-first square clarity, bright thumbnails and compact benefit scenes.",
  lazada: "Lazada suite tone: clean mobile marketplace clarity, large subject and practical lifestyle context.",
  aliexpress: "AliExpress suite tone: global buyer clarity, strong hero image and practical detail/use sequence.",
  tiktok_shop_global: "TikTok Shop suite tone: scroll-stopping shop-card hero and creator-style secondary scenes.",
  shopify: "Shopify/DTC suite tone: brand-owned gallery cohesion, premium lifestyle and reusable campaign crops.",
  free: "通用平台 suite tone: merchant-defined visual system with modern ecommerce polish and no strict platform lock."
};

export function buildSuitePromptSection(input: {
  platform: CommercePlatform;
  role?: SuiteImageRole;
  productAnalysis?: ProductAnalysis;
  allowTextOverlay?: boolean;
}): string {
  const analysis = input.productAnalysis;
  if (!input.role && !analysis) return "";

  const sellingPoints = analysis?.sellingPoints.map((item) => `${item.title}: ${item.description}`).join("; ");
  return [
    input.role ? roleDirections[input.role] : "",
    `Suite platform tone for ${platformLabels[input.platform]}: ${platformTone[input.platform]}`,
    analysis
      ? `Product analysis: ${analysis.productName}; style ${analysis.productStyle}; visual features ${analysis.visualFeatures.join(", ")}; selling points ${sellingPoints}; target scenes ${analysis.targetScenes.join(", ")}. Product detail lock: ${analysis.productIdentityLock}.`
      : "",
    input.role === "detail_header" && input.allowTextOverlay
      ? "For the detail header poster only, generate clean short ecommerce typography directly in the image. Use a scene-appropriate font mood and avoid watermarks, prices, URLs, QR codes, third-party logos, and unreadable or misspelled text."
      : "Do not render text labels inside the generated image. Any ecommerce copy, feature labels, icons, callouts, or selling-point badges will be handled outside this non-poster image."
  ].filter(Boolean).join(" ");
}
