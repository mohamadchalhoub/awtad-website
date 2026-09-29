"use client"

import Link from "next/link"
import { Mark } from "@/components/site/logo"
import { useLocale } from "@/lib/i18n"
import { ADDRESS, EMAIL, MAPS_URL, NAV, PHONE_DISPLAY, PHONE_HREF, whatsappUrl } from "@/lib/site"

export function Footer() {
  const { t } = useLocale()
  return (
    <footer className="theme-dark border-t border-border px-4 pb-10 pt-16 sm:px-6">
      <div className="shell grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Mark className="h-16 w-auto text-gold" />
          <p className="mt-6 max-w-xs text-lg">{t.footer.tagline}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-arabic" dir="rtl" lang="ar">البساطة في الفكرة، والدقة في التنفيذ.</span>
          </p>
        </div>
        <div>
          <p className="eyebrow">{t.footer.explore}</p>
          <ul className="mt-5 space-y-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="inline-flex min-h-10 items-center text-muted-foreground transition-colors hover:text-foreground">
                  {t.nav[n.key]}
                </Link>
              </li>
            ))}
            {[{ href: "/customize", label: t.nav.customize }, { href: "/how-its-made", label: t.nav.process }].map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="inline-flex min-h-10 items-center text-muted-foreground transition-colors hover:text-foreground">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">{t.footer.reach}</p>
          <ul className="mt-5 space-y-1 text-muted-foreground">
            <li><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center hover:text-foreground">WhatsApp</a></li>
            <li><a href={PHONE_HREF} className="inline-flex min-h-10 items-center hover:text-foreground" dir="ltr">{PHONE_DISPLAY}</a></li>
            <li><a href={`mailto:${EMAIL}`} className="inline-flex min-h-10 items-center break-all hover:text-foreground">{EMAIL}</a></li>
            <li><a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center py-2 hover:text-foreground">{ADDRESS}</a></li>
          </ul>
        </div>
      </div>
      <div className="shell mt-14 flex flex-col gap-2 border-t border-border pt-6 text-xs text-subtle-foreground sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} AWTAD. {t.footer.rights}</p>
        <p className="tracking-[0.25em]" dir="ltr">TOGETHER FOR BETTER</p>
      </div>
    </footer>
  )
}
