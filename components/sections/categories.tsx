"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Reveal } from "@/components/site/reveal"
import { SmartImage } from "@/components/smart-image"
import { SectionHeading } from "@/components/sections/section-heading"
import { useLocale } from "@/lib/i18n"
import { CATEGORIES } from "@/lib/site"
import { cn } from "@/lib/utils"

/** Five large photographs, almost no copy. First card spans two rows on desktop. */
export function CategoriesSection() {
  const { t } = useLocale()
  return (
    <section className="section" aria-labelledby="create-title">
      <div className="shell">
        <SectionHeading eyebrow={t.create.eyebrow} title={<span id="create-title">{t.create.title}</span>} body={t.create.body} />
        {/* Equal portrait tiles: close to the photos' own shape, so nothing looks zoomed in. */}
        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5">
          {CATEGORIES.map((c, i) => (
            <Reveal as="li" key={c.key} delay={i * 0.05} className={cn(i === 0 && "col-span-2 md:col-span-1")}>
              <Link
                href={`/projects?category=${c.key}`}
                className={cn(
                  "group relative block overflow-hidden rounded-[var(--radius)] bg-surface-2",
                  i === 0 ? "aspect-[4/3] md:aspect-[4/5]" : "aspect-[4/5]"
                )}
              >
                <SmartImage
                  src={c.image}
                  alt=""
                  quality={72}
                  sizes={i === 0 ? "(min-width:768px) 20vw, 100vw" : "(min-width:768px) 20vw, 50vw"}
                  className="zoom-media object-cover"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/5 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 text-off-white sm:p-5">
                  <span className={cn("font-medium leading-tight", i === 0 ? "text-xl sm:text-lg" : "text-sm sm:text-lg")}>
                    {t.categories[c.key]}
                  </span>
                  <ArrowRight className="arrow h-5 w-5 shrink-0 text-gold" />
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
