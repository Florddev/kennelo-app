import { type Activity, activityNames } from "@/components/activity-mark"
import { TODAY } from "@/components/calendar"
import {
  type Invoice,
  invoiceBooks,
  invoiceTotal,
} from "@/components/invoices/data"
import { kennels } from "@/components/pension/data"
import { type Reservation, reservations } from "@/components/reservations/data"

export type ActivityInvoice = Invoice & { id: string; activity: Activity }

export const allInvoices: ActivityInvoice[] = activityNames.flatMap(
  (activity) =>
    invoiceBooks[activity].invoices.map((invoice) => ({
      ...invoice,
      activity,
      id: `${activity}:${invoice.number}`,
    }))
)

export type Pet = {
  name: string
  breed: string
  species: "Chien" | "Chat"
  activities: Activity[]
  care?: string
}

export type Client = {
  name: string
  initials: string
  email: string
  phone: string
  city: string
  since: number
  pets: Pet[]
  activities: Activity[]
  reservations: Reservation[]
  invoices: ActivityInvoice[]
  spent: number
  balance: number
  lastVisit?: number
  nextVisit?: number
  tags: string[]
}

const cats = [
  "Pistache",
  "Réglisse",
  "Mochi",
  "Plume",
  "Choupette",
  "Minou",
  "Sushi",
]

const hash = (s: string) =>
  [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]+/g, ".")

const pad = (n: number) => String(n % 100).padStart(2, "0")

const cities = [
  "Libourne",
  "Saint-Émilion",
  "Fronsac",
  "Pomerol",
  "Coutras",
  "Libourne",
]
const domains = ["gmail.com", "orange.fr", "free.fr"]

const careOf = (pet: string) => {
  const kennel = kennels.find((k) => k.pet === pet)
  return kennel?.meds ?? kennel?.diet ?? kennel?.warning
}

function buildClients(): Client[] {
  const byName = new Map<string, Client>()
  const get = (name: string) => {
    let client = byName.get(name)
    if (!client) {
      const h = hash(name)
      client = {
        activities: [],
        balance: 0,
        city: cities[h % cities.length],
        email: `${slug(name)}@${domains[h % domains.length]}`,
        initials: name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2),
        invoices: [],
        name,
        pets: [],
        phone: `06 ${pad(h)} ${pad(h >> 7)} ${pad(h >> 14)} ${pad(h >> 21)}`,
        reservations: [],
        since: 2021 + (h % 6),
        spent: 0,
        tags: [],
      }
      byName.set(name, client)
    }
    return client
  }
  const addPet = (
    client: Client,
    name: string,
    breed: string,
    activity: Activity
  ) => {
    let pet = client.pets.find((p) => p.name === name)
    if (!pet) {
      pet = {
        activities: [],
        breed,
        care: careOf(name),
        name,
        species: cats.includes(name) ? "Chat" : "Chien",
      }
      client.pets.push(pet)
    }
    if (!pet.breed && breed) pet.breed = breed
    if (!pet.activities.includes(activity)) pet.activities.push(activity)
    if (!client.activities.includes(activity)) client.activities.push(activity)
  }

  for (const r of reservations) {
    const client = get(r.owner)
    client.reservations.push(r)
    addPet(client, r.pet, r.breed, r.activity)
  }
  for (const invoice of allInvoices) {
    if (invoice.client === "Ventes comptoir") continue
    const client = get(invoice.client)
    client.invoices.push(invoice)
    const [pet, second] = invoice.detail.split(" · ")
    addPet(
      client,
      pet,
      invoice.activity === "Toilettage" ? second : "",
      invoice.activity
    )
    if (invoice.status === "paid") client.spent += invoiceTotal(invoice)
    if (invoice.status === "pending" || invoice.status === "overdue")
      client.balance += invoiceTotal(invoice)
  }

  return [...byName.values()]
    .map((client) => {
      const past = client.reservations.filter(
        (r) =>
          r.start <= TODAY && r.status !== "cancelled" && r.status !== "pending"
      )
      const future = client.reservations.filter(
        (r) => r.start > TODAY && r.status !== "cancelled"
      )
      const tags: string[] = []
      if (
        client.reservations.some(
          (r) => r.activity === "Pension" && r.status === "ongoing"
        )
      )
        tags.push("En séjour")
      if (client.invoices.some((i) => i.status === "overdue"))
        tags.push("Impayé")
      if (client.since === 2026) tags.push("Nouveau")
      else if (client.reservations.length + client.invoices.length >= 3)
        tags.push("Fidèle")
      return {
        ...client,
        lastVisit: past.length
          ? Math.max(...past.map((r) => r.start))
          : undefined,
        nextVisit: future.length
          ? Math.min(...future.map((r) => r.start))
          : undefined,
        tags,
      }
    })
    .sort((a, b) => (slug(a.name) < slug(b.name) ? -1 : 1))
}

export const clients = buildClients()
