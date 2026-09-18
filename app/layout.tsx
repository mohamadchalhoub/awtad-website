import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Cormorant_Garamond } from "next/font/google"
import { ContentProvider } from "@/hooks/use-content"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { PerformanceMonitor } from "@/components/performance-monitor"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

// High-contrast serif for headings — reads as gallery/atelier rather than
// the sci-fi register the previous Orbitron display face carried.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-cormorant",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://awtad.com"),
  title: {
    default: "AWTAD — Bespoke Metal Craft",
    template: "%s · AWTAD",
  },
  description:
    "AWTAD crafts bespoke metal artistry — portraits, wall art, calligraphy and custom steel work. Together for better.",
  keywords: [
    "metal art",
    "steel design",
    "metal portrait",
    "calligraphy",
    "custom metalwork",
    "Lebanon",
    "AWTAD",
  ],
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "AWTAD — Bespoke Metal Craft",
    description:
      "Bespoke metal artistry, crafted to meet your imagination. Together for better.",
    images: ["/logo.jpg"],
    type: "website",
  },
  generator: "",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#1a1613" },
    { media: "(prefers-color-scheme: light)", color: "#faf8f4" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <head>
        <style>{`
html {
  --font-sans: ${inter.style.fontFamily};
  --font-display: ${cormorant.style.fontFamily};
  --font-mono: ${cormorant.style.fontFamily};
}
        `}</style>
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ContentProvider>{children}</ContentProvider>
          <Toaster />
          <PerformanceMonitor />
        </ThemeProvider>
      </body>
    </html>
  )
}
