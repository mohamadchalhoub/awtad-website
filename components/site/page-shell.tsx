import { Header } from "@/components/site/header"
import { Footer } from "@/components/site/footer"
import { MobileBar } from "@/components/site/mobile-bar"

export function PageShell({
  children,
  overlay = false,
  hideStart = false,
}: {
  children: React.ReactNode
  /** Page opens on a dark full-bleed image. */
  overlay?: boolean
  /** Hide the mobile "Start" action (e.g. on the Customize page itself). */
  hideStart?: boolean
}) {
  return (
    <div className="pb-mobile-bar min-h-screen bg-background">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[70] focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-charcoal">
        Skip to content
      </a>
      <Header overlay={overlay} />
      <main id="main" className={overlay ? "" : "pt-[var(--header-h)]"}>
        {children}
      </main>
      <Footer />
      <MobileBar hideStart={hideStart} />
    </div>
  )
}
