"use client"

import { useCallback, useState } from "react"
import { motion } from "framer-motion"
import { AdminLayout } from "@/components/admin-layout"
import { AdminDriverMap } from "@/components/admin-driver-map"
import { AdminSendMoneyForm } from "@/components/admin-send-money-form"
import { AdminTransactionsLog } from "@/components/admin-transactions-log"
import { AnimatedNumber, Skeleton, Sparkline } from "@/components/admin/ui"
import { cn } from "@/lib/utils"
import { fadeUp, stagger } from "@/components/admin/motion"
import { Grid3x3, Users, Wallet } from "lucide-react"

interface DriverStats {
  count: number
  loading: boolean
}

interface TransactionStats {
  count: number
  todayVolume: number
  loading: boolean
}

const SPARK_VOLUME = [10, 14, 12, 18, 16, 23, 21, 28, 26, 33]
const SPARK_COUNT = [30, 26, 32, 24, 29, 22, 27, 20, 25, 18]
const SPARK_DRIVERS = [6, 8, 7, 9, 8, 11, 10, 13, 12, 15]

function StatCard({
  label,
  icon,
  tone,
  value,
  decimals = 0,
  unit,
  spark,
  loading,
  className,
}: {
  label: string
  icon: React.ReactNode
  tone: { color: string; soft: string; line: string; glow: string }
  value: number
  decimals?: number
  unit?: React.ReactNode
  spark: number[]
  loading: boolean
  className?: string
}) {
  return (
    <motion.div
      className={cn("adm-stat", className)}
      variants={fadeUp}
      style={
        {
          "--adm-stat-color": tone.color,
          "--adm-stat-soft": tone.soft,
          "--adm-stat-line": tone.line,
          "--adm-stat-glow": tone.glow,
        } as React.CSSProperties
      }
    >
      <div className="adm-stat__top">
        <span className="adm-stat__label">{label}</span>
        <span className="adm-stat__icon">{icon}</span>
      </div>

      <div className="adm-stat__value">
        {loading ? (
          <Skeleton className="adm-skeleton--value" />
        ) : (
          <>
            <AnimatedNumber value={value} decimals={decimals} />
            {unit ? <span className="adm-stat__unit">{unit}</span> : null}
          </>
        )}
      </div>

      <div className="adm-stat__foot">
        {loading ? (
          <Skeleton style={{ width: 96, height: 28 }} />
        ) : (
          <Sparkline points={spark} />
        )}
      </div>
    </motion.div>
  )
}

export default function AdminPage() {
  const [selectedDriver, setSelectedDriver] = useState<string>("")
  const [driverStats, setDriverStats] = useState<DriverStats>({
    count: 0,
    loading: true,
  })
  const [txStats, setTxStats] = useState<TransactionStats>({
    count: 0,
    todayVolume: 0,
    loading: true,
  })

  const handleDriverStats = useCallback((stats: DriverStats) => {
    setDriverStats(stats)
  }, [])

  const handleTransactionStats = useCallback((stats: TransactionStats) => {
    setTxStats(stats)
  }, [])

  return (
    <AdminLayout>
      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger(0.07, 0.04)}
        className="adm-page"
      >
        {/* Page Header */}
        <motion.div className="adm-page-head" variants={fadeUp}>
          <h2 className="adm-page-head__title">Dashboard Overview</h2>
          <p className="adm-page-head__sub">
            Monitor drivers, manage transactions, and send payments in real-time
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.section
          className="adm-grid adm-grid--stats"
          variants={stagger(0.06)}
          aria-label="Key metrics"
        >
          <StatCard
            className="adm-stat--hero"
            label="Today's Volume"
            icon={<Wallet className="w-[18px] h-[18px]" strokeWidth={2.2} />}
            tone={{
              color: "#34d399",
              soft: "rgba(52, 211, 153, 0.14)",
              line: "rgba(52, 211, 153, 0.26)",
              glow: "rgba(16, 185, 129, 0.22)",
            }}
            value={txStats.todayVolume}
            decimals={2}
            unit={
              <span className="adm-ar" lang="ar" dir="rtl">
                د.ج
              </span>
            }
            spark={SPARK_VOLUME}
            loading={txStats.loading}
          />

          <StatCard
            label="Total Transactions"
            icon={<Grid3x3 className="w-[18px] h-[18px]" strokeWidth={2.2} />}
            tone={{
              color: "#a78bfa",
              soft: "rgba(167, 139, 250, 0.14)",
              line: "rgba(167, 139, 250, 0.26)",
              glow: "rgba(139, 92, 246, 0.20)",
            }}
            value={txStats.count}
            spark={SPARK_COUNT}
            loading={txStats.loading}
          />

          <StatCard
            label="Active Drivers"
            icon={<Users className="w-[18px] h-[18px]" strokeWidth={2.2} />}
            tone={{
              color: "#38bdf8",
              soft: "rgba(56, 189, 248, 0.14)",
              line: "rgba(56, 189, 248, 0.26)",
              glow: "rgba(14, 165, 233, 0.20)",
            }}
            value={driverStats.count}
            spark={SPARK_DRIVERS}
            loading={driverStats.loading}
          />
        </motion.section>

        {/* Main Content Grid */}
        <motion.section className="adm-grid adm-grid--main" variants={fadeUp}>
          <div className="adm-col">
            <AdminDriverMap
              onDriverSelect={setSelectedDriver}
              onStats={handleDriverStats}
            />
          </div>

          <div className="adm-col">
            <AdminSendMoneyForm preselectedDriver={selectedDriver} />
          </div>
        </motion.section>

        {/* Full Width: Transactions Log */}
        <motion.section variants={fadeUp}>
          <AdminTransactionsLog onStats={handleTransactionStats} />
        </motion.section>

        {/* Info Box */}
        <motion.div className="adm-tip" variants={fadeUp}>
          <span className="adm-tip__icon" aria-hidden="true">
            💡
          </span>
          <p className="adm-tip__text">
            <strong>Tip:</strong> Click on drivers in the map or list to quickly
            select them for money transfers. All transactions are recorded in
            real-time.
          </p>
        </motion.div>
      </motion.div>
    </AdminLayout>
  )
}
