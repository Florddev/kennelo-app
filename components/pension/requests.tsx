"use client"

import { BedDoubleIcon, Clock01Icon } from "@hugeicons/core-free-icons"
import { shortDate } from "@/components/calendar"
import { findFreeKennel, type Stay } from "@/components/pension/data"
import { kennelLabel } from "@/components/pension/stay-sheet"
import type { Attention } from "@/components/today/widgets"
import { Button } from "@/components/ui/button"

/** Les demandes de séjour à traiter : d'abord à placer, puis à confirmer. */
export function stayRequests(
  stays: Stay[],
  {
    update,
    decline,
    open,
  }: {
    update: (id: string, patch: Partial<Stay>) => void
    decline: (id: string) => void
    open?: (id: string) => void
  }
): Attention[] {
  return stays
    .filter((s) => s.status === "pending")
    .sort((a, b) => Number(Boolean(a.kennelId)) - Number(Boolean(b.kennelId)))
    .map((s) => {
      const nights = s.departure - s.arrival
      const dates = `${shortDate(s.arrival)} → ${shortDate(s.departure)} · ${nights} nuit${nights > 1 ? "s" : ""}`
      if (!s.kennelId) {
        const free = findFreeKennel(stays, s)
        return {
          actions: free ? (
            <Button onClick={() => update(s.id, { kennelId: free.id })}>
              Placer dans le {kennelLabel(free.id).toLowerCase()}
            </Button>
          ) : (
            <span className="font-semibold text-destructive-foreground">
              Complet sur ces dates
            </span>
          ),
          detail: `${dates} · ${s.owner}`,
          icon: BedDoubleIcon,
          id: s.id,
          onOpen: open && (() => open(s.id)),
          title: `${s.pet} · séjour sans box`,
          tone: "bg-warning-soft text-warning-foreground",
        }
      }
      return {
        actions: (
          <>
            <Button
              className="bg-background"
              onClick={() => decline(s.id)}
              variant="outline"
            >
              Refuser
            </Button>
            <Button onClick={() => update(s.id, { status: "upcoming" })}>
              Accepter
            </Button>
          </>
        ),
        detail: `${dates} · ${kennelLabel(s.kennelId)} · ${s.owner}`,
        icon: Clock01Icon,
        id: s.id,
        onOpen: open && (() => open(s.id)),
        title: `${s.pet} · demande à confirmer`,
        tone: "bg-pension text-pension-foreground",
      }
    })
}
