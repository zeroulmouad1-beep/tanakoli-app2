"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AmbientBackdrop } from "./admin/ui"
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react"

const ADMIN_PASSWORD = "admin123"

interface AdminPasswordGateProps {
  onAuthenticated: () => void
}

export function AdminPasswordGate({ onAuthenticated }: AdminPasswordGateProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate a small delay for security feel
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (password === ADMIN_PASSWORD) {
      // Store auth in sessionStorage (valid only for this session)
      sessionStorage.setItem("adminAuth", "true")
      onAuthenticated()
    } else {
      setError("Invalid password")
      setPassword("")
      setIsLoading(false)
    }
  }

  return (
    <div className="adm-root" dir="ltr" lang="en">
      <AmbientBackdrop />

      <div className="adm-shell">
        <div className="adm-gate">
          <motion.div
            className="adm-card adm-gate__card"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="adm-gate__mark">
              <Lock className="w-6 h-6" strokeWidth={2.2} />
            </div>

            <h1 className="adm-gate__title" style={{ marginTop: 20 }}>
              Admin Dashboard
            </h1>
            <p className="adm-gate__sub" style={{ marginBottom: 26 }}>
              Enter your password to continue
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
              <div>
                <div className="adm-control">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="Enter admin password"
                    className="adm-input"
                    style={{ paddingRight: 52 }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="adm-eye-btn"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-[18px] h-[18px]" />
                    ) : (
                      <Eye className="w-[18px] h-[18px]" />
                    )}
                  </button>
                </div>

                {error && (
                  <motion.p
                    className="adm-gate__error"
                    style={{ marginTop: 10 }}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0, x: [0, -5, 5, -3, 0] }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !password}
                className="adm-btn adm-btn--primary adm-btn--lg"
              >
                {isLoading ? (
                  <>
                    <span className="adm-spinner" />
                    Verifying...
                  </>
                ) : (
                  "Unlock Admin Panel"
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="adm-gate__foot" style={{ marginTop: 24 }}>
              <ShieldCheck
                className="w-3.5 h-3.5"
                style={{ display: "inline-block", verticalAlign: "-2px", marginRight: 6 }}
              />
              Secure Session • Session-only authentication
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
