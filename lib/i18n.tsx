"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"

/**
 * Two-language copy for the public site.
 *
 * The locale lives in a cookie so the server can render <html lang dir>
 * correctly on the first byte — no flash of left-to-right Arabic.
 * Project titles and descriptions come from the database and are shown
 * as entered.
 *
 * The Arabic copy should be reviewed by a native speaker on the AWTAD team
 * before launch.
 */

import { LOCALE_COOKIE, type Locale } from "@/lib/locale"
export type { Locale }

const en = {
  nav: {
    home: "Home",
    work: "Our Work",
    customize: "Customize",
    process: "How It’s Made",
    about: "About",
    contact: "Contact",
    start: "Start Your Project",
    menu: "Menu",
    close: "Close",
    language: "العربية",
    languageShort: "AR",
  },
  hero: {
    titleA: "Ideas Crafted",
    titleB: "in Metal.",
    arabicLine: "البساطة في الفكرة، والدقة في التنفيذ.",
    primary: "Explore Our Work",
    secondary: "Create Your Piece",
    scroll: "Scroll",
  },
  create: {
    eyebrow: "AWTAD",
    title: "What We Create",
    body: "From personal ideas to statement pieces.",
  },
  categories: {
    "wall-art": "Wall Art",
    portraits: "Portraits",
    gifts: "Personalized Gifts",
    business: "Business & Branding",
    custom: "Custom Creations",
  },
  work: {
    title: "Selected Work",
    body: "A collection of our favorite projects.",
    viewAll: "View All Projects",
    pageTitle: "Our Work",
    pageBody: "Every piece begins as someone’s idea. Browse by what you are looking for.",
    all: "All",
    empty: "Nothing here yet — new pieces are added as they leave the workshop.",
    pieces: "pieces",
    collection: "Collection",
  },
  journey: {
    titleA: "From Idea",
    titleB: "To Design",
    titleC: "To Metal",
    body: "One real project, from the photo a client sent us to the piece on their wall.",
    steps: [
      { n: "01", title: "Your Idea", sub: "Photo or Sketch" },
      { n: "02", title: "Our Design", sub: "Vector Development" },
      { n: "03", title: "We Craft", sub: "Precision Laser Cut" },
      { n: "04", title: "The Result", sub: "Final Piece" },
    ],
    cta: "Start with your idea",
  },
  process: {
    eyebrow: "Process",
    title: "How Your Piece Comes to Life",
    steps: [
      { n: "01", title: "Your Idea", body: "Send a photo, sketch, logo or a few words." },
      { n: "02", title: "We Design", body: "We turn it into a clean vector ready for steel." },
      { n: "03", title: "You Approve", body: "You see the design and size before anything is cut." },
      { n: "04", title: "We Craft", body: "Laser cut, finished and coated in our workshop." },
      { n: "05", title: "Ready", body: "Delivered ready to hang, place or give." },
    ],
    promise: "Nothing goes into production before your approval.",
  },
  precision: {
    eyebrow: "Material",
    title: "Made With Precision",
    specs: [
      { value: "2 mm", label: "Steel" },
      { value: "Precision", label: "Laser Cut" },
      { value: "Powder Coated", label: "Finish" },
      { value: "2 cm", label: "Wall Stand-Off" },
    ],
  },
  cta: {
    titleA: "Have something in mind?",
    titleB: "Let’s turn it into metal.",
    start: "Start Your Project",
    whatsapp: "WhatsApp AWTAD",
  },
  project: {
    back: "All work",
    idea: "The Idea",
    design: "The Design",
    craft: "The Craft",
    result: "The Result",
    next: "Next project",
    inspired: "Inspired by this project?",
    createOwn: "Create Your Own",
    order: "Order on WhatsApp",
    orderShort: "Order this",
    notFound: "We couldn’t find this project.",
    inCollection: "In this collection",
    view: "View",
    photos: "photos",
  },
  customize: {
    eyebrow: "Customize",
    titleA: "Your Idea.",
    titleB: "Our Craft.",
    intro: "Tell us what you have in mind. It takes about two minutes, and nothing is made until you approve the design.",
    step: "Step",
    of: "of",
    back: "Back",
    next: "Continue",
    skip: "Skip for now",
    q1: "What would you like to create?",
    types: {
      "wall-art": "Wall Art",
      portrait: "Portrait",
      gift: "Personalized Gift",
      business: "Logo / Business",
      calligraphy: "Arabic Calligraphy",
      other: "Other",
    },
    q2: "Tell us about your idea.",
    ideaPlaceholder: "A name, a quote, a place, a photo you love — whatever you have in mind.",
    uploadTitle: "Add a reference",
    uploadHint: "Photo, screenshot, sketch, logo or PDF · up to 10 MB each",
    uploadCta: "Choose files",
    uploading: "Uploading…",
    uploadFailed: "Couldn’t upload this file. Try again, or send it on WhatsApp.",
    remove: "Remove",
    q3: "Size and finish",
    sizeLabel: "Approximate size",
    width: "Width",
    height: "Height",
    cm: "cm",
    sizeHint: "Not sure? Leave it empty — we’ll suggest a size.",
    finishLabel: "Finish",
    finishes: { black: "Matte Black", gold: "Gold", other: "Other", unsure: "Not Sure" },
    q4: "How can we reach you?",
    name: "Name",
    whatsapp: "WhatsApp",
    email: "Email",
    optional: "optional",
    send: "Send My Idea",
    continueWa: "Continue on WhatsApp",
    required: "Please fill this in.",
    phoneInvalid: "Please enter a WhatsApp number we can reach.",
    doneTitle: "Your idea is on its way.",
    doneBody: "WhatsApp opened with everything you told us. Press send there and we’ll reply with a first design direction, usually within a day.",
    doneAgain: "WhatsApp didn’t open?",
    doneRetry: "Open WhatsApp again",
    doneNew: "Start another idea",
    summary: "Summary",
  },
  about: {
    eyebrow: "About",
    title: "A design atelier backed by a real workshop.",
    body: "AWTAD designs and fabricates metal pieces in Beirut. Every piece is drawn by hand, cut with a laser, finished in our workshop and made for one person.",
    principle: "Simple in concept. Precise in execution.",
    valuesTitle: "What we care about",
    values: [
      { title: "Clarity", body: "One clear idea per piece. If a line doesn’t help, it goes." },
      { title: "Precision", body: "Laser-cut steel, measured to the millimetre and finished by hand." },
      { title: "Collaboration", body: "You approve the design before anything is made. Together for better." },
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Let’s talk about your piece.",
    body: "The fastest way to reach us is WhatsApp. Send a photo of your idea and we’ll take it from there.",
    whatsapp: "Message us on WhatsApp",
    phone: "Phone",
    email: "Email",
    visit: "Workshop",
    directions: "Get directions",
    hours: "We usually reply within a few hours.",
  },
  footer: {
    tagline: "Ideas crafted in metal.",
    explore: "Explore",
    reach: "Reach us",
    rights: "All rights reserved.",
  },
  mobileBar: { start: "Start Your Project", whatsapp: "WhatsApp" },
}

type Dict = typeof en

const ar: Dict = {
  nav: {
    home: "الرئيسية",
    work: "أعمالنا",
    customize: "صمّم قطعتك",
    process: "كيف نصنعها",
    about: "من نحن",
    contact: "تواصل معنا",
    start: "ابدأ مشروعك",
    menu: "القائمة",
    close: "إغلاق",
    language: "English",
    languageShort: "EN",
  },
  hero: {
    titleA: "أفكار تُصاغ",
    titleB: "من المعدن.",
    arabicLine: "Simple in concept. Precise in execution.",
    primary: "استكشف أعمالنا",
    secondary: "صمّم قطعتك",
    scroll: "مرّر",
  },
  create: {
    eyebrow: "أوتاد",
    title: "ماذا نصنع",
    body: "من الفكرة الشخصية إلى القطعة التي تلفت الأنظار.",
  },
  categories: {
    "wall-art": "لوحات جدارية",
    portraits: "بورتريه",
    gifts: "هدايا مخصّصة",
    business: "أعمال وهويّات",
    custom: "تصاميم خاصة",
  },
  work: {
    title: "أعمال مختارة",
    body: "مجموعة من المشاريع الأقرب إلينا.",
    viewAll: "عرض كل المشاريع",
    pageTitle: "أعمالنا",
    pageBody: "كل قطعة تبدأ بفكرة شخص ما. تصفّح حسب ما تبحث عنه.",
    all: "الكل",
    empty: "لا شيء هنا بعد — نضيف القطع الجديدة فور خروجها من الورشة.",
    pieces: "قطع",
    collection: "مجموعة",
  },
  journey: {
    titleA: "من الفكرة",
    titleB: "إلى التصميم",
    titleC: "إلى المعدن",
    body: "مشروع حقيقي، من الصورة التي أرسلها العميل إلى القطعة على جداره.",
    steps: [
      { n: "01", title: "فكرتك", sub: "صورة أو رسمة" },
      { n: "02", title: "تصميمنا", sub: "تطوير رسم فكتور" },
      { n: "03", title: "نصنعها", sub: "قصّ ليزر دقيق" },
      { n: "04", title: "النتيجة", sub: "القطعة النهائية" },
    ],
    cta: "ابدأ بفكرتك",
  },
  process: {
    eyebrow: "المراحل",
    title: "كيف تولد قطعتك",
    steps: [
      { n: "01", title: "فكرتك", body: "أرسل صورة أو رسمة أو شعاراً أو بضع كلمات." },
      { n: "02", title: "نصمّم", body: "نحوّلها إلى تصميم فكتور نظيف جاهز للمعدن." },
      { n: "03", title: "توافق", body: "ترى التصميم والمقاس قبل أي قصّ." },
      { n: "04", title: "نصنع", body: "قصّ بالليزر وتشطيب وطلاء في ورشتنا." },
      { n: "05", title: "جاهزة", body: "تصلك جاهزة للتعليق أو الوضع أو الإهداء." },
    ],
    promise: "لا شيء يدخل الإنتاج قبل موافقتك.",
  },
  precision: {
    eyebrow: "الخامة",
    title: "مصنوعة بدقّة",
    specs: [
      { value: "٢ مم", label: "فولاذ" },
      { value: "قصّ ليزر", label: "دقيق" },
      { value: "طلاء بودرة", label: "تشطيب" },
      { value: "٢ سم", label: "بُعد عن الحائط" },
    ],
  },
  cta: {
    titleA: "في بالك فكرة؟",
    titleB: "لنحوّلها إلى معدن.",
    start: "ابدأ مشروعك",
    whatsapp: "راسل أوتاد على واتساب",
  },
  project: {
    back: "كل الأعمال",
    idea: "الفكرة",
    design: "التصميم",
    craft: "الصناعة",
    result: "النتيجة",
    next: "المشروع التالي",
    inspired: "ألهمك هذا المشروع؟",
    createOwn: "اصنع قطعتك",
    order: "اطلبها عبر واتساب",
    orderShort: "اطلب هذه",
    notFound: "لم نجد هذا المشروع.",
    inCollection: "ضمن هذه المجموعة",
    view: "عرض",
    photos: "صور",
  },
  customize: {
    eyebrow: "صمّم قطعتك",
    titleA: "فكرتك.",
    titleB: "صنعتنا.",
    intro: "أخبرنا بما في بالك. يستغرق الأمر دقيقتين تقريباً، ولا نصنع شيئاً قبل موافقتك على التصميم.",
    step: "الخطوة",
    of: "من",
    back: "رجوع",
    next: "متابعة",
    skip: "تخطَّ الآن",
    q1: "ماذا تريد أن تصنع؟",
    types: {
      "wall-art": "لوحة جدارية",
      portrait: "بورتريه",
      gift: "هدية مخصّصة",
      business: "شعار / أعمال",
      calligraphy: "خط عربي",
      other: "غير ذلك",
    },
    q2: "أخبرنا عن فكرتك.",
    ideaPlaceholder: "اسم، عبارة، مكان، صورة تحبها — أي شيء في بالك.",
    uploadTitle: "أضف مرجعاً",
    uploadHint: "صورة، لقطة شاشة، رسمة، شعار أو PDF · حتى ١٠ ميغابايت لكل ملف",
    uploadCta: "اختر ملفات",
    uploading: "جارٍ الرفع…",
    uploadFailed: "تعذّر رفع هذا الملف. حاول مجدداً أو أرسله على واتساب.",
    remove: "إزالة",
    q3: "المقاس والتشطيب",
    sizeLabel: "المقاس التقريبي",
    width: "العرض",
    height: "الارتفاع",
    cm: "سم",
    sizeHint: "لست متأكداً؟ اتركه فارغاً وسنقترح مقاساً.",
    finishLabel: "التشطيب",
    finishes: { black: "أسود مطفي", gold: "ذهبي", other: "غير ذلك", unsure: "لست متأكداً" },
    q4: "كيف نتواصل معك؟",
    name: "الاسم",
    whatsapp: "واتساب",
    email: "البريد الإلكتروني",
    optional: "اختياري",
    send: "أرسل فكرتي",
    continueWa: "تابع على واتساب",
    required: "يرجى تعبئة هذا الحقل.",
    phoneInvalid: "يرجى إدخال رقم واتساب صحيح.",
    doneTitle: "فكرتك في الطريق إلينا.",
    doneBody: "فُتح واتساب ومعه كل ما أخبرتنا به. اضغط إرسال هناك وسنعود إليك باقتراح تصميم أوّلي، عادةً خلال يوم.",
    doneAgain: "لم يُفتح واتساب؟",
    doneRetry: "افتح واتساب مجدداً",
    doneNew: "ابدأ فكرة أخرى",
    summary: "الملخّص",
  },
  about: {
    eyebrow: "من نحن",
    title: "استوديو تصميم تدعمه ورشة حقيقية.",
    body: "تصمّم أوتاد القطع المعدنية وتصنعها في بيروت. كل قطعة تُرسم يدوياً، وتُقصّ بالليزر، وتُشطَّب في ورشتنا، وتُصنع لشخص واحد.",
    principle: "البساطة في الفكرة، والدقة في التنفيذ.",
    valuesTitle: "ما يهمّنا",
    values: [
      { title: "الوضوح", body: "فكرة واحدة واضحة لكل قطعة. أي خط لا يخدمها نحذفه." },
      { title: "الدقة", body: "فولاذ مقصوص بالليزر، مقاس بالمليمتر ومشطّب يدوياً." },
      { title: "الشراكة", body: "توافق على التصميم قبل أن نصنع أي شيء. معاً للأفضل." },
    ],
  },
  contact: {
    eyebrow: "تواصل معنا",
    title: "لنتحدث عن قطعتك.",
    body: "أسرع طريقة للوصول إلينا هي واتساب. أرسل صورة لفكرتك ونتابع معك من هناك.",
    whatsapp: "راسلنا على واتساب",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    visit: "الورشة",
    directions: "الاتجاهات",
    hours: "نرد عادةً خلال ساعات قليلة.",
  },
  footer: {
    tagline: "أفكار تُصاغ من المعدن.",
    explore: "استكشف",
    reach: "تواصل",
    rights: "جميع الحقوق محفوظة.",
  },
  mobileBar: { start: "ابدأ مشروعك", whatsapp: "واتساب" },
}

const DICTS: Record<Locale, Dict> = { en, ar }

interface LocaleContextValue {
  locale: Locale
  t: Dict
  dir: "ltr" | "rtl"
  setLocale: (l: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale
  children: React.ReactNode
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`
  }, [])

  useEffect(() => {
    const html = document.documentElement
    html.lang = locale
    html.dir = locale === "ar" ? "rtl" : "ltr"
  }, [locale])

  return (
    <LocaleContext.Provider
      value={{ locale, t: DICTS[locale], dir: locale === "ar" ? "rtl" : "ltr", setLocale }}
    >
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>")
  return ctx
}
