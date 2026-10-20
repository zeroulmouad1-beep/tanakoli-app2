"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { rtdb } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import {
  Bus,
  Clock,
  MapPin,
  Navigation,
  Users,
} from "lucide-react"
import { EmptyState, PanelHead, Skeleton } from "@/components/admin/ui"
import { fadeUp, rowIn } from "@/components/admin/motion"

interface DriverLocation {
  lat: number
  lng: number
  timestamp?: number
}

interface Driver {
  phone: string
  location: DriverLocation
}

interface AdminDriverListProps {
  onDriverSelect?: (driverPhone: string) => void
  onStats?: (stats: { count: number; loading: boolean }) => void
}

/** Short, deterministic avatar label for a phone-based identity. */
function driverInitials(phone: string) {
  const digits = phone.replace(/\D/g, "")
  return digits.slice(-2) || "—"
}

export function AdminDriverMap({
  onDriverSelect,
  onStats,
}: AdminDriverListProps) {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Subscribe to driver locations from Firebase Realtime Database
    const driversRef = ref(rtdb, "drivers")

    const unsubscribe = onValue(
      driversRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setDrivers([])
          setIsLoading(false)
          return
        }

        const driversData = snapshot.val()
        const driversList: Driver[] = []

        // Process drivers data - read from drivers/{phone}/location
        for (const [phone, driverData] of Object.entries(driversData)) {
          const data = driverData as any
          if (data.location && typeof data.location === "object") {
            driversList.push({
              phone,
              location: data.location,
            })
          }
        }

        setDrivers(driversList)
        setIsLoading(false)
      },
      (error) => {
        console.error("[v0] Error fetching driver locations:", error)
        setIsLoading(false)
      }
    )

    return () => {
      unsubscribe()
    }
  }, [])

  // Report the driver count upwards for the stats cards (presentation only).
  const statsRef = useRef(onStats)
  useEffect(() => {
    statsRef.current = onStats
  })
  useEffect(() => {
    statsRef.current?.({ count: drivers.length, loading: isLoading })
  }, [drivers, isLoading])

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <motion.div className="adm-card adm-card--hover" variants={fadeUp}>
      <PanelHead
        tone="info"
        icon={<Users className="w-[18px] h-[18px]" strokeWidth={2.2} />}
        title={
          <>
            Active Drivers <span className="adm-num">({drivers.length})</span>
          </>
        }
        trailing={
          !isLoading && drivers.length > 0 ? (
            <span className="adm-chip">
              <span className="adm-dot-live" />
              Live
            </span>
          ) : null
        }
      />

      {isLoading ? (
        <div className="adm-card__body adm-stack">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="adm-skeleton--row" />
          ))}
        </div>
      ) : drivers.length === 0 ? (
        <div className="adm-card__body">
          <EmptyState
            icon={<Bus className="w-8 h-8" strokeWidth={1.5} />}
            title="No active drivers at the moment"
            description="Drivers will show up here as soon as they start sharing their location."
          />
        </div>
      ) : (
        <>
          {/* ---------------------------------------------------- Mobile cards */}
          <ul className="adm-card__body adm-list adm-only-mobile" role="list">
            <AnimatePresence>
              {drivers.map((driver, index) => (
                <motion.li
                  key={driver.phone}
                  className="adm-driver"
                  {...rowIn(index)}
                >
                  <span className="adm-avatar">
                    {driverInitials(driver.phone)}
                  </span>

                  <div className="adm-driver__body">
                    <div className="adm-driver__phone">
                      <span className="adm-dot-live" />
                      {driver.phone}
                    </div>
                    <div className="adm-driver__meta">
                      <span className="adm-coord">
                        <MapPin className="w-3 h-3" strokeWidth={2} />
                        {driver.location.lat.toFixed(6)},{" "}
                        {driver.location.lng.toFixed(6)}
                      </span>
                      <span className="adm-coord">
                        <Clock className="w-3 h-3" strokeWidth={2} />
                        {formatTime(driver.location.timestamp)}
                      </span>
                    </div>
                  </div>

                  {onDriverSelect && (
                    <button
                      type="button"
                      onClick={() => onDriverSelect(driver.phone)}
                      className="adm-btn adm-btn--select"
                    >
                      <Navigation className="w-3.5 h-3.5" strokeWidth={2.2} />
                      Select
                    </button>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {/* --------------------------------------------------- Desktop table */}
          <div className="adm-table-wrap adm-only-desktop">
            <div className="adm-table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Phone</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Last Update</th>
                    <th style={{ textAlign: "end" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {drivers.map((driver, index) => (
                      <motion.tr
                        key={driver.phone}
                        className="adm-row"
                        {...rowIn(index)}
                      >
                        <td>
                          <div className="adm-cell-user">
                            <span className="adm-cell-user__name">
                              <span
                                className="adm-avatar"
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: 10,
                                  fontSize: 11,
                                }}
                              >
                                {driverInitials(driver.phone)}
                              </span>
                              <span className="adm-driver__phone">
                                {driver.phone}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="adm-coord adm-num">
                            {driver.location.lat.toFixed(6)}
                          </span>
                        </td>
                        <td>
                          <span className="adm-coord adm-num">
                            {driver.location.lng.toFixed(6)}
                          </span>
                        </td>
                        <td>
                          <span className="adm-time">
                            {formatTime(driver.location.timestamp)}
                          </span>
                        </td>
                        <td style={{ textAlign: "end" }}>
                          {onDriverSelect && (
                            <button
                              type="button"
                              onClick={() => onDriverSelect(driver.phone)}
                              className="adm-btn adm-btn--select"
                            >
                              <Navigation
                                className="w-3.5 h-3.5"
                                strokeWidth={2.2}
                              />
                              Select
                            </button>
                          )}
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
    </motion.div>
  )
}
