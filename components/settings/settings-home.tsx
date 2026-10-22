import { ArrowRight01Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { ActivityMark } from "@/components/activity-mark"
import { activitySettings } from "@/components/settings/data"
import { settingsNav } from "@/components/settings/nav"
import {
  IconTile,
  LinkRow,
  SettingsPage,
  SettingsSection,
} from "@/components/settings/settings-ui"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const hoursOf = ({ hours }: (typeof activitySettings)[number]) =>
  `${hours.label} · ${hours.from.replace(":00", "h")} – ${hours.to.replace(":00", "h")}`

/** L'accueil des paramètres : le profil en haut, puis tout, rangé par thème. */
export function SettingsHome() {
  const [account, ...others] = settingsNav
  return (
    <SettingsPage title="Paramètres">
      <Link
        className="flex items-center gap-4 rounded-2xl border bg-card p-5 transition-colors hover:bg-accent"
        href="/settings/profile"
      >
        <Avatar className="size-16">
          <AvatarFallback className="bg-pension text-xl font-semibold text-pension-foreground">
            AM
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-semibold">Alex Martin</p>
          <p className="truncate text-muted-foreground">
            Direction · Les Coteaux
          </p>
        </div>
        <HugeiconsIcon
          className="size-5 shrink-0 text-muted-foreground"
          icon={ArrowRight01Icon}
        />
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-primary p-6 text-primary-foreground">
        <div className="space-y-1">
          <p className="text-xl font-semibold">
            Vous êtes sur l&apos;offre gratuite
          </p>
          <p className="opacity-80">
            Passez à Pro : activités illimitées et 1 000 SMS par mois.
          </p>
        </div>
        <Button
          className="bg-wise-forest text-wise-green hover:bg-wise-forest/90"
          render={<Link href="/settings/billing" />}
        >
          Voir les offres
        </Button>
      </div>

      <SettingsSection title={account.label}>
        {account.items
          .filter((item) => item.href !== "/settings/profile")
          .map((item) => (
            <LinkRow key={item.href} {...item} />
          ))}
      </SettingsSection>

      <SettingsSection title="Vos activités">
        {activitySettings.map((activity) => (
          <LinkRow
            description={hoursOf(activity)}
            href={`/settings/activities/${activity.slug}`}
            key={activity.slug}
            media={
              <ActivityMark
                activity={activity.name}
                className="size-10 text-sm"
              />
            }
            title={activity.name}
          />
        ))}
        <LinkRow
          description="Pension, garderie, éducation, promenade…"
          href="/settings/activities/new"
          media={
            <IconTile
              className="bg-primary text-primary-foreground"
              icon={PlusSignIcon}
            />
          }
          title="Créer une activité"
        />
      </SettingsSection>

      {others.map((section) => (
        <SettingsSection key={section.label} title={section.label}>
          {section.items.map((item) => (
            <LinkRow key={item.href} {...item} />
          ))}
        </SettingsSection>
      ))}
    </SettingsPage>
  )
}
