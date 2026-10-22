/** Adresses des pages client : sur le site, ou dans l'app mobile (/mobile). */
export const routesFor = (mobile?: boolean) => {
  const root = mobile ? "/mobile" : ""
  const me = mobile ? "/mobile" : "/me"
  return {
    book: (slug: string, activity?: string) =>
      `${root}/book/${slug}${activity ? `?activity=${encodeURIComponent(activity)}` : ""}`,
    booking: (id: string) => `${me}/bookings/${id}`,
    home: mobile ? "/mobile" : "/explore",
    newPet: `${me}/pets/new`,
    pet: (id: string) => `${me}/pets/${id}`,
    pets: `${me}/pets`,
    place: (slug: string) => `${root}/places/${slug}`,
  }
}
