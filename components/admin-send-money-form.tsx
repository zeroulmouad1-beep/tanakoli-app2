"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { sendMoneyToDriver } from "@/lib/admin-utils"
import { rtdb } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { AlertCircle, CheckCircle, ChevronDown, Send } from "lucide-react"
import { Currency, PanelHead } from "@/components/admin/ui"
import { EASE_OUT, fadeUp, noticeIn } from "@/components/admin/motion"

interface SendMoneyFormProps {
  preselectedDriver?: string
}

export function AdminSendMoneyForm({ preselectedDriver }: SendMoneyFormProps) {
  const [driverPhone, setDriverPhone] = useState(preselectedDriver || "")
  const [amount, setAmount] = useState("")
  const [drivers, setDrivers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [driversLoading, setDriversLoading] = useState(true)

  // Fetch all drivers from Realtime Database
  useEffect(() => {
    const driversRef = ref(rtdb, "drivers")
    const unsubscribe = onValue(
      driversRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setDrivers([])
          setDriversLoading(false)
          return
        }

        const realtimeDrivers = snapshot.val()
        const driverPhones: string[] = Object.keys(realtimeDrivers)

        setDrivers(driverPhones)
        setDriversLoading(false)
      },
      (error) => {
        console.error("[v0] Error loading drivers from Realtime DB:", error)
        setDriversLoading(false)
      }
    )

    return () => {
      unsubscribe()
    }
  }, [])

  // Update form when preselected driver changes (from table selection)
  useEffect(() => {
    if (preselectedDriver) {
      setDriverPhone(preselectedDriver)
      setSuccess(false)
      setError("")
    }
  }, [preselectedDriver])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Validation
    if (!driverPhone.trim()) {
      setError("Please select a driver")
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (amountNum > 10000) {
      setError("Amount cannot exceed 10,000 د.ج")
      return
    }

    // Confirmation
    const confirmed = window.confirm(
      `Send ${amountNum.toFixed(2)} د.ج to driver ${driverPhone}?`
    )

    if (!confirmed) return

    setIsLoading(true)

    try {
      const result = await sendMoneyToDriver(driverPhone, amountNum)

      if (result.success) {
        setSuccess(true)
        setAmount("")
        setDriverPhone(preselectedDriver || "")

        // Auto-dismiss success after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error || "Failed to send money")
      }
    } catch (err) {
      setError((err as Error).message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div className="adm-card adm-card--hover" variants={fadeUp}>
      <PanelHead
        tone="brand"
        icon={<Send className="w-[18px] h-[18px]" strokeWidth={2.2} />}
        title="Send Money to Driver"
      />

      <form onSubmit={handleSubmit} className="adm-card__body adm-form">
        {/* Driver Selection */}
        <div className="adm-field">
          <label className="adm-label" htmlFor="adm-driver-select">
            Select Driver
          </label>
          <div className="adm-control">
            <select
              id="adm-driver-select"
              value={driverPhone}
              onChange={(e) => {
                setDriverPhone(e.target.value)
                setSuccess(false)
                setError("")
              }}
              disabled={isLoading || driversLoading}
              className="adm-select"
            >
              <option value="">Choose a driver...</option>
              {drivers.map((phone) => (
                <option key={phone} value={phone}>
                  {phone}
                </option>
              ))}
            </select>
            <ChevronDown
              className="adm-select__chevron w-4 h-4"
              strokeWidth={2.2}
            />
          </div>
          {driversLoading && (
            <p className="adm-hint">
              <span className="adm-spinner adm-spinner--xs" />
              Loading drivers...
            </p>
          )}
        </div>

        {/* Amount Input */}
        <div className="adm-field">
          <label className="adm-label" htmlFor="adm-amount-input">
            Amount (<Currency />)
          </label>
          <div className="adm-control">
            <input
              id="adm-amount-input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading || !driverPhone}
              placeholder="Enter amount"
              min="0"
              max="10000"
              step="0.01"
              inputMode="decimal"
              dir="ltr"
              className="adm-input adm-input--amount"
            />
            <span className="adm-affix">
              <Currency />
            </span>
          </div>
        </div>

        {/* Preset Amounts */}
        <div className="adm-field">
          <span className="adm-label">Quick Select</span>
          <div className="adm-chips">
            {[100, 200, 500, 1000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                disabled={isLoading || !driverPhone}
                data-active={amount === preset.toString()}
                className="adm-chips__btn"
              >
                <span className="adm-num">{preset}</span>
                <span className="adm-chips__cur adm-ar" lang="ar" dir="rtl">
                  د.ج
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence initial={false}>
          {error && (
            <motion.div
              className="adm-notice adm-notice--error"
              variants={noticeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.24, ease: EASE_OUT }}
            >
              <AlertCircle className="w-4 h-4" strokeWidth={2.2} />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence initial={false}>
          {success && (
            <motion.div
              className="adm-notice adm-notice--success"
              variants={noticeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.24, ease: EASE_OUT }}
            >
              <CheckCircle className="w-4 h-4" strokeWidth={2.2} />
              <p>Money sent successfully to {driverPhone}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading || !driverPhone || !amount || driversLoading}
          className="adm-btn adm-btn--primary adm-btn--lg adm-btn--block"
          data-success={success}
          whileTap={{ scale: 0.985 }}
          transition={{ duration: 0.16, ease: EASE_OUT }}
        >
          {isLoading ? (
            <>
              <span className="adm-spinner" />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" strokeWidth={2.2} />
              Send Money
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  )
}
