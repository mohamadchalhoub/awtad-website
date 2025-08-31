"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function AdminNavigation() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/content", label: "Content" },
    { href: "/admin/projects", label: "Projects" },
    { href: "/admin/images", label: "Images" },
  ]

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/admin/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
                <span className="text-primary-foreground font-mono font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-mono font-bold text-primary">AWTAD Admin</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === item.href ? "text-primary text-shadow-gold" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Desktop User Info */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.email || 'Admin'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              Logout
            </Button>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                View Site
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <div className="flex flex-col space-y-4 pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === item.href ? "text-primary text-shadow-gold" : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border space-y-3">
                <span className="text-sm text-muted-foreground block">
                  Welcome, {user?.email || 'Admin'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                >
                  Logout
                </Button>
                <Link href="/" className="block">
                  <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-primary">
                    View Site
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
