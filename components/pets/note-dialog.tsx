"use client"

import { Camera01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import type { Activity } from "@/components/activity-mark"
import {
  type PetNote,
  type PetProfile,
  TODAY_ISO,
} from "@/components/pets/data"
import { Photo, PhotoButton } from "@/components/site/site-ui"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const suggestions: Record<Activity, string[]> = {
  Éducation: ["Rappel acquis", "Très concentré", "Progrès", "À retravailler"],
  Pension: [
    "A bien mangé",
    "A bien dormi",
    "Très joueur",
    "Copain avec les autres",
    "Un peu stressé",
  ],
  Toilettage: ["Très sage", "Poil emmêlé", "Peau sensible", "Griffes coupées"],
}

const moodRows = [
  { key: "appetite", label: "Appétit" },
  { key: "sleep", label: "Sommeil" },
  { key: "play", label: "Moral" },
] as const

const levels = ["Moyen", "Bon", "Excellent"]

const chip =
  "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors"
const chipOn = "bg-control text-control-foreground"
const chipOff = "bg-secondary text-secondary-foreground hover:bg-neutral-hover"

/** « Laisser un mot » : ce que le pro raconte au propriétaire après une visite. */
export function NoteDialog({
  pet,
  open,
  onOpenChange,
  onSave,
}: {
  pet: PetProfile
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (note: PetNote) => void
}) {
  const owner = pet.owner.name.split(" ")[0]
  const [activity, setActivity] = useState<Activity>(
    pet.activities[0] ?? "Pension"
  )
  const [text, setText] = useState("")
  const [mood, setMood] = useState({ appetite: 3, play: 3, sleep: 3 })
  const [tags, setTags] = useState<string[]>([])
  const [tip, setTip] = useState("")
  const [photos, setPhotos] = useState<string[]>([])
  const [shared, setShared] = useState(true)

  const save = () => {
    onSave({
      activity,
      author: "Alex Martin",
      date: TODAY_ISO,
      mood: activity === "Pension" ? mood : undefined,
      photos,
      shared,
      tags,
      text: text.trim(),
      tip: tip.trim() || undefined,
    })
    setText("")
    setTags([])
    setTip("")
    setPhotos([])
    onOpenChange(false)
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Un mot sur {pet.name}</DialogTitle>
          <DialogDescription>
            {shared
              ? `${owner} le recevra et le retrouvera sur le profil de ${pet.name}.`
              : "Visible seulement par votre équipe."}
          </DialogDescription>
        </DialogHeader>
        <DialogPanel className="space-y-6">
          {pet.activities.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {pet.activities.map((a) => (
                <button
                  aria-pressed={a === activity}
                  className={cn(chip, a === activity ? chipOn : chipOff)}
                  key={a}
                  onClick={() => {
                    setActivity(a)
                    setTags([])
                  }}
                  type="button"
                >
                  {a}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label className="font-semibold" htmlFor="note-text">
              Comment s&apos;est passée la visite ?
            </Label>
            <Textarea
              id="note-text"
              onChange={(e) => setText(e.target.value)}
              placeholder={`${pet.name} a joué au parc, bien mangé…`}
              rows={4}
              value={text}
            />
          </div>

          {activity === "Pension" && (
            <div className="space-y-3">
              <p className="font-semibold">Son bulletin</p>
              {moodRows.map((row) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-2"
                  key={row.key}
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <div className="flex gap-1.5">
                    {levels.map((level, i) => (
                      <button
                        aria-pressed={mood[row.key] === i + 1}
                        className={cn(
                          chip,
                          mood[row.key] === i + 1 ? chipOn : chipOff
                        )}
                        key={level}
                        onClick={() =>
                          setMood((m) => ({ ...m, [row.key]: i + 1 }))
                        }
                        type="button"
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <p className="font-semibold">En quelques mots</p>
            <div className="flex flex-wrap gap-2">
              {suggestions[activity].map((t) => {
                const on = tags.includes(t)
                return (
                  <button
                    aria-pressed={on}
                    className={cn(chip, on ? chipOn : chipOff)}
                    key={t}
                    onClick={() =>
                      setTags((list) =>
                        on ? list.filter((x) => x !== t) : [...list, t]
                      )
                    }
                    type="button"
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold" htmlFor="note-tip">
              Un conseil pour {owner} (facultatif)
            </Label>
            <Input
              id="note-tip"
              onChange={(e) => setTip(e.target.value)}
              placeholder="Brosser derrière les oreilles deux fois par semaine"
              value={tip}
            />
          </div>

          <div className="space-y-3">
            <p className="font-semibold">Photos</p>
            <div className="flex flex-wrap gap-2">
              {photos.map((p) => (
                <div className="relative" key={p}>
                  <Photo alt="" className="size-20 rounded-2xl" src={p} />
                  <button
                    aria-label="Retirer la photo"
                    className="absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full bg-foreground text-background"
                    onClick={() =>
                      setPhotos((list) => list.filter((x) => x !== p))
                    }
                    type="button"
                  >
                    <HugeiconsIcon className="size-3.5" icon={Cancel01Icon} />
                  </button>
                </div>
              ))}
              <PhotoButton
                className="size-20 flex-col gap-1 rounded-2xl border-2 border-dashed text-sm"
                onPick={(url) => setPhotos((list) => [...list, url])}
                variant="ghost"
              >
                <HugeiconsIcon icon={Camera01Icon} />
                Ajouter
              </PhotoButton>
            </div>
          </div>

          <Label className="flex items-center justify-between gap-4 rounded-2xl bg-muted p-4 font-semibold">
            Envoyer à {owner}
            <Switch checked={shared} onCheckedChange={setShared} />
          </Label>
        </DialogPanel>
        <DialogFooter variant="bare">
          <DialogClose render={<Button variant="ghost" />}>Annuler</DialogClose>
          <Button disabled={!text.trim()} onClick={save}>
            {shared ? `Envoyer à ${owner}` : "Enregistrer la note"}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
