"use client"

import { Clock01Icon } from "@hugeicons/core-free-icons"
import { longDate } from "@/components/calendar"
import type { BookingStatus, SalonBooking } from "@/components/grooming/data"
import { type Attention, formatHour } from "@/components/today/widgets"
import { Button } from "@/components/ui/button"

/** Les demandes faites en ligne, à confirmer pour bloquer le créneau. */
export function bookingRequests(
  bookings: SalonBooking[],
  {
    setStatus,
    open,
  }: {
    setStatus: (id: string, status: BookingStatus) => void
    open?: (id: string) => void
  }
): Attention[] {
  return bookings
    .filter((b) => b.status === "pending")
    .sort((a, b) => a.day - b.day || a.start - b.start)
    .map((b) => ({
      actions: (
        <>
          <Button
            className="bg-background"
            onClick={() => setStatus(b.id, "cancelled")}
            variant="outline"
          >
            Refuser
          </Button>
          <Button onClick={() => setStatus(b.id, "confirmed")}>
            Confirmer
          </Button>
        </>
      ),
      detail: `${longDate(b.day)} à ${formatHour(b.start)} · ${b.service} · ${b.owner}`,
      icon: Clock01Icon,
      id: b.id,
      onOpen: open && (() => open(b.id)),
      title: `${b.pet} · demande en ligne`,
      tone: "bg-grooming text-grooming-foreground",
    }))
}
