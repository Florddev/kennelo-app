import type { Activity } from "@/components/activity-mark"

export type InvoiceStatus = "paid" | "pending" | "overdue" | "draft"

export type Invoice = {
  number: string
  client: string
  subject: string
  detail: string
  /** Day offsets, see components/calendar.ts */
  issued: number
  due: number
  status: InvoiceStatus
  method?: string
  /** Activity specific column (stay dates, payment method, schedule…). */
  extra: string
  lines: { label: string; quantity: number; unit: number }[]
  reminders?: number
}

export type InvoiceBook = {
  extraLabel: string
  months: { label: string; amount: number }[]
  invoices: Invoice[]
}

const months = (values: number[]) =>
  ["Mai", "Juin", "Juil.", "Août", "Sept.", "Oct."].map((label, i) => ({
    amount: values[i],
    label,
  }))

export const invoiceBooks: Record<Activity, InvoiceBook> = {
  Pension: {
    extraLabel: "Séjour",
    invoices: [
      {
        client: "Hugo Lambert",
        detail: "Sirius · Box 18",
        due: 2,
        extra: "14 → 21 oct. · 7 nuits",
        issued: 2,
        lines: [
          { label: "Nuits en box", quantity: 7, unit: 25 },
          { label: "Promenades +", quantity: 7, unit: 6 },
          { label: "Toilettage de départ", quantity: 1, unit: 35 },
          { label: "Acompte déjà versé", quantity: 1, unit: -76 },
        ],
        number: "F-2026-0164",
        status: "pending",
        subject: "Solde du séjour",
      },
      {
        client: "Nina Robert",
        detail: "Pixel · Box 14",
        due: 2,
        extra: "16 → 21 oct. · 5 nuits",
        issued: 2,
        lines: [
          { label: "Nuits en box", quantity: 5, unit: 25 },
          { label: "Acompte déjà versé", quantity: 1, unit: -38 },
        ],
        number: "F-2026-0163",
        status: "pending",
        subject: "Solde du séjour",
      },
      {
        client: "Lucas Garnier",
        detail: "Caramel · Box 5",
        due: 2,
        extra: "16 → 21 oct. · 5 nuits",
        issued: 2,
        lines: [
          { label: "Nuits en box", quantity: 5, unit: 25 },
          { label: "Toilettage de départ", quantity: 1, unit: 35 },
        ],
        method: "Carte bancaire",
        number: "F-2026-0162",
        status: "paid",
        subject: "Séjour",
      },
      {
        client: "Léa Moreau",
        detail: "Nala · Box 7",
        due: 4,
        extra: "30 oct. → 2 nov. · 3 nuits",
        issued: 2,
        lines: [{ label: "Acompte 30 % · 3 nuits", quantity: 1, unit: 23 }],
        number: "Brouillon",
        status: "draft",
        subject: "Acompte de réservation",
      },
      {
        client: "Famille Lemoine",
        detail: "Ténor · Box 4",
        due: 3,
        extra: "26 → 31 oct. · 5 nuits",
        issued: 1,
        lines: [{ label: "Acompte 30 % · 5 nuits", quantity: 1, unit: 42 }],
        method: "Virement",
        number: "F-2026-0161",
        status: "paid",
        subject: "Acompte de réservation",
      },
      {
        client: "Emma Dubois",
        detail: "Rocky · Box 11",
        due: 0,
        extra: "20 → 27 déc. · 7 nuits",
        issued: -4,
        lines: [{ label: "Acompte 30 % · 7 nuits", quantity: 1, unit: 53 }],
        method: "Carte bancaire",
        number: "F-2026-0158",
        status: "paid",
        subject: "Acompte · séjour de Noël",
      },
      {
        client: "Benoît Caron",
        detail: "Rio · Box 12",
        due: -1,
        extra: "12 → 16 oct. · 4 nuits",
        issued: -3,
        lines: [
          { label: "Nuits en box", quantity: 4, unit: 25 },
          { label: "Promenades +", quantity: 4, unit: 6 },
          { label: "Acompte déjà versé", quantity: 1, unit: -37 },
        ],
        number: "F-2026-0157",
        reminders: 1,
        status: "overdue",
        subject: "Solde du séjour",
      },
      {
        client: "Patrick Morin",
        detail: "Sultan · Box 3",
        due: -2,
        extra: "10 → 17 oct. · 7 nuits",
        issued: -2,
        lines: [{ label: "Nuits en box", quantity: 7, unit: 25 }],
        method: "Carte bancaire",
        number: "F-2026-0156",
        status: "paid",
        subject: "Séjour",
      },
      {
        client: "Émilie Roy",
        detail: "Choupette · Chatterie 4",
        due: -1,
        extra: "11 → 18 oct. · 7 nuits",
        issued: -1,
        lines: [
          { label: "Nuits en chatterie", quantity: 7, unit: 16 },
          { label: "Régime particulier", quantity: 7, unit: 2 },
        ],
        method: "Espèces",
        number: "F-2026-0155",
        status: "paid",
        subject: "Séjour",
      },
      {
        client: "Anne Lefèvre",
        detail: "Ficelle · Box 16",
        due: 0,
        extra: "13 → 19 oct. · 6 nuits",
        issued: 0,
        lines: [{ label: "Nuits en box", quantity: 6, unit: 25 }],
        method: "Virement",
        number: "F-2026-0154",
        status: "paid",
        subject: "Séjour",
      },
      {
        client: "Julien Bernard",
        detail: "Pistache · Chatterie 1",
        due: -6,
        extra: "3 → 10 oct. · 7 nuits",
        issued: -9,
        lines: [
          { label: "Nuits en chatterie", quantity: 7, unit: 16 },
          { label: "Régime particulier", quantity: 7, unit: 2 },
        ],
        method: "Carte bancaire",
        number: "F-2026-0149",
        status: "paid",
        subject: "Séjour",
      },
    ],
    months: months([3120, 4850, 7920, 8640, 4210, 3980]),
  },
  Toilettage: {
    extraLabel: "Paiement",
    invoices: [
      {
        client: "Karim Benali",
        detail: "Rex · Berger allemand",
        due: 2,
        extra: "À l'encaissement",
        issued: 2,
        lines: [
          { label: "Bain & séchage grand chien", quantity: 1, unit: 45 },
          { label: "Épilation du sous-poil", quantity: 1, unit: 20 },
        ],
        number: "T-2026-0412",
        status: "pending",
        subject: "Bain & épilation",
      },
      {
        client: "Agnès Moulin",
        detail: "Flocon · Caniche toy",
        due: 2,
        extra: "Carte bancaire",
        issued: 2,
        lines: [
          { label: "Toilettage complet", quantity: 1, unit: 48 },
          { label: "Coupe des griffes", quantity: 1, unit: 10 },
        ],
        method: "Carte bancaire",
        number: "T-2026-0411",
        status: "paid",
        subject: "Toilettage complet",
      },
      {
        client: "Ventes comptoir",
        detail: "2 clients",
        due: 2,
        extra: "Carte bancaire",
        issued: 2,
        lines: [
          { label: "Shampoing poils blancs", quantity: 2, unit: 18 },
          { label: "Brosse démêlante", quantity: 1, unit: 24 },
        ],
        method: "Carte bancaire",
        number: "T-2026-0410",
        status: "paid",
        subject: "Vente de produits",
      },
      {
        client: "Marc Olivier",
        detail: "Duke · Golden retriever",
        due: 1,
        extra: "Carte bancaire",
        issued: 1,
        lines: [{ label: "Bain & épilation", quantity: 1, unit: 62 }],
        method: "Carte bancaire",
        number: "T-2026-0409",
        status: "paid",
        subject: "Bain & épilation",
      },
      {
        client: "Sarah Klein",
        detail: "Lilou · Yorkshire",
        due: 1,
        extra: "Espèces",
        issued: 1,
        lines: [{ label: "Coupe ciseaux", quantity: 1, unit: 45 }],
        method: "Espèces",
        number: "T-2026-0408",
        status: "paid",
        subject: "Coupe ciseaux",
      },
      {
        client: "Gisèle Aubert",
        detail: "Pompon · Bichon maltais",
        due: 1,
        extra: "Espèces",
        issued: 1,
        lines: [{ label: "Toilettage complet", quantity: 1, unit: 50 }],
        method: "Espèces",
        number: "T-2026-0407",
        status: "paid",
        subject: "Toilettage complet",
      },
      {
        client: "Pierre Brun",
        detail: "Sacha · Teckel",
        due: 9,
        extra: "Lien de paiement",
        issued: 2,
        lines: [{ label: "Rendez-vous non honoré", quantity: 1, unit: 10 }],
        number: "T-2026-0406",
        status: "pending",
        subject: "Frais d'absence",
      },
      {
        client: "Emma Dubois",
        detail: "Rocky · Shih tzu",
        due: 9,
        extra: "Carte cadeau",
        issued: 2,
        lines: [
          { label: "Forfait 5 toilettages complets", quantity: 1, unit: 240 },
        ],
        number: "Brouillon",
        status: "draft",
        subject: "Forfait fidélité",
      },
      {
        client: "Thomas Petit",
        detail: "Lune · Lhassa apso",
        due: -13,
        extra: "Lien de paiement",
        issued: -20,
        lines: [
          { label: "Toilettage complet", quantity: 1, unit: 68 },
          { label: "Soin hydratant", quantity: 1, unit: 21 },
        ],
        number: "F-2026-0142",
        reminders: 2,
        status: "overdue",
        subject: "Toilettage & soin",
      },
    ],
    months: months([2340, 2610, 2980, 2450, 2380, 2120]),
  },
  Éducation: {
    extraLabel: "Échéancier",
    invoices: [
      {
        client: "Sophie Leroy",
        detail: "Oslo · Programme rappel",
        due: 17,
        extra: "2 sur 3 versements",
        issued: -12,
        lines: [
          { label: "Programme rappel · 10 séances", quantity: 1, unit: 450 },
        ],
        number: "E-2026-0087",
        status: "pending",
        subject: "Programme individuel",
      },
      {
        client: "Mathieu Dupuis",
        detail: "Hachiko · Marche en laisse",
        due: 9,
        extra: "1 sur 2 versements",
        issued: -5,
        lines: [
          { label: "Programme à domicile · 6 séances", quantity: 1, unit: 300 },
          { label: "Frais de déplacement", quantity: 6, unit: 5 },
        ],
        number: "E-2026-0089",
        status: "pending",
        subject: "Programme à domicile",
      },
      {
        client: "Laura Mercier",
        detail: "Pepper · Gestion de l'excitation",
        due: -10,
        extra: "Payé en 1 fois",
        issued: -17,
        lines: [
          { label: "Programme individuel · 8 séances", quantity: 1, unit: 360 },
        ],
        method: "Virement",
        number: "E-2026-0084",
        status: "paid",
        subject: "Programme individuel",
      },
      {
        client: "Karim Benali",
        detail: "Rex · Éducation de base",
        due: -30,
        extra: "Payé en 1 fois",
        issued: -37,
        lines: [
          { label: "Éducation de base · 8 séances", quantity: 1, unit: 320 },
        ],
        method: "Chèque",
        number: "E-2026-0079",
        status: "paid",
        subject: "Programme individuel",
      },
      ...[
        ["Léna Bertin", "Tofu", "paid"],
        ["Famille Durand", "Biscotte", "paid"],
        ["Alice Roche", "Pruneau", "paid"],
        ["Thomas Girard", "Luna", "paid"],
        ["Chloé Faure", "Pepito", "pending"],
        ["Maxime Vidal", "Nouille", "overdue"],
      ].map(([client, dog, status], i) => ({
        client,
        detail: `${dog} · École du chiot`,
        due: status === "overdue" ? -4 : 5,
        extra: "Payé en 1 fois",
        issued: -11,
        lines: [
          { label: "École du chiot · 6 séances", quantity: 1, unit: 120 },
        ],
        method: status === "paid" ? "Carte bancaire" : undefined,
        number: `E-2026-00${90 + i}`,
        reminders: status === "overdue" ? 1 : undefined,
        status: status as InvoiceStatus,
        subject: "Cours collectif",
      })),
      {
        client: "Laura Mercier",
        detail: "Pepper · Agility loisir",
        due: -2,
        extra: "Payé en 1 fois",
        issued: -2,
        lines: [{ label: "Carte 10 séances agility", quantity: 1, unit: 135 }],
        method: "Carte bancaire",
        number: "E-2026-0088",
        status: "paid",
        subject: "Carte de séances",
      },
      {
        client: "Paul Girard",
        detail: "Moka · Bilan comportemental",
        due: 4,
        extra: "Payé en 1 fois",
        issued: 2,
        lines: [
          { label: "Bilan comportemental à domicile", quantity: 1, unit: 65 },
        ],
        number: "Brouillon",
        status: "draft",
        subject: "Bilan comportemental",
      },
    ],
    months: months([1850, 1620, 980, 1240, 2310, 2680]),
  },
}

export const invoiceTotal = (invoice: Invoice) =>
  invoice.lines.reduce((sum, line) => sum + line.quantity * line.unit, 0)
