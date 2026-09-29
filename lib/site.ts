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

export const NAV = [
  { href: "/", key: "home" },
  { href: "/projects", key: "work" },
  { href: "/customize", key: "customize" },
  { href: "/how-its-made", key: "process" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const

/**
 * Real AWTAD photographs chosen for the brand sections, served from /public
 * at web size. Replace with dedicated workshop / laser-cutting photography
 * when it is available.
 */
export const MEDIA = {
  hero: "/media/hero.jpg",
  wallArt: "/media/wall-art.jpg",
  portrait: "/media/portrait.jpg",
  gift: "/media/gift.jpg",
  business: "/media/business.jpg",
  custom: "/media/custom.jpg",
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

export type CategoryKey = "wall-art" | "portraits" | "gifts" | "business" | "custom"

export const CATEGORIES: { key: CategoryKey; image: string }[] = [
  { key: "wall-art", image: MEDIA.wallArt },
  { key: "portraits", image: MEDIA.portrait },
  { key: "gifts", image: MEDIA.gift },
  { key: "business", image: MEDIA.business },
  { key: "custom", image: MEDIA.custom },
]

/**
 * The database categories are free text typed in the admin ("HOME",
 * "jedaryat", "Occasions"…), so the public site groups them into the five
 * brand categories by keyword. First match wins; everything else is Custom.
 */
const RULES: [CategoryKey, RegExp][] = [
  ["portraits", /portrait|sayed|hassan|hashem|face|بورتري/i],
  ["gifts", /gift|occasion|family tree|valentine|birthday|هدي/i],
  ["business", /logo|brand|business|sign|office|corporate|شعار/i],
  ["wall-art", /wall|islamic|jedar|calligraph|99|clock|car\b|جدار|خط/i],
]

export function categorize(...fields: (string | null | undefined)[]): CategoryKey {
  const text = fields.filter(Boolean).join(" ")
  for (const [key, re] of RULES) if (re.test(text)) return key
  return "custom"
}
