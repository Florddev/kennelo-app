"use client"

import { useRouter } from "next/navigation"
import {
  OfferControls,
  serviceMeta,
} from "@/components/services/activity-offers"
import {
  addOffers,
  deleteService,
  gridSummary,
  journeyOf,
  removeOffer,
  type Service,
  saveService,
  updateOffer,
  useCatalog,
} from "@/components/services/data"
import { ActivityDot, GridEditor } from "@/components/services/service-form"
import {
  SettingsPage,
  SettingsRow,
  SettingsSection,
} from "@/components/settings/settings-ui"
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

/** Gestion d'une prestation depuis son activité principale. */
export function ServiceSettings({ serviceId }: { serviceId: string }) {
  const catalog = useCatalog()
  const router = useRouter()
  const service = catalog.services.find((s) => s.id === serviceId)
  const activity = catalog.activities.find((a) => a.id === service?.owner)

  if (!service || !activity)
    return (
      <SettingsPage
        back={{ href: "/settings/activities", label: "Activités" }}
        description="Elle a peut-être été supprimée. Les données de démonstration se réinitialisent au rechargement."
        title="Prestation introuvable"
      >
        {null}
      </SettingsPage>
    )

  const back = activity.pricingHref ?? `/settings/activities/${activity.id}`
  const save = (patch: Partial<Service>) =>
    saveService({ ...service, ...patch })
  const offerOf = (activityId: string) =>
    catalog.offers[activityId]?.find((o) => o.serviceId === service.id)
  const offer = offerOf(activity.id)
  const others = catalog.activities.filter((a) => a.id !== activity.id)
  const borrowers = others.filter((a) => offerOf(a.id))

  return (
    <SettingsPage
      action={
        <Label className="gap-2 font-normal">
          Active
          <Switch
            checked={service.active}
            onCheckedChange={(active) => save({ active })}
          />
        </Label>
      }
      back={{ href: back, label: activity.name }}
      description={`Prestation principale de ${activity.name} · ${serviceMeta(service)}`}
      title={
        <>
          {service.name || "Sans nom"}
          {service.bundle && <Badge variant="outline">Forfait</Badge>}
          {!service.active && <Badge variant="warning">Désactivée</Badge>}
        </>
      }
    >
      <SettingsSection title="Général">
        <SettingsRow title="Nom">
          <Input
            aria-label="Nom"
            className="w-full sm:w-64"
            onChange={(e) => save({ name: e.target.value })}
            value={service.name}
          />
        </SettingsRow>
        <SettingsRow title="Description">
          <Input
            aria-label="Description"
            className="w-full sm:w-64"
            onChange={(e) => save({ description: e.target.value })}
            value={service.description}
          />
        </SettingsRow>
        <SettingsRow
          description="A une durée et occupe un membre de l'équipe"
          title="Se place dans l'agenda"
        >
          <Switch
            checked={service.scheduled}
            onCheckedChange={(scheduled) => save({ scheduled })}
          />
        </SettingsRow>
        {activity.metier === "toilettage" && (
          <SettingsRow
            description="Sinon, un prix par espèce"
            title="Prix selon taille, poil et race"
          >
            <Switch
              checked={service.detailed}
              onCheckedChange={(detailed) => save({ detailed })}
            />
          </SettingsRow>
        )}
        <SettingsRow
          description="Regroupe plusieurs prestations, avec son propre prix. Composition indicative."
          title="Forfait"
        >
          <Switch
            checked={service.bundle !== undefined}
            onCheckedChange={(on) => save({ bundle: on ? [] : undefined })}
          />
        </SettingsRow>
        {service.bundle && (
          <div className="flex flex-wrap gap-2 px-5 py-4">
            {catalog.services
              .filter((s) => s.id !== service.id && !s.bundle)
              .map((s) => {
                const on = service.bundle!.includes(s.id)
                return (
                  <Button
                    aria-pressed={on}
                    key={s.id}
                    onClick={() =>
                      save({
                        bundle: on
                          ? service.bundle!.filter((id) => id !== s.id)
                          : [...service.bundle!, s.id],
                      })
                    }
                    className={
                      on
                        ? "bg-control text-control-foreground hover:bg-control/90"
                        : undefined
                    }
                    variant="secondary"
                  >
                    {s.name}
                  </Button>
                )
              })}
          </div>
        )}
      </SettingsSection>

      <SettingsSection
        description="La ligne la plus précise l'emporte. Sans ligne pour un animal, la prestation ne lui est pas proposée."
        title="Grille de prix par animal"
      >
        <div className="p-5">
          <GridEditor
            detailed={service.detailed}
            onChange={(grid) => save({ grid })}
            rows={service.grid}
            scheduled={service.scheduled}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        description="Ajustement appliqué à la grille pour cette activité"
        title={`Vente dans ${activity.name}`}
      >
        {offer ? (
          <>
            <SettingsRow title="En vente">
              <Switch
                checked={offer.active}
                onCheckedChange={(active) =>
                  updateOffer(activity.id, service.id, { active })
                }
              />
            </SettingsRow>
            <div className="px-5 py-4">
              <OfferControls
                activityId={activity.id}
                offer={offer}
                service={service}
                stay={journeyOf(activity) === "stay"}
              />
            </div>
          </>
        ) : (
          <SettingsRow
            description="Retirée de la vente, ses réglages sont conservés"
            title={`Pas vendue par ${activity.name}`}
          >
            <Button
              onClick={() => addOffers(activity.id, [service.id])}
              variant="secondary"
            >
              Remettre en vente
            </Button>
          </SettingsRow>
        )}
      </SettingsSection>

      {others.length > 0 && (
        <SettingsSection
          description="Elles utilisent cette grille avec leur propre ajustement"
          title="Reprise par vos autres activités"
        >
          {others.map((other) => {
            const o = offerOf(other.id)
            return (
              <div className="space-y-3 px-5 py-4" key={other.id}>
                <div className="flex items-center gap-3">
                  <ActivityDot activity={other} className="size-10 text-sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{other.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {o
                        ? o.included
                          ? "Incluse"
                          : gridSummary(service, o.adjust)
                        : "Non proposée"}
                    </p>
                  </div>
                  <Switch
                    aria-label={`Vendue par ${other.name}`}
                    checked={!!o}
                    onCheckedChange={(on) =>
                      on
                        ? addOffers(other.id, [service.id])
                        : removeOffer(other.id, service.id)
                    }
                  />
                </div>
                {o && (
                  <div className="ps-14">
                    <OfferControls
                      activityId={other.id}
                      offer={o}
                      service={service}
                      stay={journeyOf(other) === "stay"}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </SettingsSection>
      )}

      <SettingsSection>
        <SettingsRow
          description={
            borrowers.length
              ? `Elle sera aussi retirée de ${borrowers.map((a) => a.name).join(", ")}.`
              : "Les réservations passées sont conservées."
          }
          title="Supprimer la prestation"
        >
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="destructive-outline">Supprimer</Button>}
            />
            <AlertDialogPopup>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Supprimer « {service.name} » ?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Elle disparaît de {activity.name}
                  {borrowers.length > 0 &&
                    ` et de ${borrowers.map((a) => a.name).join(", ")}`}
                  . Pour l&apos;arrêter sans la perdre, désactivez-la plutôt.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogClose render={<Button variant="ghost" />}>
                  Annuler
                </AlertDialogClose>
                <Button
                  onClick={() => {
                    router.push(back)
                    deleteService(service.id)
                  }}
                  variant="destructive"
                >
                  Supprimer
                </Button>
              </AlertDialogFooter>
            </AlertDialogPopup>
          </AlertDialog>
        </SettingsRow>
      </SettingsSection>
    </SettingsPage>
  )
}
