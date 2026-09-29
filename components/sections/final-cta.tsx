"use client"

import Link from "next/link"
import { ArrowRight, MessageCircle } from "lucide-react"
import { Reveal } from "@/components/site/reveal"
import { Mark } from "@/components/site/logo"
import { useLocale } from "@/lib/i18n"
import { whatsappUrl } from "@/lib/site"

export function FinalCta() {
  const { t } = useLocale()
  return (
    <section className="theme-dark section relative overflow-hidden border-t border-border">
      <Mark className="pointer-events-none absolute -bottom-16 end-[-3rem] h-[26rem] w-auto text-gold opacity-[0.05] sm:h-[34rem]" title="" />
      <Reveal className="shell relative text-center">
        <p className="text-lede text-muted-foreground">{t.cta.titleA}</p>
        <h2 className="text-display mx-auto mt-5 max-w-4xl">
          <span className="font-editorial">{t.cta.titleB}</span>
        </h2>
        <div className="mt-12 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link href="/customize" className="btn btn-gold group">
            {t.cta.start}
            <ArrowRight className="arrow h-4 w-4" />
          </Link>
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            <MessageCircle className="h-4 w-4" />
            {t.cta.whatsapp}
          </a>
        </div>
      </Reveal>
    </section>
  )
}
