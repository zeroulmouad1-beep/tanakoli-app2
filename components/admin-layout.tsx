"use client"

import { useEffect, useState } from "react"
import { MotionConfig, motion } from "framer-motion"
import { AdminPasswordGate } from "./admin-password-gate"
import { AmbientBackdrop } from "./admin/ui"
import { fadeUp } from "./admin/motion"
import { BarChart3, LogOut, ShieldCheck } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if already authenticated in this session
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("adminAuth") === "true"
    }
    return false
  })

  const [isScrolled, setIsScrolled] = useState(false)

  // Visual only: tighten the header once the page starts scrolling.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 6)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth")
    setIsAuthenticated(false)
  }

  return (
    <MotionConfig reducedMotion="user">
      {!isAuthenticated ? (
        <AdminPasswordGate onAuthenticated={() => setIsAuthenticated(true)} />
      ) : (
        <div className="adm-root" dir="ltr" lang="en">
          <AmbientBackdrop />

          <div className="adm-shell">
            {/* Header */}
            <motion.header
              className="adm-header"
              data-scrolled={isScrolled}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="adm-container adm-header__inner">
                <div className="adm-brand">
                  <div className="adm-brand__mark">
                    <BarChart3 className="w-5 h-5" strokeWidth={2.4} />
                    <span className="adm-brand__pulse" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h1 className="adm-brand__title">Admin Dashboard</h1>
                    <p className="adm-brand__sub">Tanakoli Management System</p>
                  </div>
                </div>

                <motion.button
                  onClick={handleLogout}
                  className="adm-btn adm-btn--danger"
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: 0.12 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <LogOut className="w-4 h-4" strokeWidth={2.2} />
                  Logout
                </motion.button>
              </div>
            </motion.header>

            {/* Main Content */}
            <main className="adm-container adm-main">{children}</main>

            {/* Footer */}
            <footer className="adm-footer">
              <div className="adm-container adm-footer__inner">
                <p className="adm-footer__text">
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: "var(--adm-text-3)" }} />
                  Admin Dashboard • Secure Session • Do not share your password
                </p>
              </div>
            </footer>
          </div>
        </div>
      )}
    </MotionConfig>
  )
}
