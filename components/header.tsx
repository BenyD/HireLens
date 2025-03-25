"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion, AnimatePresence } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const isMobile = useMobile()
  const pathname = usePathname()
  const router = useRouter()

  // Close menu when switching from mobile to desktop
  useEffect(() => {
    if (!isMobile && isMenuOpen) {
      setIsMenuOpen(false)
    }
  }, [isMobile, isMenuOpen])

  // Handle scroll events to update active section
  useEffect(() => {
    const handleScroll = () => {
      if (pathname !== "/") return

      const sections = ["features", "upload-section", "how-it-works"]

      for (const section of sections) {
        const element = document.getElementById(section)
        if (!element) continue

        const rect = element.getBoundingClientRect()
        if (rect.top <= 100 && rect.bottom >= 100) {
          setActiveSection(section)
          return
        }
      }

      // If no section is in view or at the top, set to home
      setActiveSection("")
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial check

    return () => window.removeEventListener("scroll", handleScroll)
  }, [pathname])

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/" && activeSection === ""
    if (path.includes("#")) {
      const section = path.split("#")[1]
      return pathname === "/" && activeSection === section
    }
    return pathname === path
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    setIsMenuOpen(false)

    if (path.includes("#") && pathname === "/") {
      e.preventDefault()
      const id = path.split("#")[1]
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    } else if (path === "/") {
      if (pathname === "/") {
        e.preventDefault()
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    } else {
      // For FAQ and Privacy, ensure we scroll to top
      window.scrollTo({ top: 0, behavior: "auto" })
    }
  }

  const handleGetStarted = () => {
    setIsMenuOpen(false)
    if (pathname === "/") {
      const uploadSection = document.getElementById("upload-section")
      if (uploadSection) {
        uploadSection.scrollIntoView({ behavior: "smooth" })
      }
    } else {
      router.push("/#upload-section")
    }
  }

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Features", path: "/#features" },
    { name: "FAQ", path: "/faq" },
    { name: "Privacy", path: "/privacy" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gradient">HireLens</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {!isMobile && (
            <nav className="flex items-center gap-6 mr-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`nav-link ${isActive(link.path) ? "nav-link-active" : ""}`}
                  onClick={(e) => handleNavClick(e, link.path)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          )}

          <ThemeToggle />

          {!isMobile && (
            <Button className="btn-primary ml-2" onClick={handleGetStarted}>
              Get Started
            </Button>
          )}

          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && isMobile && (
          <motion.div
            className="fixed inset-x-0 top-16 z-50 h-[calc(100vh-4rem)] bg-background border-b"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="container flex flex-col gap-4 py-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-lg font-medium transition-colors hover:text-primary ${
                    isActive(link.path) ? "text-primary" : "text-muted-foreground"
                  }`}
                  onClick={(e) => handleNavClick(e, link.path)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t">
                <Button className="btn-primary w-full" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

