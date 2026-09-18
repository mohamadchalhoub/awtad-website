"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion"
import { useEffect, useState } from "react"
import { Menu, X, Mail, Phone, MapPin } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EASE } from "@/lib/motion"

export const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email",
    value: "husseinnouraldeen5@gmail.com",
    href: "mailto:husseinnouraldeen5@gmail.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+961 71 175 906",
    href: "tel:+96171175906",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "Beirut · Dahye · Mreijeh · Al Amir Blocks, Block F",
    href: "https://maps.app.goo.gl/1qbLxBast4tUM2YV9",
  },
]

export function Brand({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? 48 : size === "sm" ? 32 : 38
  return (
    <span className="flex items-center gap-3">
      <span
        className="relative shrink-0 overflow-hidden rounded-full ring-1 ring-primary/30 transition-shadow duration-[var(--dur-base)] group-hover/brand:shadow-[0_0_24px_var(--primary-glow)]"
        style={{ width: dim, height: dim }}
      >
        <Image
          src="/logo.jpg"
          alt="AWTAD"
          width={dim * 2}
          height={dim * 2}
          priority
          className="h-full w-full object-cover"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`text-gold font-display font-semibold tracking-[0.14em] ${
            size === "lg" ? "text-2xl" : "text-xl"
          }`}
        >
          AWTAD
        </span>
        <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Together for better
        </span>
      </span>
    </span>
  )
}

export function Navigation() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Freeze the page behind the mobile overlay.
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/about", label: "About" },
  ]

  return (
    <>
      <motion.header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-[var(--dur-slow)] ease-[var(--ease-out-soft)] ${
          isScrolled
            ? "glass border-b border-border/60 shadow-[var(--shadow-md)]"
            : "border-b border-transparent bg-transparent"
        }`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="shell flex items-center justify-between px-6 py-4">
          <Link href="/" className="group/brand">
            <Brand />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-9 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-active={pathname === item.href}
                className={`link-underline text-sm font-medium tracking-wide transition-colors duration-[var(--dur-fast)] hover:text-primary ${
                  pathname === item.href ? "text-primary" : "text-foreground/85"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gold-gradient rounded-full px-6 text-primary-foreground shadow-[var(--shadow-md)] transition-all duration-[var(--dur-base)] hover:shadow-[0_8px_30px_var(--primary-glow)]">
                  Contact
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={12}
                className="w-[22rem] rounded-2xl border-border bg-popover/95 p-2 backdrop-blur-xl"
              >
                <p className="eyebrow px-3 pb-1 pt-2">Get in touch</p>
                {CONTACT_INFO.map((contact) => (
                  <a
                    key={contact.label}
                    href={contact.href}
                    target={contact.label === "Address" ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 rounded-xl p-3 transition-colors duration-[var(--dur-fast)] hover:bg-primary/10"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                      <contact.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">
                        {contact.label}
                      </span>
                      <span className="block truncate text-sm text-muted-foreground">
                        {contact.value}
                      </span>
                    </span>
                  </a>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile trigger */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="text-foreground hover:text-primary"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Scroll progress rule */}
        <motion.div
          className="gold-gradient absolute bottom-0 left-0 h-px w-full origin-left"
          style={{ scaleX: progress }}
        />
      </motion.header>

      {/* Full-screen mobile overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-background/97 backdrop-blur-2xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <div className="flex flex-1 flex-col justify-center gap-2 px-8 pb-16 pt-24">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.06 + index * 0.06, ease: EASE }}
                >
                  <Link
                    href={item.href}
                    className={`block border-b border-border/50 py-5 font-display text-4xl transition-colors duration-[var(--dur-fast)] ${
                      pathname === item.href ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                className="mt-10 space-y-1"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.3, ease: EASE }}
              >
                <p className="eyebrow mb-4">Get in touch</p>
                {CONTACT_INFO.map((contact) => (
                  <a
                    key={contact.label}
                    href={contact.href}
                    target={contact.label === "Address" ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 rounded-xl py-3 text-muted-foreground transition-colors hover:text-primary"
                  >
                    <contact.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm">{contact.value}</span>
                  </a>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
