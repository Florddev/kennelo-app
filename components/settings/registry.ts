import type { ComponentType } from "react"
import {
  AccountSecurityPage,
  ConnectedAccountsPage,
  NotificationsPage,
  PreferencesPage,
  ProfilePage,
} from "@/components/settings/account-pages"
import {
  ApiPage,
  BillingPage,
  BookingPage,
  CommunicationPage,
  ImportExportPage,
  IntegrationsPage,
  MembersPage,
  OrganizationPage,
  OrganizationSecurityPage,
  PaymentsPage,
} from "@/components/settings/organization-pages"
import { PeriodsPage } from "@/components/periods/periods-pages"
import { ServicesCatalogPage } from "@/components/services/catalog-page"

export const settingsPages: Record<string, ComponentType> = {
  "account-security": AccountSecurityPage,
  api: ApiPage,
  billing: BillingPage,
  booking: BookingPage,
  communication: CommunicationPage,
  "connected-accounts": ConnectedAccountsPage,
  "import-export": ImportExportPage,
  integrations: IntegrationsPage,
  members: MembersPage,
  notifications: NotificationsPage,
  organization: OrganizationPage,
  payments: PaymentsPage,
  periods: PeriodsPage,
  preferences: PreferencesPage,
  profile: ProfilePage,
  security: OrganizationSecurityPage,
  services: ServicesCatalogPage,
}
