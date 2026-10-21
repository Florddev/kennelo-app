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
    id: "flocon",
    initials: "AM",
    lastVisit: "Il y a 6 semaines",
    owner: "Agnès Moulin",
    paid: true,
    pet: "Flocon",
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

export type BookingStatus =
  "done" | "confirmed" | "pending" | "cancelled" | "no-show"

export type SalonBooking = {
  id: string
  /** Day offset, see components/calendar.ts */
  day: number
  start: number
  end: number
  pet: string
  breed: string
  owner: string
  service: string
  price: number
  status: BookingStatus
  note?: string
}

const booking = (
  id: string,
  day: number,
  [start, end]: [number, number],
  pet: string,
  breed: string,
  owner: string,
  service: string,
  price: number,
  status: BookingStatus = "confirmed",
  note?: string
): SalonBooking => ({
  breed,
  day,
  end,
  id,
  note,
  owner,
  pet,
  price,
  service,
  start,
  status,
})

export const salonBookings: SalonBooking[] = [
  booking(
    "pompon",
    1,
    [9, 10.5],
    "Pompon",
    "Bichon maltais",
    "Gisèle Aubert",
    "Toilettage complet",
    50,
    "done"
  ),
  booking(
    "lilou",
    1,
    [10.75, 11.5],
    "Lilou",
    "Yorkshire",
    "Sarah Klein",
    "Coupe ciseaux",
    45,
    "done"
  ),
  booking(
    "duke",
    1,
    [14, 15.5],
    "Duke",
    "Golden retriever",
    "Marc Olivier",
    "Bain & épilation",
    62,
    "done"
  ),
  booking(
    "sacha",
    1,
    [16, 16.5],
    "Sacha",
    "Teckel",
    "Pierre Brun",
    "Coupe des griffes",
    10,
    "no-show"
  ),
  ...appointments.map((a) =>
    booking(
      a.id,
      2,
      [a.start, a.end],
      a.pet,
      a.breed,
      a.owner,
      a.services[0].label,
      a.services.reduce((sum, s) => sum + s.price, 0),
      a.status === "done" ? "done" : "confirmed",
      a.alert
    )
  ),
  booking(
    "plume",
    3,
    [9, 10],
    "Plume",
    "Maine coon",
    "Nicolas Perrin",
    "Démêlage chat",
    45,
    "confirmed",
    "En pension, à récupérer en chatterie 4"
  ),
  booking(
    "hermes",
    3,
    [10.5, 12],
    "Hermès",
    "Caniche royal",
    "Louise Garnier",
    "Toilettage complet",
    85
  ),
  booking(
    "praline",
    3,
    [14, 15],
    "Praline",
    "Cavalier King Charles",
    "Lucie Henry",
    "Bain & coupe",
    48,
    "confirmed",
    "Toilettage de départ de pension"
  ),
  booking(
    "moustache",
    3,
    [15.5, 16.5],
    "Moustache",
    "Schnauzer nain",
    "Hervé Lucas",
    "Trimming",
    60
  ),
  booking(
    "bijou",
    4,
    [9.5, 10.5],
    "Bijou",
    "Shih tzu",
    "Chantal Mercier",
    "Coupe teddy bear",
    52
  ),
  booking(
    "fripouille",
    4,
    [11, 12],
    "Fripouille",
    "Westie",
    "Bruno Faure",
    "Trimming",
    58
  ),
  booking(
    "lune",
    4,
    [14, 15.5],
    "Lune",
    "Lhassa apso",
    "Thomas Petit",
    "Toilettage complet",
    68,
    "confirmed",
    "Facture du 29 sept. toujours impayée"
  ),
  booking(
    "mango",
    4,
    [16, 17],
    "Mango",
    "Spitz nain",
    "Inès Faure",
    "Bain & démêlage",
    45
  ),
  booking(
    "max",
    5,
    [9, 10],
    "Max",
    "Golden retriever",
    "Camille Martin",
    "Toilettage complet",
    55,
    "pending",
    "Toilettage de départ, en pension box 4"
  ),
  booking(
    "biscuit",
    5,
    [10, 11],
    "Biscuit",
    "Caniche toy",
    "Hugo Lambert",
    "Coupe & griffes",
    48,
    "pending"
  ),
  booking(
    "pepper",
    5,
    [11.5, 12.5],
    "Pepper",
    "Border collie",
    "Laura Mercier",
    "Bain & séchage",
    40
  ),
  booking(
    "choco",
    5,
    [14, 15],
    "Choco",
    "Labrador",
    "Romane Gilles",
    "Bain & séchage",
    45
  ),
  booking(
    "taiga",
    5,
    [15, 16.25],
    "Taïga",
    "Husky",
    "Hélène Garcia",
    "Épilation du sous-poil",
    65,
    "confirmed",
    "Toilettage de départ de pension"
  ),
  booking(
    "ficelle",
    5,
    [16.5, 17.5],
    "Ficelle",
    "Whippet",
    "Anne Lefèvre",
    "Bain",
    35,
    "cancelled"
  ),
  booking(
    "bella",
    8,
    [9, 10],
    "Bella",
    "Border collie",
    "Romain Petit",
    "Bain & séchage",
    45
  ),
  booking(
    "hermine",
    8,
    [14, 15.5],
    "Hermine",
    "Samoyède",
    "Jade Perret",
    "Bain & démêlage",
    75
  ),
  booking(
    "oscar",
    9,
    [10, 11],
    "Oscar",
    "Labrador",
    "Julie Masson",
    "Bain & griffes",
    48
  ),
  booking(
    "kiwi",
    9,
    [15, 16],
    "Kiwi",
    "Spitz nain",
    "Agathe Leroux",
    "Coupe ciseaux",
    45,
    "confirmed",
    "Toilettage de départ de pension"
  ),
  booking(
    "gaston",
    10,
    [9.5, 10.5],
    "Gaston",
    "Épagneul breton",
    "Céline Marchal",
    "Bain",
    42
  ),
  booking(
    "sultan",
    11,
    [14, 15.5],
    "Sultan",
    "Dogue allemand",
    "Patrick Morin",
    "Bain grand gabarit",
    80
  ),
  booking(
    "hercule",
    12,
    [9, 10],
    "Hercule",
    "Bouledogue français",
    "Olivier Blanc",
    "Bain & soin de peau",
    45
  ),
  booking(
    "lilou-2",
    12,
    [10.5, 11.25],
    "Lilou",
    "Yorkshire",
    "Sarah Klein",
    "Coupe ciseaux",
    45
  ),
  booking(
    "moustache-2",
    12,
    [14, 15],
    "Moustache",
    "Schnauzer nain",
    "Hervé Lucas",
    "Trimming",
    60,
    "pending"
  ),
]

export const services = [
  { duration: "30 – 60 min", label: "Bain & séchage", prices: [30, 38, 45] },
  { duration: "1h – 2h", label: "Toilettage complet", prices: [48, 58, 75] },
  { duration: "1h", label: "Coupe ciseaux", prices: [35, 45, 60] },
  {
    duration: "1h – 1h30",
    label: "Épilation · trimming",
    prices: [45, 55, 65],
  },
  {
    duration: "15 – 30 min",
    label: "Démêlage (supplément)",
    prices: [10, 16, 20],
  },
  { duration: "15 min", label: "Coupe des griffes", prices: [10, 10, 12] },
  { duration: "1h", label: "Toilettage chat", prices: [45, 45, 55] },
]
