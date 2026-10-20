import type { Metadata } from "next"
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google"
import "./admin.css"

export const metadata: Metadata = {
  title: "Admin Dashboard | Tanakoli",
  description: "Secure admin dashboard for managing drivers and transactions",
  robots: "noindex,nofollow",
}

// Skip static prerendering for admin routes (they use client-side authentication)
export const dynamic = "force-dynamic"

/**
 * Typography pairing for the admin console:
 *  - Inter … Latin (UI, numbers, tables)
 *  - IBM Plex Sans Arabic … Arabic runs (currency, Arabic names)
 * Both are variable/static families with excellent bilingual coverage.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
})

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.variable} ${plexArabic.variable}`}>{children}</div>
  )
}
