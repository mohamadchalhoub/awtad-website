import type React from "react"
import type { Metadata, Viewport } from "next"
import { cookies } from "next/headers"
import { Manrope, Instrument_Serif, Tajawal } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { PerformanceMonitor } from "@/components/performance-monitor"
import { LocaleProvider } from "@/lib/i18n"
import { LOCALE_COOKIE, type Locale } from "@/lib/locale"
import "./globals.css"

// Contemporary sans for UI and most headings.
const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
})

// High-contrast serif, used sparingly for selected editorial words.
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument",
})

// Readable contemporary Arabic, paired with Manrope's proportions.
const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-tajawal",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://awtad.com"),
  title: {
    default: "AWTAD — Ideas Crafted in Metal",
    template: "%s · AWTAD",
  },
  description:
    "AWTAD designs and fabricates bespoke laser-cut metal pieces in Beirut — wall art, portraits, personalised gifts and branding. Simple in concept, precise in execution.",
  keywords: ["metal art", "laser cut", "metal portrait", "Arabic calligraphy", "custom metalwork", "Lebanon", "AWTAD"],
  openGraph: {
    title: "AWTAD — Ideas Crafted in Metal",
    description: "Bespoke laser-cut metal pieces, designed and made in Beirut.",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#121212",
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale: Locale = (await cookies()).get(LOCALE_COOKIE)?.value === "ar" ? "ar" : "en"

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${manrope.variable} ${instrument.variable} ${tajawal.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Portfolio data and photos come from these hosts; open the connections early. */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="" />
        <style>{`
html {
  --font-sans: ${manrope.style.fontFamily};
  --font-display: ${instrument.style.fontFamily};
  --font-arabic: ${tajawal.style.fontFamily};
}
        `}</style>
      </head>
      <body className="antialiased">
        <LocaleProvider initialLocale={locale}>
          {children}
        </LocaleProvider>
        <Toaster />
        <PerformanceMonitor />
      </body>
    </html>
  )
}
