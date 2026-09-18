"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ContactDialog } from "@/components/contact-dialog"
import { Brand, CONTACT_INFO } from "@/components/navigation"
import { ArrowUpRight } from "lucide-react"

const SOCIALS = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/awt_ad?igsh=Z2FzdjBnaGpjaXlv",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/14JyaT3iyVX/",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
]

export function Footer() {
  const [showContactForm, setShowContactForm] = useState(false)

  return (
    <>
      <footer className="relative mt-auto border-t border-border/60 bg-surface-1/60 backdrop-blur-sm">
        {/* Gold hairline capping the footer */}
        <div className="gold-gradient absolute inset-x-0 top-0 h-px opacity-45" />

        <div className="shell px-6 py-16">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
            {/* Brand + social */}
            <div>
              <Link href="/" className="group/brand inline-block">
                <Brand size="lg" />
              </Link>
              <p className="mt-6 max-w-sm leading-relaxed text-muted-foreground">
                Bespoke metal artistry from Beirut — portraits, calligraphy,
                wall art and custom steel work, made to meet your imagination.
              </p>

              <div className="mt-7 flex gap-3">
                {SOCIALS.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    title={social.name}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-[var(--dur-base)] ease-[var(--ease-out-soft)] hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="eyebrow">Contact</h3>
              <ul className="mt-5 space-y-4">
                {CONTACT_INFO.map((contact) => (
                  <li key={contact.label}>
                    <a
                      href={contact.href}
                      target={contact.label === "Address" ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      <contact.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary/70 transition-colors group-hover:text-primary" />
                      <span className="break-words">{contact.value}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="eyebrow">Explore</h3>
              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  <Link
                    href="/"
                    className="link-underline inline-block text-muted-foreground transition-colors hover:text-primary"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/projects"
                    className="link-underline inline-block text-muted-foreground transition-colors hover:text-primary"
                  >
                    Projects
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="link-underline inline-block text-muted-foreground transition-colors hover:text-primary"
                  >
                    About
                  </Link>
                </li>
              </ul>

              <Button
                onClick={() => setShowContactForm(true)}
                className="gold-gradient group mt-8 h-10 rounded-full px-6 text-sm text-primary-foreground shadow-[var(--shadow-md)] transition-shadow hover:shadow-[0_8px_30px_var(--primary-glow)]"
              >
                Start a commission
                <ArrowUpRight className="ml-1.5 h-4 w-4 transition-transform duration-[var(--dur-base)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} AWTAD. All rights reserved.
            </p>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground/70">
              Together for better
            </p>
          </div>
        </div>
      </footer>

      <ContactDialog open={showContactForm} onOpenChange={setShowContactForm} />
    </>
  )
}
