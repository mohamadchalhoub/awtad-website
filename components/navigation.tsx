"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion, useScroll, useTransform } from "framer-motion"
import { useEffect, useState } from "react"
import { Menu, X, Mail, Phone, MapPin } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navigation() {
  const pathname = usePathname()
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Transform scroll values for background opacity
  const backgroundOpacity = useTransform(scrollY, [0, 100], [0, 0.9])
  const backdropBlur = useTransform(scrollY, [0, 100], [0, 10])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/about", label: "About Us" },
  ]

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "info@awtad.com",
      href: "mailto:info@awtad.com"
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+1 (555) 123-4567",
      href: "tel:+15551234567"
    },
    {
      icon: MapPin,
      label: "Address",
      value: "123 Steel Street, Engineering District, City, Country",
      href: "https://maps.google.com"
    }
  ]

  return (
    <>
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-50 border-b border-border/20 transition-all duration-300 ${
          isScrolled 
            ? 'bg-background/90 backdrop-blur-md' 
            : 'bg-background/10 backdrop-blur-sm'
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 gold-gradient rounded-sm flex items-center justify-center shadow-lg glow-gold">
                  <span className="text-black font-mono font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-mono font-bold text-shadow-gold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">AWTAD</span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className={`text-sm font-medium transition-all duration-300 hover:text-primary relative ${
                      pathname === item.href ? "text-primary text-shadow-gold" : "text-foreground"
                    }`}
                  >
                    {item.label}
                    {pathname === item.href && (
                      <motion.div
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-500"
                        layoutId="activeTab"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Desktop Actions */}
            <motion.div 
              className="hidden md:flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="gold-gradient text-primary-foreground hover:opacity-90 transition-opacity shadow-lg">
                      Contact Us
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground mb-3">Get in Touch</h3>
                    {contactInfo.map((contact, index) => (
                      <motion.div
                        key={contact.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <a
                          href={contact.href}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex-shrink-0">
                            <contact.icon className="h-5 w-5 text-primary group-hover:text-primary/80 transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{contact.label}</p>
                            <p className="text-sm text-muted-foreground truncate">{contact.value}</p>
                          </div>
                        </a>
                      </motion.div>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-foreground hover:text-primary"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <motion.div
        className={`fixed inset-0 z-40 md:hidden ${
          isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isMobileMenuOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Menu Content */}
        <motion.div
          className="absolute top-0 right-0 h-full w-80 bg-background/95 backdrop-blur-md border-l border-border/20 shadow-xl"
          initial={{ x: '100%' }}
          animate={{ x: isMobileMenuOpen ? 0 : '100%' }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="p-6">
            {/* Mobile Logo */}
            <div className="flex items-center space-x-2 mb-8">
              <div className="w-8 h-8 gold-gradient rounded-sm flex items-center justify-center shadow-lg glow-gold">
                <span className="text-black font-mono font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-mono font-bold text-shadow-gold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">AWTAD</span>
            </div>

            {/* Mobile Navigation Items */}
            <nav className="space-y-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className={`block text-lg font-medium transition-all duration-300 hover:text-primary py-3 px-4 rounded-lg ${
                      pathname === item.href 
                        ? "text-primary bg-primary/10 border-l-4 border-primary" 
                        : "text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Mobile Contact Section */}
            <motion.div 
              className="mt-8 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <h3 className="font-semibold text-foreground mb-3">Contact Information</h3>
              {contactInfo.map((contact, index) => (
                <motion.a
                  key={contact.label}
                  href={contact.href}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                >
                  <div className="flex-shrink-0">
                    <contact.icon className="h-5 w-5 text-primary group-hover:text-primary/80 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{contact.label}</p>
                    <p className="text-sm text-muted-foreground">{contact.value}</p>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </>
  )
}
