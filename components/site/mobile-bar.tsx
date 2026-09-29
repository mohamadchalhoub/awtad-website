"use client"

import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { useLocale } from "@/lib/i18n"
import { whatsappUrl } from "@/lib/site"

/** Thumb-reach actions on phones and tablets; hidden on desktop. */
export function MobileBar({ hideStart = false }: { hideStart?: boolean }) {
  const { t } = useLocale()
  return (
    <div className="glass fixed inset-x-0 bottom-0 z-40 border-x-0 border-b-0 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 lg:hidden">
      <div className="flex gap-3">
        {!hideStart && (
          <Link href="/customize" className="btn btn-gold flex-1">
            {t.mobileBar.start}
          </Link>
        )}
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn btn-outline ${hideStart ? "flex-1" : "px-4"}`}
          aria-label="WhatsApp AWTAD"
        >
          <MessageCircle className="h-5 w-5" />
          <span className={hideStart ? "" : "sr-only sm:not-sr-only"}>{t.mobileBar.whatsapp}</span>
        </a>
      </div>
    </div>
  )
}
