"use client"

/**
 * Shared presentational primitives for the Admin Dashboard.
 *
 * These are pure visual helpers: they never fetch, mutate or derive business
 * data on their own — they only render what they are given.
 */

import * as React from "react"
import { useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ numbers */

export function formatNumber(value: number, decimals = 0, grouping = true) {
  const safe = Number.isFinite(value) ? value : 0
  return safe.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouping,
  })
}

/** Count-up number with natural easing; instant when reduced motion is on. */
export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 900,
  grouping = true,
  className,
}: {
  value: number
  decimals?: number
  duration?: number
  grouping?: boolean
  className?: string
}) {
  const reduced = useReducedMotion()
  const [display, setDisplay] = React.useState(0)
  const fromRef = React.useRef(0)

  React.useEffect(() => {
    const from = fromRef.current
    const to = Number.isFinite(value) ? value : 0

    if (reduced || from === to) {
      fromRef.current = to
      setDisplay(to)
      return
    }

    let frame = 0
    const start = performance.now()

    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 4)
      const current = from + (to - from) * eased
      fromRef.current = current
      setDisplay(current)
      if (p < 1) {
        frame = requestAnimationFrame(step)
      } else {
        fromRef.current = to
        setDisplay(to)
      }
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [value, duration, reduced])

  return (
    <span className={cn("adm-num", className)}>
      {formatNumber(display, decimals, grouping)}
    </span>
  )
}

/* -------------------------------------------------------------------- money */

/**
 * Money value with an isolated, correctly-ordered currency suffix.
 * `direction` mirrors the existing sign logic (credit vs. debit).
 */
export function Money({
  amount,
  direction = "in",
  size = "md",
  animate = false,
  className,
}: {
  amount: number
  direction?: "in" | "out"
  size?: "sm" | "md" | "lg"
  animate?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        "adm-money",
        direction === "in" ? "adm-money--in" : "adm-money--out",
        size === "lg" && "adm-money--lg",
        className,
      )}
    >
      <span className="adm-money__num">
        {direction === "in" ? "+" : "−"}
        {animate ? (
          <AnimatedNumber value={amount} decimals={2} />
        ) : (
          formatNumber(amount, 2)
        )}
      </span>
      <span className="adm-money__cur adm-ar" lang="ar" dir="rtl">
        د.ج
      </span>
    </span>
  )
}

/* ---------------------------------------------------------------- skeletons */

export function Skeleton({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("adm-skeleton", className)}
      style={style}
    />
  )
}

/* -------------------------------------------------------------- empty state */

export function EmptyState({
  icon,
  title,
  description,
  className,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn("adm-empty", className)}>
      <div className="adm-empty__art">{icon}</div>
      <p className="adm-empty__title">{title}</p>
      {description ? <p className="adm-empty__sub">{description}</p> : null}
    </div>
  )
}

/* ------------------------------------------------------------------ sparkline */

export function Sparkline({
  points,
  className,
}: {
  points: number[]
  className?: string
}) {
  const w = 96
  const h = 28
  const max = Math.max(...points)
  const min = Math.min(...points)
  const span = max - min || 1
  const step = w / Math.max(1, points.length - 1)

  const coords = points.map((p, i) => {
    const x = i * step
    const y = h - 3 - ((p - min) / span) * (h - 8)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  const line = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c}`)
    .join(" ")
  const area = `${line} L${w},${h} L0,${h} Z`

  return (
    <svg
      className={cn("adm-spark", className)}
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path className="adm-spark__area" d={area} />
      <path className="adm-spark__line" d={line} pathLength={1} />
    </svg>
  )
}

/* -------------------------------------------------------------------- panels */

export function PanelHead({
  icon,
  title,
  trailing,
  tone = "default",
  className,
}: {
  icon: React.ReactNode
  title: React.ReactNode
  trailing?: React.ReactNode
  tone?: "default" | "brand" | "info" | "violet"
  className?: string
}) {
  return (
    <div className={cn("adm-card__head", className)}>
      <IconBadge tone={tone}>{icon}</IconBadge>
      <h3 className="adm-card__title" style={{ marginInlineEnd: "auto" }}>
        {title}
      </h3>
      {trailing}
    </div>
  )
}

export function IconBadge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode
  tone?: "default" | "brand" | "info" | "violet"
  className?: string
}) {
  return (
    <span
      className={cn(
        "adm-icon-badge",
        tone === "brand" && "adm-icon-badge--brand",
        tone === "info" && "adm-icon-badge--info",
        tone === "violet" && "adm-icon-badge--violet",
        className,
      )}
    >
      {children}
    </span>
  )
}

/* -------------------------------------------------------------------- status */

export function StatusPill({ status }: { status: string }) {
  const done = status === "completed"
  return (
    <span
      className={cn("adm-pill", done ? "adm-pill--success" : "adm-pill--warning")}
    >
      <span className="adm-pill__dot" />
      {status}
    </span>
  )
}

/* ------------------------------------------------------------------ currency */

/** Isolated Arabic currency run — never reorders the surrounding sentence. */
export function Currency({ className }: { className?: string }) {
  return (
    <span className={cn("adm-ar", className)} lang="ar" dir="rtl">
      د.ج
    </span>
  )
}

/* ------------------------------------------------------------------ backdrop */

/** Ambient, slowly drifting light behind the whole console (decorative). */
export function AmbientBackdrop() {
  return (
    <div className="adm-canvas" aria-hidden="true">
      <span className="adm-orb adm-orb--a" />
      <span className="adm-orb adm-orb--b" />
      <span className="adm-orb adm-orb--c" />
    </div>
  )
}
