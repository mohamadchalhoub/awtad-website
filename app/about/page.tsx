"use client"

import { Navigation, CONTACT_INFO } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ContactDialog } from "@/components/contact-dialog"
import { AnimatedBackground } from "@/components/animated-background"
import { useContent } from "@/hooks/use-content"
import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { EASE, fadeUp, stagger, viewport } from "@/lib/motion"

export default function AboutPage() {
  const { content } = useContent()
  const [showContactForm, setShowContactForm] = useState(false)

  const story =
    content?.about?.story ||
    "At AWTAD we care for your customized order — to meet your imagination and make it reality. Every piece leaves the workshop having been drawn, cut and finished by hand."

  return (
    <div className="relative min-h-screen bg-background">
      <AnimatedBackground />
      <Navigation />

      {/* ============================ HERO ============================ */}
      <section className="relative px-6 pb-8 pt-36">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[460px]"
          style={{
            background:
              "radial-gradient(ellipse 60% 100% at 50% 0%, var(--primary-muted) 0%, transparent 70%)",
          }}
        />
        <motion.div
          className="shell relative text-center"
          initial="hidden"
          animate="visible"
          variants={stagger(0.07, 0.1)}
        >
          <motion.p variants={fadeUp} className="eyebrow">
            About the workshop
          </motion.p>
          <motion.h1 variants={fadeUp} className="text-headline mt-4">
            Together <span className="text-gold italic">for better</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-lede mx-auto mt-6 max-w-2xl text-muted-foreground"
          >
            A small Lebanese atelier making bespoke metal art — portraits,
            calligraphy, wall pieces and custom steel work, one commission at a
            time.
          </motion.p>
          <motion.hr variants={fadeUp} className="rule-gold mx-auto mt-10 w-28" />
        </motion.div>
      </section>

      {/* =========================== STORY ============================ */}
      <section className="section">
        <div className="shell max-w-4xl">
          <motion.div
            className="panel grain steel-texture relative overflow-hidden rounded-3xl p-9 sm:p-14"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <p className="eyebrow">Our story</p>
            <div className="relative mt-6">
              {/* Oversized opening quote, set in the display face */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-3 -top-10 select-none font-display text-[7rem] leading-none text-primary/12"
              >
                &ldquo;
              </span>
              <p className="text-lede relative whitespace-pre-line text-foreground/85">
                {story}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================== VALUES =========================== */}
      {content?.about?.values && content.about.values.length > 0 && (
        <section className="section pt-0">
          <div className="shell">
            <motion.div
              className="mx-auto max-w-2xl text-center"
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={stagger()}
            >
              <motion.p variants={fadeUp} className="eyebrow">
                What we stand for
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-headline mt-4">
                Our <span className="text-gold italic">values</span>
              </motion.h2>
            </motion.div>

            <motion.div
              className="mt-14 grid gap-6 md:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={stagger()}
            >
              {content.about.values.map((value, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-surface-1/80 p-8 text-center backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[var(--shadow-xl)]"
                >
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary/12 to-transparent opacity-0 transition-opacity duration-[var(--dur-slow)] group-hover:opacity-100" />
                  <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-2xl transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-soft)] group-hover:scale-110">
                    {value.icon}
                  </span>
                  <h3 className="relative mt-6 text-lg font-semibold text-foreground">
                    {value.title}
                  </h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ============================ TEAM ============================ */}
      {content?.about?.team && content.about.team.length > 0 && (
        <section className="section border-y border-border/50 bg-surface-1/40 backdrop-blur-sm">
          <div className="shell">
            <motion.div
              className="mx-auto max-w-2xl text-center"
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={stagger()}
            >
              <motion.p variants={fadeUp} className="eyebrow">
                The hands behind the work
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-headline mt-4">
                Our <span className="text-gold italic">team</span>
              </motion.h2>
            </motion.div>

            <motion.div
              className="mt-14 grid gap-6 md:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={stagger()}
            >
              {content.about.team.map((member, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  className="group rounded-2xl border border-border bg-surface-1 p-8 text-center transition-[transform,border-color,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[var(--shadow-xl)]"
                >
                  <span className="gold-gradient mx-auto flex h-20 w-20 items-center justify-center rounded-full p-[2px] transition-shadow duration-[var(--dur-base)] group-hover:shadow-[0_0_28px_var(--primary-glow)]">
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-surface-1 text-2xl">
                      {member.avatar}
                    </span>
                  </span>
                  <h3 className="mt-6 text-lg font-semibold text-foreground">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-primary">
                    {member.role}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {member.bio}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ========================= CONTACT CTA ======================== */}
      <section className="section">
        <div className="shell">
          <motion.div
            className="grid gap-12 lg:grid-cols-2 lg:items-center"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={stagger()}
          >
            <div>
              <motion.p variants={fadeUp} className="eyebrow">
                Commissions open
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-headline mt-4">
                Let&apos;s make{" "}
                <span className="text-gold italic">something</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-5 max-w-lg text-lg text-muted-foreground"
              >
                Send us the idea — a photograph, a name, a shape, a rough sketch.
                We&apos;ll come back with a plan, a timeline and a price.
              </motion.p>
              <motion.div variants={fadeUp}>
                <Button
                  size="lg"
                  onClick={() => setShowContactForm(true)}
                  className="gold-gradient group mt-9 h-13 rounded-full px-9 text-base text-primary-foreground shadow-[var(--shadow-lg)] transition-all duration-[var(--dur-base)] hover:shadow-[0_10px_40px_var(--primary-glow)]"
                >
                  Start a commission
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-[var(--dur-base)] group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} className="space-y-3">
              {CONTACT_INFO.map((contact) => (
                <a
                  key={contact.label}
                  href={contact.href}
                  target={contact.label === "Address" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 rounded-2xl border border-border bg-surface-1/70 p-5 backdrop-blur-sm transition-all duration-[var(--dur-base)] ease-[var(--ease-out-soft)] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-lg)]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    <contact.icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {contact.label}
                    </span>
                    <span className="mt-1 block break-words text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                      {contact.value}
                    </span>
                  </span>
                </a>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <ContactDialog open={showContactForm} onOpenChange={setShowContactForm} />

      <Footer />
    </div>
  )
}
