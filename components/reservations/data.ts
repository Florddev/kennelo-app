import type { Activity } from "@/components/activity-mark"
import { TODAY } from "@/components/calendar"
import { salonBookings } from "@/components/grooming/data"
import { kennels, stayAmount, stays } from "@/components/pension/data"
import { NOW } from "@/components/today/data"
import { programmes, weekSessions } from "@/components/training/data"

export type ReservationStatus =
  "pending" | "confirmed" | "ongoing" | "done" | "cancelled"

export type Reservation = {
  id: string
  activity: Activity
  pet: string
  breed: string
  owner: string
  /** Box, prestation or programme. */
  title: string
  detail: string
  /** Day offsets, see components/calendar.ts */
  start: number
  end?: number
  hour?: number
  amount?: number
  status: ReservationStatus
  source: "En ligne" | "Téléphone" | "Messages" | "Sur place"
}

const sources: Reservation["source"][] = [
  "En ligne",
  "Téléphone",
  "En ligne",
  "Messages",
  "Sur place",
]

const kennelName = (id?: string) => {
  const kennel = kennels.find((k) => k.id === id)
  if (!kennel) return "À placer"
  return kennel.area === "Chenil"
    ? `Box ${kennel.label}`
    : `Chatterie ${kennel.label.replace("C", "")}`
}

const timeState = (day: number, start: number, end: number) =>
  day < TODAY || (day === TODAY && end <= NOW)
    ? "done"
    : day === TODAY && start <= NOW
      ? "ongoing"
      : "confirmed"

const pension: Reservation[] = stays.map((stay) => ({
  activity: "Pension",
  amount: stayAmount(stay),
  breed: stay.breed,
  detail: `${stay.departure - stay.arrival} nuits${stay.options.length ? ` · ${stay.options.join(", ")}` : ""}`,
  end: stay.departure,
  id: `stay-${stay.id}`,
  owner: stay.owner,
  pet: stay.pet,
  source: "En ligne",
  start: stay.arrival,
  status:
    stay.status === "upcoming"
      ? "confirmed"
      : stay.status === "ongoing"
        ? "ongoing"
        : stay.status,
  title: kennelName(stay.kennelId),
}))

const grooming: Reservation[] = salonBookings.map((b) => ({
  activity: "Toilettage",
  amount: b.price,
  breed: b.breed,
  detail: b.status === "no-show" ? "Client absent" : (b.note ?? ""),
  hour: b.start,
  id: `salon-${b.id}`,
  owner: b.owner,
  pet: b.pet,
  source: "Téléphone",
  start: b.day,
  status:
    b.status === "no-show"
      ? "cancelled"
      : b.status === "confirmed"
        ? timeState(b.day, b.start, b.end)
        : b.status,
  title: b.service,
}))

const training: Reservation[] = weekSessions
  .filter((s) => s.owner)
  .map((s) => ({
    activity: "Éducation",
    breed: programmes.find((p) => p.dog === s.title)?.breed ?? "",
    detail: s.place,
    hour: s.start,
    id: `session-${s.id}`,
    owner: s.owner ?? "",
    pet: s.title,
    source: "Messages",
    start: s.day,
    status: s.cancelled ? "cancelled" : timeState(s.day, s.start, s.end),
    title: s.programme
      ? `${s.programme.name} · ${s.programme.session}/${s.programme.total}`
      : s.kind,
  }))

export const reservations: Reservation[] = [
  ...pension,
  ...grooming,
  ...training,
]
  .map((r, i) => ({ ...r, source: i % 3 === 0 ? r.source : sources[i % 5] }))
  .sort((a, b) => a.start - b.start || (a.hour ?? 0) - (b.hour ?? 0))
