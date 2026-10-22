import type { Activity } from "@/components/activity-mark"

/* ——— Établissements visibles sur le site ——— */

/** Photo Unsplash ; la largeur est ajustée à l'affichage. */
export const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`

export type Venue = {
  slug: string
  name: string
  city: string
  address: string
  distance: number
  rating: number
  reviews: number
  activities: Activity[]
  species: ("Chien" | "Chat")[]
  /** Types d'hébergement repris du catalogue de démonstration. */
  places?: string[]
  /** Multiplie les prix du catalogue de démonstration. */
  factor: number
  tone: string
  /** La première sert de couverture. */
  photos: string[]
  tagline: string
  about: string
  highlights: string[]
  /** Réservation confirmée tout de suite, sinon sur demande. */
  instant: boolean
  response: string
  hours: string
  owner: string
  since: number
  weekend: boolean
  /** Position sur la carte, en %. */
  pos: [number, number]
}

export const venues: Venue[] = [
  {
    about:
      "Une pension familiale au milieu des vignes : 2 hectares de parcs clôturés, des box chauffés et une équipe présente jour et nuit. On envoie des photos tous les jours.",
    activities: ["Pension", "Toilettage", "Éducation"],
    address: "12 chemin des Coteaux, 33500 Libourne",
    city: "Libourne",
    distance: 3.2,
    factor: 1,
    highlights: [
      "2 ha de parcs clôturés",
      "Présence 24 h/24",
      "Photos tous les jours",
      "Box chauffés",
    ],
    hours: "Lun – Sam · 8h – 19h",
    instant: true,
    name: "Les Coteaux",
    owner: "Claire Martin",
    pos: [62, 38],
    rating: 4.9,
    response: "Répond en 1 h",
    reviews: 128,
    since: 2016,
    photos: [
      photo("1548199973-03cce0bbc87b"),
      photo("1581888227599-779811939961"),
      photo("1516734212186-a967f81ad0d7"),
      photo("1525253086316-d0c936c814f8"),
      photo("1594149929911-78975a43d4f5"),
      photo("1600369671236-e74521d4b6ad"),
    ],
    slug: "les-coteaux",
    species: ["Chien", "Chat"],
    tagline: "Pension, toilettage et éducation au cœur des vignes",
    tone: "bg-wise-orange text-wise-maroon",
    weekend: true,
  },
  {
    about:
      "Un grand domaine pour les chiens qui aiment courir. Sorties en groupe deux fois par jour et piscine l'été.",
    activities: ["Pension"],
    address: "Lieu-dit Bellevue, 33370 Tresses",
    city: "Tresses",
    distance: 7.8,
    factor: 1.12,
    highlights: ["Piscine l'été", "Sorties en groupe", "Webcam"],
    hours: "Tous les jours · 9h – 18h",
    instant: false,
    name: "Domaine des Pattes",
    owner: "Thomas Roux",
    places: ["Box", "Box famille"],
    pos: [44, 54],
    rating: 4.8,
    response: "Répond en 3 h",
    reviews: 86,
    since: 2019,
    photos: [
      photo("1534361960057-19889db9621e"),
      photo("1530281700549-e82e7bf110d6"),
      photo("1444212477490-ca407925329e"),
      photo("1544568100-847a948585b9"),
      photo("1576201836106-db1758fd1c97"),
    ],
    slug: "domaine-des-pattes",
    species: ["Chien"],
    tagline: "De l'espace pour se dépenser",
    tone: "bg-wise-yellow text-wise-gold",
    weekend: true,
  },
  {
    about:
      "Salon de toilettage tout doux aux Chartrons. Produits naturels, pas de cage, un animal à la fois.",
    activities: ["Toilettage"],
    address: "48 rue Notre-Dame, 33000 Bordeaux",
    city: "Bordeaux",
    distance: 1.4,
    factor: 1.1,
    highlights: ["Un animal à la fois", "Produits naturels", "Sans cage"],
    hours: "Mar – Sam · 9h – 18h30",
    instant: false,
    name: "Chic & Chien",
    owner: "Inès Garcia",
    pos: [30, 30],
    rating: 4.7,
    response: "Répond en 2 h",
    reviews: 214,
    since: 2014,
    photos: [
      photo("1596492784531-6e6eb5ea9993"),
      photo("1516734212186-a967f81ad0d7"),
      photo("1625316708582-7c38734be31d"),
      photo("1583511655857-d19b40a7a54e"),
      photo("1543852786-1cf6624b9987"),
    ],
    slug: "chic-et-chien",
    species: ["Chien", "Chat"],
    tagline: "Le toilettage sans stress",
    tone: "bg-wise-pink text-wise-purple",
    weekend: false,
  },
  {
    about:
      "Éducation positive, à domicile ou sur notre terrain. Cours collectifs le samedi matin.",
    activities: ["Éducation"],
    address: "Terrain des Sablières, 33600 Pessac",
    city: "Pessac",
    distance: 6.1,
    factor: 0.95,
    highlights: ["Méthode positive", "Cours collectifs", "À domicile"],
    hours: "Lun – Sam · 9h – 20h",
    instant: true,
    name: "Éduc'Gironde",
    owner: "Hugo Lefèvre",
    pos: [22, 68],
    rating: 4.9,
    response: "Répond en 1 h",
    reviews: 57,
    since: 2020,
    photos: [
      photo("1503256207526-0d5d80fa2f47"),
      photo("1518717758536-85ae29035b6d"),
      photo("1552053831-71594a27632d"),
      photo("1576201836106-db1758fd1c97"),
      photo("1601758124510-52d02ddb7cbd"),
    ],
    slug: "educ-gironde",
    species: ["Chien"],
    tagline: "Bien vivre ensemble, sans contrainte",
    tone: "bg-wise-blue text-wise-charcoal",
    weekend: true,
  },
  {
    about:
      "Une pension réservée aux chats, au calme, avec vue sur le lac. Chaque chambre a son arbre à chat et sa fenêtre.",
    activities: ["Pension"],
    address: "3 allée du Lac, 33300 Bordeaux",
    city: "Bordeaux Lac",
    distance: 4.5,
    factor: 1.05,
    highlights: ["Chats uniquement", "Chambres avec vue", "Calme absolu"],
    hours: "Tous les jours · 10h – 18h",
    instant: true,
    name: "Chatterie du Lac",
    owner: "Sophie Bernard",
    places: ["Chatterie"],
    pos: [40, 18],
    rating: 4.9,
    response: "Répond en 1 h",
    reviews: 73,
    since: 2018,
    photos: [
      photo("1573865526739-10659fec78a5"),
      photo("1519052537078-e6302a4968d4"),
      photo("1513360371669-4adf3dd7dff8"),
      photo("1592194996308-7b43878e84a6"),
      photo("1511044568932-338cba0ad803"),
    ],
    slug: "chatterie-du-lac",
    species: ["Chat"],
    tagline: "Le calme pour les chats",
    tone: "bg-wise-blue text-wise-charcoal",
    weekend: false,
  },
  {
    about:
      "Bain, coupe, griffes : un salon de quartier qui prend le temps. Tarifs clairs selon la taille et le poil.",
    activities: ["Toilettage"],
    address: "9 cours de l'Yser, 33800 Bordeaux",
    city: "Bordeaux",
    distance: 2.2,
    factor: 0.92,
    highlights: ["Tarifs clairs", "Créneaux le samedi"],
    hours: "Lun – Sam · 8h30 – 18h",
    instant: true,
    name: "Poils & Bulles",
    owner: "Marc Dubois",
    pos: [36, 46],
    rating: 4.6,
    response: "Répond en 4 h",
    reviews: 162,
    since: 2012,
    photos: [
      photo("1625316708582-7c38734be31d"),
      photo("1561037404-61cd46aa615b"),
      photo("1598133894008-61f7fdb8cc3a"),
      photo("1517849845537-4d257902454a"),
      photo("1591769225440-811ad7d6eab3"),
    ],
    slug: "poils-et-bulles",
    species: ["Chien", "Chat"],
    tagline: "Le salon de quartier",
    tone: "bg-wise-pink text-wise-purple",
    weekend: true,
  },
  {
    about:
      "Une ferme où les chiens vivent en meute, encadrés par une éducatrice. Pension et stages d'éducation pendant le séjour.",
    activities: ["Pension", "Éducation"],
    address: "Ferme de Lagrange, 33750 Saint-Germain-du-Puch",
    city: "Saint-Germain-du-Puch",
    distance: 14.6,
    factor: 0.9,
    highlights: ["Vie en meute", "Stages pendant le séjour", "Grand air"],
    hours: "Tous les jours · 8h – 20h",
    instant: false,
    name: "Ferme de Lagrange",
    owner: "Élodie Petit",
    places: ["Box", "Box famille"],
    pos: [74, 62],
    rating: 4.8,
    response: "Répond en 5 h",
    reviews: 41,
    since: 2021,
    photos: [
      photo("1444212477490-ca407925329e"),
      photo("1544568100-847a948585b9"),
      photo("1450778869180-41d0601e046e"),
      photo("1543466835-00a7907e9de1"),
      photo("1558788353-f76d92427f16"),
    ],
    slug: "ferme-de-lagrange",
    species: ["Chien"],
    tagline: "La vie à la ferme, en meute",
    tone: "bg-wise-orange text-wise-maroon",
    weekend: true,
  },
]

export const venueOf = (slug: string) => venues.find((v) => v.slug === slug)

/** Identifiant de l'activité dans le catalogue de démonstration. */
export const catalogIds: Record<Activity, string> = {
  Éducation: "training",
  Pension: "pension",
  Toilettage: "grooming",
}

export const scale = (venue: Venue, price: number) =>
  Math.round(price * venue.factor)

export const ratingText = (n: number) => n.toFixed(1).replace(".", ",")

export const reviewPool = [
  {
    author: "Camille D.",
    date: "2026-10-02",
    pet: "Nala, Golden",
    rating: 5,
    text: "Nala est revenue fatiguée et heureuse. Les photos chaque soir, c'est un vrai plus quand on est loin.",
  },
  {
    author: "Antoine L.",
    date: "2026-09-18",
    pet: "Pixel, chat européen",
    rating: 5,
    text: "Équipe aux petits soins, réponses rapides. On reviendra sans hésiter.",
  },
  {
    author: "Marion P.",
    date: "2026-08-27",
    pet: "Rocky, Jack Russell",
    rating: 4,
    text: "Très bon accueil. Un peu de monde au départ le dimanche, mais tout était parfait pour Rocky.",
  },
  {
    author: "Karim B.",
    date: "2026-08-03",
    pet: "Ulysse, Berger blanc",
    rating: 5,
    text: "Des explications claires, un vrai suivi. Ulysse a fait d'énormes progrès.",
  },
]

/** Photos des tuiles et du haut de la page Découvrir. */
export const explorePhotos = {
  hero: [
    photo("1543466835-00a7907e9de1"),
    photo("1574158622682-e40e69881006"),
    photo("1537151625747-768eb6cf92b2"),
  ],
  tiles: {
    Éducation: [photo("1503256207526-0d5d80fa2f47")][0],
    Pension: [photo("1581888227599-779811939961")][0],
    Toilettage: [photo("1596492784531-6e6eb5ea9993")][0],
  },
}
