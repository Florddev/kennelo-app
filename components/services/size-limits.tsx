"use client"

import { RulerIcon } from "@hugeicons/core-free-icons"
import { Unit } from "@/components/periods/period-forms"
import { setSizeLimits, useCatalog } from "@/components/services/data"
import {
  LinkRow,
  SettingsRow,
  SettingsSection,
} from "@/components/settings/settings-ui"

/** Seul endroit où se règlent les gabarits des chiens. */
export function SizeLimits() {
  const limits = useCatalog().sizeLimits
  return (
    <SettingsSection
      description="Communs à toutes vos activités : taille des box en pension, prix selon la taille au toilettage"
      title="Gabarits des chiens"
    >
      <SettingsRow title="Petit chien jusqu'à">
        <Unit
          label="Petit chien jusqu'à"
          onChange={(small) => setSizeLimits({ ...limits, small })}
          unit="kg"
          value={limits.small}
        />
      </SettingsRow>
      <SettingsRow
        description="Au-delà : grand chien"
        title="Moyen chien jusqu'à"
      >
        <Unit
          label="Moyen chien jusqu'à"
          onChange={(medium) => setSizeLimits({ ...limits, medium })}
          unit="kg"
          value={limits.medium}
        />
      </SettingsRow>
    </SettingsSection>
  )
}

/** Rappel des gabarits là où ils servent, avec un lien vers leur réglage. */
export function SizeLimitsLink() {
  const { small, medium } = useCatalog().sizeLimits
  return (
    <SettingsSection>
      <LinkRow
        description={`Petit jusqu'à ${small} kg, moyen jusqu'à ${medium} kg · communs à vos activités`}
        href="/settings/activities"
        icon={RulerIcon}
        title="Gabarits des chiens"
      />
    </SettingsSection>
  )
}
