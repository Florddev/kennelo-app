"use client"

import { Store01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { serviceHref, serviceMeta } from "@/components/services/activity-offers"
import {
  addOffers,
  gridSummary,
  removeOffer,
  sellersOf,
  useCatalog,
} from "@/components/services/data"
import { ActivityTag } from "@/components/services/service-form"
import {
  SettingsPage,
  SettingsSection,
} from "@/components/settings/settings-ui"
import { Button } from "@/components/ui/button"
import {
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuPopup,
  MenuTrigger,
} from "@/components/ui/menu"

/** Vue d'ensemble : chaque prestation sous l'activité qui l'a créée. */
export function ServicesCatalogPage() {
  const catalog = useCatalog()
  const nameOf = (id: string) =>
    catalog.services.find((s) => s.id === id)?.name ?? id

  return (
    <SettingsPage
      back={{ href: "/settings/activities", label: "Activités" }}
      description="Chaque prestation est créée par une activité. Les autres peuvent la reprendre avec leur propre prix."
      title="Toutes les prestations"
    >
      {catalog.activities.map((activity) => {
        const own = catalog.services.filter((s) => s.owner === activity.id)
        if (!own.length) return null
        return (
          <SettingsSection
            description={`${own.length} prestations créées par ${activity.name}`}
            key={activity.id}
            title={activity.name}
          >
            {own.map((service) => {
              const borrowers = sellersOf(catalog, service.id).filter(
                (a) => a.id !== activity.id
              )
              return (
                <div
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5"
                  key={service.id}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {serviceMeta(service)} · {gridSummary(service)}
                    </p>
                    {service.bundle && (
                      <p className="text-xs text-muted-foreground">
                        Contient {service.bundle.map(nameOf).join(" + ")}
                      </p>
                    )}
                    {borrowers.length > 0 && (
                      <p className="mt-1.5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                        Reprise par
                        {borrowers.map((a) => (
                          <ActivityTag activity={a} key={a.id} />
                        ))}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Menu>
                      <MenuTrigger
                        render={
                          <Button size="xs" variant="ghost">
                            <HugeiconsIcon icon={Store01Icon} />
                            Reprendre
                          </Button>
                        }
                      />
                      <MenuPopup align="end">
                        <MenuGroup>
                          <MenuGroupLabel>Vendue aussi par</MenuGroupLabel>
                          {catalog.activities
                            .filter((a) => a.id !== activity.id)
                            .map((a) => (
                              <MenuCheckboxItem
                                checked={borrowers.some((b) => b.id === a.id)}
                                key={a.id}
                                onCheckedChange={(on) =>
                                  on
                                    ? addOffers(a.id, [service.id])
                                    : removeOffer(a.id, service.id)
                                }
                                variant="switch"
                              >
                                {a.name}
                              </MenuCheckboxItem>
                            ))}
                        </MenuGroup>
                      </MenuPopup>
                    </Menu>
                    <Button
                      render={<Link href={serviceHref(service)} />}
                      size="xs"
                      variant="ghost"
                    >
                      Gérer
                    </Button>
                  </div>
                </div>
              )
            })}
          </SettingsSection>
        )
      })}
    </SettingsPage>
  )
}
