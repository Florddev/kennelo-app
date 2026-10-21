export type GroomingStatus = "done" | "in-progress" | "checked-in" | "upcoming"

export type GroomingAppointment = {
  id: string
  pet: string
  breed: string
  size: "Petit" | "Moyen" | "Grand"
  coat: string
  owner: string
  initials: string
  start: number
  end: number
  services: { label: string; price: number }[]
  status: GroomingStatus
  paid: boolean
  cut: string
  behaviour: string
  products: string[]
  lastVisit: string
  alert?: string
}

export const groomingSteps = [
  "Accueil",
  "Bain",
  "Séchage",
  "Coupe",
  "Finitions",
] as const

export const appointments: GroomingAppointment[] = [
  {
    behaviour: "Calme, habitué du salon",
    breed: "Caniche toy",
    coat: "Bouclé",
    cut: "Coupe agneau, 6 mm corps, pompon sur la queue",
    end: 10.25,
    id: "biscuit",
    initials: "HL",
    lastVisit: "Il y a 6 semaines",
    owner: "Hugo Lambert",
    paid: true,
    pet: "Biscuit",
    products: ["Shampoing poils blancs", "Parfum vanille"],
    services: [
      { label: "Toilettage complet", price: 48 },
      { label: "Coupe des griffes", price: 10 },
    ],
    size: "Petit",
    start: 9,
    status: "done",
  },
  {
    behaviour: "Impressionnant mais très doux, tient mal la position debout",
    breed: "Berger allemand",
    coat: "Double, sous-poil dense",
    cut: "Pas de tonte : épilation du sous-poil, coussinets dégagés",
    end: 11.5,
    id: "rex",
    initials: "KB",
    lastVisit: "Il y a 4 mois",
    owner: "Karim Benali",
    paid: false,
    pet: "Rex",
    products: ["Shampoing démêlant", "Soufflerie puissance max"],
    services: [
      { label: "Bain & séchage grand chien", price: 45 },
      { label: "Épilation du sous-poil", price: 20 },
    ],
    size: "Grand",
    start: 10.5,
    status: "in-progress",
  },
  {
    behaviour: "Sensible des oreilles, travailler doucement",
    breed: "Cocker anglais",
    coat: "Soyeux, mi-long",
    cut: "Tonte 5 mm sur le dos, jupe conservée, oreilles dégagées",
    end: 12.5,
    id: "cannelle",
    initials: "EM",
    lastVisit: "Il y a 2 mois",
    owner: "Élodie Marchand",
    paid: false,
    pet: "Cannelle",
    products: ["Shampoing poils longs", "Lotion auriculaire"],
    services: [
      { label: "Tonte & finitions ciseaux", price: 42 },
      { label: "Nettoyage des oreilles", price: 10 },
    ],
    size: "Moyen",
    start: 11.75,
    status: "upcoming",
  },
  {
    alert: "Peau sensible : shampoing hypoallergénique uniquement",
    behaviour: "Patient, aime les friandises pendant le brushing",
    breed: "Shih tzu",
    coat: "Long, tendance aux nœuds",
    cut: "Coupe teddy bear, 1 cm, visage arrondi",
    end: 15.5,
    id: "rocky",
    initials: "ED",
    lastVisit: "Il y a 5 semaines",
    owner: "Emma Dubois",
    paid: false,
    pet: "Rocky",
    products: ["Shampoing hypoallergénique", "Démêlant sans parfum"],
    services: [
      { label: "Toilettage complet", price: 52 },
      { label: "Démêlage", price: 16 },
    ],
    size: "Petit",
    start: 14,
    status: "upcoming",
  },
  {
    alert: "Stressé par le séchoir : séchage serviette et pauses",
    behaviour: "Nerveux au séchoir, peut pincer, muselière si besoin",
    breed: "Yorkshire",
    coat: "Long, soyeux",
    cut: "Coupe courte 9 mm, frange coupée",
    end: 17,
    id: "filou",
    initials: "BC",
    lastVisit: "Il y a 3 mois",
    owner: "Bernard Colin",
    paid: false,
    pet: "Filou",
    products: ["Shampoing poils longs"],
    services: [
      { label: "Coupe ciseaux", price: 35 },
      { label: "Coupe des griffes", price: 10 },
    ],
    size: "Petit",
    start: 16,
    status: "upcoming",
  },
]

export const productSales = [
  { label: "Shampoing poils blancs × 2", paid: true, price: 36 },
  { label: "Brosse démêlante", paid: true, price: 24 },
]

export const stock = [
  { label: "Shampoing hypoallergénique", level: 12 },
  { label: "Shampoing poils longs", level: 64 },
  { label: "Démêlant sans parfum", level: 38 },
  { label: "Lotion auriculaire", level: 22 },
  { label: "Parfum vanille", level: 80 },
]

export const waitlist = [
  {
    id: "pixel",
    initials: "NR",
    owner: "Nina Robert",
    pet: "Pixel",
    request: "Bain express avant de rentrer de pension",
    slot: "12h30",
  },
  {
    id: "oslo",
    initials: "SL",
    owner: "Sophie Leroy",
    pet: "Oslo",
    request: "Coupe des griffes",
    slot: "15h30",
  },
]
