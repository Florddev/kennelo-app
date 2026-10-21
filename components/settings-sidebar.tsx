"use client"

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  AtSignIcon,
  BellIcon,
  ChevronLeftIcon,
  CodeIcon,
  FileTextIcon,
  FlameIcon,
  HandIcon,
  InfinityIcon,
  LayoutTemplateIcon,
  LinkIcon,
  MessageSquareIcon,
  OctagonIcon,
  PackageIcon,
  RocketIcon,
  SearchIcon,
  SendIcon,
  ShieldIcon,
  SlidersHorizontalIcon,
  SmileIcon,
  SparklesIcon,
  TagIcon,
  TrendingUpIcon,
  UserIcon,
  ZapIcon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type NavItem = { title: string; icon: IconSvgElement; href?: string }

const sections: { label: string; items: NavItem[] }[] = [
  {
    items: [
      { href: "/settings", icon: SlidersHorizontalIcon, title: "Preferences" },
      { icon: UserIcon, title: "Profile" },
      { icon: BellIcon, title: "Notifications" },
      { icon: CodeIcon, title: "Code & reviews" },
      { icon: ShieldIcon, title: "Security & access" },
      { icon: LinkIcon, title: "Connected accounts" },
      { icon: SendIcon, title: "Agent personalization" },
    ],
    label: "Personal",
  },
  {
    items: [
      { icon: TagIcon, title: "Labels" },
      { icon: LayoutTemplateIcon, title: "Templates" },
      { icon: FlameIcon, title: "SLAs" },
    ],
    label: "Issues",
  },
  {
    items: [
      { icon: TagIcon, title: "Labels" },
      { icon: LayoutTemplateIcon, title: "Templates" },
      { icon: OctagonIcon, title: "Statuses" },
      { icon: TrendingUpIcon, title: "Updates" },
    ],
    label: "Projects",
  },
  {
    items: [
      { icon: SparklesIcon, title: "AI & agents" },
      { icon: InfinityIcon, title: "Loops" },
      { icon: RocketIcon, title: "Initiatives" },
      { icon: FileTextIcon, title: "Documents" },
      { icon: MessageSquareIcon, title: "Customer requests" },
      { icon: PackageIcon, title: "Releases" },
      { icon: ZapIcon, title: "Pulse" },
      { icon: HandIcon, title: "Asks" },
      { icon: SmileIcon, title: "Emojis" },
      { icon: AtSignIcon, title: "Integrations" },
    ],
    label: "Features",
  },
]

export function SettingsSidebar() {
  const pathname = usePathname()
  return (
    <>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/" />}>
              <HugeiconsIcon icon={ChevronLeftIcon} />
              <span>Back to app</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <InputGroup>
          <InputGroupAddon>
            <HugeiconsIcon icon={SearchIcon} />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search settings"
            placeholder="Search..."
          />
        </InputGroup>
      </SidebarHeader>

      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarMenu>
              {section.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={item.href === pathname}
                    render={<Link href={item.href ?? "#"} />}
                  >
                    <HugeiconsIcon icon={item.icon} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </>
  )
}
