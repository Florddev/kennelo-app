import { HugeiconsIcon } from "@hugeicons/react"
import {
  BookOpenIcon,
  LayersIcon,
  PlusIcon,
  SlidersHorizontalIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs"

function ViewsEmpty({ noun }: { noun: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={LayersIcon} />
        </EmptyMedia>
        <EmptyTitle>Views</EmptyTitle>
        <EmptyDescription>
          Create custom views using filters to show only the {noun} you want to
          see. You can save, share, and favorite these views for easy access and
          faster team collaboration.
        </EmptyDescription>
        <EmptyDescription className="mt-3">
          You can also save any existing view by clicking the{" "}
          <HugeiconsIcon icon={LayersIcon} className="inline size-3.5" /> icon
          or by pressing{" "}
          <KbdGroup>
            <Kbd>Alt</Kbd>
            <Kbd>V</Kbd>
          </KbdGroup>
          .
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button size="sm">Create new view</Button>
          <Button size="sm" variant="outline">
            <HugeiconsIcon icon={BookOpenIcon} />
            Documentation
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  )
}

export default function ViewsPage() {
  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-sm font-medium">Views</h1>
        <Button className="ms-auto rounded-full" size="sm" variant="outline">
          <HugeiconsIcon icon={PlusIcon} />
          New view
        </Button>
      </header>
      <Tabs className="min-h-0 flex-1 gap-0" defaultValue="issues">
        <div className="flex items-center justify-between px-4 py-2">
          <TabsList className="[--radius:9999px]">
            <TabsTab value="issues">Issues</TabsTab>
            <TabsTab value="projects">Projects</TabsTab>
          </TabsList>
          <Button
            aria-label="Display options"
            className="rounded-full"
            size="icon-sm"
            variant="outline"
          >
            <HugeiconsIcon icon={SlidersHorizontalIcon} />
          </Button>
        </div>
        <TabsPanel className="flex flex-1" value="issues">
          <ViewsEmpty noun="issues" />
        </TabsPanel>
        <TabsPanel className="flex flex-1" value="projects">
          <ViewsEmpty noun="projects" />
        </TabsPanel>
      </Tabs>
    </>
  )
}
