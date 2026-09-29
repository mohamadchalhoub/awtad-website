"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Menu, MessageCircle, X } from "lucide-react"
import { Logo } from "@/components/site/logo"
import { useLocale } from "@/lib/i18n"
import { NAV, whatsappUrl } from "@/lib/site"
import { EASE } from "@/lib/motion"
import { cn } from "@/lib/utils"

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale()
  return (
    <div
      className={cn("flex items-center rounded-full border border-current/20 p-0.5 text-xs font-semibold", className)}
      role="group"
      aria-label="Language"
      dir="ltr"
    >
      {(["ar", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={cn(
            "min-h-8 min-w-9 rounded-full px-2.5 tracking-wider transition-colors duration-[var(--dur-fast)]",
            locale === l ? "bg-gold text-charcoal" : "opacity-70 hover:opacity-100"
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

/**
 * `overlay` pages open on a dark full-bleed image: the header starts
 * transparent with light type and becomes a solid bar once scrolled.
 */
export function Header({ overlay = false }: { overlay?: boolean }) {
  const pathname = usePathname()
  const { t } = useLocale()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const transparent = overlay && !scrolled

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,color] duration-[var(--dur-slow)] ease-[var(--ease-out-soft)]",
          transparent
            ? "theme-dark border-b border-transparent !bg-transparent"
            : "glass border-x-0 border-t-0 text-foreground"
        )}
      >
        <div className="shell flex h-[var(--header-h)] items-center justify-between gap-6 px-4 sm:px-6">
          <Link href="/" aria-label="AWTAD — Home" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-7 xl:flex" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive(pathname, item.href)}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className={cn(
                  "link-underline text-sm font-medium transition-opacity duration-[var(--dur-fast)]",
                  isActive(pathname, item.href) ? "opacity-100" : "opacity-75 hover:opacity-100"
                )}
              >
                {t.nav[item.key]}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 xl:flex">
            <LanguageToggle />
            <Link href="/customize" className="btn btn-gold group min-h-10 px-5 text-sm">
              {t.nav.start}
              <ArrowRight className="arrow h-4 w-4" />
            </Link>
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <LanguageToggle className="hidden sm:flex" />
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t.nav.menu}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="-me-2 flex h-11 w-11 items-center justify-center rounded-full"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.menu}
            className="theme-dark fixed inset-0 z-[60] flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <div className="flex h-[var(--header-h)] items-center justify-between px-4 sm:px-6">
              <Link href="/" onClick={() => setOpen(false)} aria-label="AWTAD — Home">
                <Logo />
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.nav.close}
                className="-me-2 flex h-11 w-11 items-center justify-center rounded-full"
                autoFocus
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 pt-6 sm:px-6" aria-label="Main">
              <ul>
                {NAV.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.03 * i, ease: EASE }}
                    className="border-b border-border"
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive(pathname, item.href) ? "page" : undefined}
                      className="flex min-h-16 items-center justify-between text-2xl font-medium tracking-tight"
                    >
                      {t.nav[item.key]}
                      {isActive(pathname, item.href) && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <div className="space-y-3 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 sm:px-6">
              <LanguageToggle className="mb-5 w-fit" />
              <Link href="/customize" onClick={() => setOpen(false)} className="btn btn-gold group w-full">
                {t.nav.start}
                <ArrowRight className="arrow h-4 w-4" />
              </Link>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full">
                <MessageCircle className="h-4 w-4" />
                {t.mobileBar.whatsapp}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
