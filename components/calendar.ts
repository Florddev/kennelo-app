/**
 * Demo calendar helpers. Days are offsets from Monday 19 October 2026, so the
 * demo "today" (Wednesday 21 October) is offset 2.
 */
export const TODAY = 2

const weekdays = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."]
const longWeekdays = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
]

export function dateOf(offset: number) {
  const day = 19 + offset
  if (day > 31) return { day: day - 31, month: "nov." }
  if (day < 1) return { day: day + 30, month: "sept." }
  return { day, month: "oct." }
}

export const weekdayOf = (offset: number) => weekdays[((offset % 7) + 7) % 7]

export const isWeekend = (offset: number) => ((offset % 7) + 7) % 7 >= 5

/** "Mer. 21 oct." */
export function shortDate(offset: number) {
  const { day, month } = dateOf(offset)
  return `${weekdayOf(offset)} ${day} ${month}`
}

/** "Mercredi 21 octobre" */
export function longDate(offset: number) {
  const { day, month } = dateOf(offset)
  const fullMonth = {
    "nov.": "novembre",
    "oct.": "octobre",
    "sept.": "septembre",
  }[month]
  return `${longWeekdays[((offset % 7) + 7) % 7]} ${day} ${fullMonth}`
}

/** "Aujourd'hui", "Demain", "Hier" or the short date. */
export function relativeDate(offset: number) {
  if (offset === TODAY) return "Aujourd'hui"
  if (offset === TODAY + 1) return "Demain"
  if (offset === TODAY - 1) return "Hier"
  return shortDate(offset)
}
