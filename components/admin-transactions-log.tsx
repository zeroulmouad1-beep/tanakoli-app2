"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { fetchRecentTransactions, type Transaction } from "@/lib/admin-utils"
import {
  Activity,
  Receipt,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import {
  AnimatedNumber,
  EmptyState,
  Money,
  PanelHead,
  Skeleton,
  StatusPill,
  Currency,
  formatNumber,
} from "@/components/admin/ui"
import { EASE_OUT, fadeUp, rowIn } from "@/components/admin/motion"

interface TransactionStatsPayload {
  count: number
  todayVolume: number
  loading: boolean
}

interface AdminTransactionsLogProps {
  onStats?: (stats: TransactionStatsPayload) => void
}

const transactionTypes = [
  { value: "all", label: "All Transactions" },
  { value: "fare_deduction", label: "Fare Deductions" },
  { value: "balance_recharge", label: "Driver Recharges" },
  { value: "admin_transfer", label: "Admin Transfers" },
  { value: "ticket_purchase", label: "Ticket Purchases" },
]

/** True when a (Firestore) timestamp falls on the current calendar day. */
function isToday(timestamp: any) {
  if (!timestamp) return false
  const date = timestamp.toDate?.() ?? new Date(timestamp)
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export function AdminTransactionsLog({ onStats }: AdminTransactionsLogProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  // Subscribe to transactions
  useEffect(() => {
    console.log("[v0] Subscribing to transactions")
    setIsLoading(true)

    const unsubscribe = fetchRecentTransactions((txns) => {
      console.log("[v0] Transactions updated:", txns.length)
      setTransactions(txns)
      setIsLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Filter transactions
  const filteredTransactions =
    filter === "all" ? transactions : transactions.filter((t) => t.type === filter)

  // Today's settled volume — used by the "Today's Volume" stat card.
  const todayVolume = useMemo(
    () =>
      transactions.reduce(
        (sum, tx) => (isToday(tx.timestamp) ? sum + tx.amount : sum),
        0
      ),
    [transactions]
  )

  // Report counters upwards for the stats cards (presentation only).
  const statsRef = useRef(onStats)
  useEffect(() => {
    statsRef.current = onStats
  })
  useEffect(() => {
    statsRef.current?.({
      count: transactions.length,
      todayVolume,
      loading: isLoading,
    })
  }, [transactions, todayVolume, isLoading])

  // Visual only: briefly highlight rows that have just arrived.
  const seenIds = useRef<Set<string>>(new Set())
  const [flashIds, setFlashIds] = useState<string[]>([])

  useEffect(() => {
    const fresh = transactions
      .filter((tx) => seenIds.current.size > 0 && !seenIds.current.has(tx.id))
      .map((tx) => tx.id)

    transactions.forEach((tx) => seenIds.current.add(tx.id))

    if (fresh.length === 0) return
    setFlashIds(fresh)
    const timer = setTimeout(() => setFlashIds([]), 1600)
    return () => clearTimeout(timer)
  }, [transactions])

  // Get transaction type display
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      fare_deduction: "Fare Deduction",
      balance_recharge: "Driver Recharge",
      ticket_purchase: "Ticket Purchase",
      admin_transfer: "Admin Transfer",
      payment: "Payment",
      topup: "Top-up",
    }
    return labels[type] || type
  }

  // Get transaction icon
  const getTypeIcon = (type: string) => {
    if (type.includes("deduction") || type.includes("purchase")) {
      return <TrendingDown className="w-3.5 h-3.5" strokeWidth={2.4} />
    }
    return <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.4} />
  }

  const getTypeDirection = (type: string): "in" | "out" =>
    type.includes("deduction") || type.includes("purchase") ? "out" : "in"

  // Format timestamp
  const formatTime = (timestamp: any) => {
    if (!timestamp) return "N/A"

    try {
      const date = timestamp.toDate?.() || new Date(timestamp)
      const now = new Date()
      const diff = now.getTime() - date.getTime()

      if (diff < 60000) return "Just now"
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "N/A"
    }
  }

  const countFor = (value: string) =>
    value === "all"
      ? transactions.length
      : transactions.filter((t) => t.type === value).length

  return (
    <motion.div className="adm-card adm-card--hover" variants={fadeUp}>
      <PanelHead
        tone="violet"
        icon={<Activity className="w-[18px] h-[18px]" strokeWidth={2.2} />}
        title="Recent Transactions"
        trailing={
          <span className="adm-chip">Last 50</span>
        }
      />

      {/* Filter Tabs */}
      <div className="adm-filters">
        <div className="adm-segmented adm-segmented--scroll">
          {transactionTypes.map((type) => {
            const active = filter === type.value
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setFilter(type.value)}
                data-active={active}
                aria-pressed={active}
                className="adm-segmented__btn"
              >
                {active && (
                  <motion.span
                    layoutId="adm-filter-indicator"
                    className="adm-segmented__indicator"
                    transition={{
                      type: "spring",
                      stiffness: 460,
                      damping: 40,
                      mass: 0.7,
                    }}
                  />
                )}
                <span className="adm-segmented__label">{type.label}</span>
                <span className="adm-segmented__count">{countFor(type.value)}</span>
              </button>
            )
          })}
        </div>

        {!isLoading && (
          <p className="adm-filters__count adm-num">
            {filteredTransactions.length} transactions
          </p>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="adm-card__body adm-stack">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="adm-skeleton--row" />
          ))}
        </div>
      )}

      {/* Transactions */}
      {!isLoading && filteredTransactions.length === 0 && (
        <div className="adm-card__body">
          <EmptyState
            icon={<Receipt className="w-8 h-8" strokeWidth={1.5} />}
            title="No transactions found"
            description="Try another filter — activity appears here in real time."
          />
        </div>
      )}

      {!isLoading && filteredTransactions.length > 0 && (
        <>
          {/* -------------------------------------------------- Mobile cards */}
          <ul className="adm-card__body adm-list adm-only-mobile" role="list">
            <AnimatePresence>
              {filteredTransactions.map((tx, index) => (
                <motion.li
                  key={tx.id}
                  className="adm-tx"
                  data-flash={flashIds.includes(tx.id)}
                  {...rowIn(index)}
                >
                  <div className="adm-tx__top">
                    <span className="adm-tx__type">
                      <span
                        className={`adm-type-icon adm-type-icon--${
                          getTypeDirection(tx.type) === "out" ? "out" : "in"
                        }`}
                      >
                        {getTypeIcon(tx.type)}
                      </span>
                      {getTypeLabel(tx.type)}
                    </span>

                    <span className="adm-tx__amount">
                      <Money
                        amount={tx.amount}
                        direction={getTypeDirection(tx.type)}
                        size="lg"
                      />
                      {tx.newBalance !== undefined && (
                        <span className="adm-money__sub">
                          New: {formatNumber(tx.newBalance, 2)}{" "}
                          <Currency />
                        </span>
                      )}
                    </span>
                  </div>

                  <span className="adm-tx__mid">
                    <span className="adm-tx__user adm-iso" dir="auto">
                      {tx.userName || `${tx.userId.slice(0, 8)}...`}
                    </span>
                    {tx.driverPhone && (
                      <span className="adm-cell-user__meta adm-ltr">
                        Driver: {tx.driverPhone}
                      </span>
                    )}
                  </span>

                  <span className="adm-tx__foot">
                    <StatusPill status={tx.status} />
                    <span className="adm-time">{formatTime(tx.timestamp)}</span>
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {/* ------------------------------------------------- Desktop table */}
          <div className="adm-table-wrap adm-only-desktop">
            <div className="adm-table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>User</th>
                    <th style={{ textAlign: "end" }}>Amount</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredTransactions.map((tx, index) => (
                      <motion.tr
                        key={tx.id}
                        className="adm-row"
                        data-flash={flashIds.includes(tx.id)}
                        {...rowIn(index)}
                      >
                        {/* Type */}
                        <td>
                          <span className="adm-cell-type">
                            <span
                              className={`adm-type-icon adm-type-icon--${
                                getTypeDirection(tx.type) === "out" ? "out" : "in"
                              }`}
                            >
                              {getTypeIcon(tx.type)}
                            </span>
                            {getTypeLabel(tx.type)}
                          </span>
                        </td>

                        {/* User */}
                        <td>
                          <span className="adm-cell-user">
                            <span className="adm-cell-user__name">
                              <span className="adm-iso" dir="auto">
                                {tx.userName || `${tx.userId.slice(0, 8)}...`}
                              </span>
                            </span>
                            {tx.driverPhone && (
                              <span className="adm-cell-user__meta adm-ltr">
                                Driver: {tx.driverPhone}
                              </span>
                            )}
                          </span>
                        </td>

                        {/* Amount */}
                        <td style={{ textAlign: "end" }}>
                          <span className="adm-cell-amount">
                            <Money
                              amount={tx.amount}
                              direction={getTypeDirection(tx.type)}
                            />
                            {tx.newBalance !== undefined && (
                              <span className="adm-money__sub">
                                New: {formatNumber(tx.newBalance, 2)}{" "}
                                <Currency />
                              </span>
                            )}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          <StatusPill status={tx.status} />
                        </td>

                        {/* Time */}
                        <td>
                          <span className="adm-time">
                            {formatTime(tx.timestamp)}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Stats Summary */}
      {!isLoading && filteredTransactions.length > 0 && (
        <div className="adm-summary">
          <div className="adm-summary__item">
            <span className="adm-summary__label">Total Transactions</span>
            <span className="adm-summary__value">
              <AnimatedNumber value={filteredTransactions.length} />
            </span>
          </div>
          <div className="adm-summary__item">
            <span className="adm-summary__label">Total Volume</span>
            <span className="adm-summary__value">
              <Money
                amount={filteredTransactions.reduce(
                  (sum, tx) => sum + tx.amount,
                  0
                )}
                direction="in"
                animate
              />
            </span>
          </div>
          <div className="adm-summary__item">
            <span className="adm-summary__label">Last Activity</span>
            <span className="adm-summary__value adm-summary__value--text">
              {formatTime(filteredTransactions[0]?.timestamp)}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
