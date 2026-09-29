"use client"

import { ArrowRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { PageShell } from "@/components/site/page-shell"
import { Reveal } from "@/components/site/reveal"
import { useLocale } from "@/lib/i18n"
import { ADDRESS, EMAIL, MAPS_URL, PHONE_DISPLAY, PHONE_HREF, whatsappUrl } from "@/lib/site"

export default function ContactPage() {
  const { t } = useLocale()
  const c = t.contact
  const rows = [
    { icon: Phone, label: c.phone, value: PHONE_DISPLAY, href: PHONE_HREF, ltr: true },
    { icon: Mail, label: c.email, value: EMAIL, href: `mailto:${EMAIL}`, ltr: true },
    { icon: MapPin, label: c.visit, value: ADDRESS, href: MAPS_URL, external: true, action: c.directions },
  ]
  return (
    <PageShell>
      <section className="section">
        <div className="shell grid gap-14 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <p className="eyebrow">{c.eyebrow}</p>
            <h1 className="text-display mt-5">{c.title}</h1>
            <p className="text-lede mt-6 max-w-md text-muted-foreground">{c.body}</p>
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-gold group mt-10">
              <MessageCircle className="h-4 w-4" />
              {c.whatsapp}
              <ArrowRight className="arrow h-4 w-4" />
            </a>
            <p className="mt-4 text-sm text-muted-foreground">{c.hours}</p>
          </Reveal>
          <ul className="border-t border-border lg:mt-16">
            {rows.map((r, i) => (
              <Reveal as="li" key={r.label} delay={i * 0.05} className="border-b border-border">
                <a
                  href={r.href}
                  {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex min-h-20 items-center gap-5 py-5"
                >
                  <r.icon className="h-5 w-5 shrink-0 text-gold-ink" strokeWidth={1.5} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs uppercase tracking-[0.18em] text-muted-foreground">{r.label}</span>
                    <span className="mt-1 block break-words text-lg" dir={r.ltr ? "ltr" : undefined} style={{ textAlign: "start" }}>{r.value}</span>
                  </span>
                  <ArrowRight className="arrow h-4 w-4 shrink-0 text-muted-foreground" />
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  )
}
