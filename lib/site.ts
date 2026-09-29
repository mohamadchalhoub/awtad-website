/**
 * Site-wide constants: contact details, navigation and the curated
 * photography used by the brand sections. Portfolio content itself comes
 * from Supabase (see lib/work.ts).
 */

export const WHATSAPP_NUMBER = "96171175906"
export const PHONE_DISPLAY = "+961 71 175 906"
export const PHONE_HREF = "tel:+96171175906"
export const EMAIL = "husseinnouraldeen5@gmail.com"
export const ADDRESS = "Beirut · Dahye · Mreijeh · Al Amir Blocks, Block F"
export const MAPS_URL = "https://maps.app.goo.gl/1qbLxBast4tUM2YV9"

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

/**
 * Desktop order: Home · Shop (dropdown) · Islamic · Personalized · About · Contact.
 * Mobile and footer reuse the same hierarchy. `shop` has children, see SHOP_LINKS.
 */
export const NAV = [
  { href: "/", key: "home" },
  { href: "/projects", key: "shop", children: true },
  { href: "/projects?category=islamic", key: "islamic" },
  { href: "/projects?category=personalized", key: "personalized" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const

/**
 * Real AWTAD photographs chosen for the brand sections, served from /public
 * at web size. Replace with dedicated workshop / laser-cutting photography
 * when it is available.
 */
export const MEDIA = {
  /* Collection covers */
  wallArt: "/media/portrait.jpg",
  islamic: "/media/hero.jpg",
  personalized: "/work/journey-result.jpg",
  home: "/media/finish-gold.jpg",
  special: "/media/custom.jpg",
  /* Lifestyle */
  hero: "/media/gift.jpg",
  islamicRoom: "/media/wall-art.jpg",
  capsule: "/media/business.jpg",
  closeUp: "/media/close-up.jpg",
  finishBlack: "/media/finish-black.jpg",
  finishGold: "/media/finish-gold.jpg",
  /* One real portrait commission: the client's illustration and the cut piece. */
  journey: {
    idea: "/work/journey-idea.jpg",
    design: "/work/journey-design.jpg",
    craft: "/work/journey-craft.jpg",
    result: "/work/journey-result.jpg",
  },
}

export type CategoryKey = "wall-art" | "islamic" | "personalized" | "home" | "special"
export type WallSub = "cars" | "arabic" | "nature" | "modern"

export const CATEGORIES: { key: CategoryKey; image: string; imagePosition?: string }[] = [
  { key: "wall-art", image: MEDIA.wallArt },
  { key: "islamic", image: MEDIA.islamic },
  { key: "personalized", image: MEDIA.personalized },
  { key: "home", image: MEDIA.home },
  { key: "special", image: MEDIA.special },
]

/** Shop dropdown: every collection except Islamic (which has its own top-level link). */
export const SHOP_LINKS: CategoryKey[] = ["wall-art", "home", "personalized", "special"]

export const WALL_SUBS: WallSub[] = ["cars", "arabic", "nature", "modern"]

/** Category links from before the five-collection structure keep working. */
const LEGACY_CATEGORY: Record<string, CategoryKey> = {
  portraits: "personalized",
  gifts: "personalized",
  business: "personalized",
  custom: "personalized",
}

export function parseCategory(raw: string | null | undefined): CategoryKey | null {
  if (!raw) return null
  if (CATEGORIES.some((c) => c.key === raw)) return raw as CategoryKey
  return LEGACY_CATEGORY[raw] ?? null
}

/**
 * The database categories are free text typed in the admin ("HOME",
 * "jedaryat", "Occasions"…), so the public site sorts them into the five
 * collections by keyword, by what the piece is FOR rather than what it
 * depicts. First match wins; anything unrecognised is Wall Art, the
 * largest collection.
 */
const RULES: [CategoryKey, RegExp][] = [
  ["special", /christmas|xmas|wedding|engagement|mother|corporate|seasonal|ramadan|eid|special occasion|عيد|زفاف|خطوب/i],
  ["personalized", /portrait|face|gift|family tree|valentine|birthday|name plate|custom|بورتري|هدي/i],
  ["islamic", /islamic|quran|qur'an|dhikr|bismillah|allah|99|ayat|ayah|إسلام|قرآن|ذكر|بسم|آية/i],
  ["home", /home|kitchen|coffee|capsule|holder|hanger|organi[sz]er|incense|stand|clock|bowl|tray|keys?|shelf|accessor|منزل|مطبخ|قهوة|ساعة/i],
]

export function categorize(...fields: (string | null | undefined)[]): CategoryKey {
  const text = fields.filter(Boolean).join(" ")
  for (const [key, re] of RULES) if (re.test(text)) return key
  return "wall-art"
}

const WALL_RULES: [WallSub, RegExp][] = [
  ["cars", /cars?|motor|bike|vehicle|auto|porsche|bmw|mercedes|ferrari|سيار|دراج/i],
  ["arabic", /arab|calligraph|jedar|jedary|khat|خط|عرب|جدار/i],
  ["nature", /animal|bird|horse|lion|eagle|tree|nature|flower|leaf|wolf|deer|حيوان|طير|شجر/i],
]

export function wallSubcategory(...fields: (string | null | undefined)[]): WallSub {
  const text = fields.filter(Boolean).join(" ")
  for (const [key, re] of WALL_RULES) if (re.test(text)) return key
  return "modern"
}
