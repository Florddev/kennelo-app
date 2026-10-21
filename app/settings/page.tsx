import { Button } from "@/components/ui/button";
import { Frame, FramePanel } from "@/components/ui/frame";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";

type Option = { label: string; value: string };

type Setting = { title: string; description: string } & (
  | { type: "select"; items: Option[]; defaultValue: string }
  | { type: "switch"; defaultChecked?: boolean }
  | { type: "button"; label: string }
);

const sections: { title: string; settings: Setting[] }[] = [
  {
    settings: [
      {
        defaultValue: "agent",
        description: "Select which view to display when launching Kennelo",
        items: [
          { label: "Agent (default)", value: "agent" },
          { label: "Inbox", value: "inbox" },
          { label: "My issues", value: "my-issues" },
          { label: "Views", value: "views" },
        ],
        title: "Default home view",
        type: "select",
      },
      {
        defaultValue: "full",
        description: "Select how names are displayed in the interface",
        items: [
          { label: "Full name", value: "full" },
          { label: "Username", value: "username" },
        ],
        title: "Display names",
        type: "select",
      },
      {
        defaultValue: "monday",
        description: "Used for date pickers",
        items: [
          { label: "Monday", value: "monday" },
          { label: "Sunday", value: "sunday" },
          { label: "Saturday", value: "saturday" },
        ],
        title: "First day of the week",
        type: "select",
      },
      {
        defaultChecked: true,
        description: "Strings like :) will be converted to 🙂",
        title: "Convert text emoticons into emojis",
        type: "switch",
      },
      {
        defaultValue: "enter",
        description: "Choose which key press is used to submit comments",
        items: [
          { label: "Enter", value: "enter" },
          { label: "Ctrl + Enter", value: "ctrl-enter" },
        ],
        title: "Send comments on...",
        type: "select",
      },
    ],
    title: "General",
  },
  {
    settings: [
      {
        description:
          "Customize sidebar item visibility, ordering, and badge style",
        label: "Customize",
        title: "App sidebar",
        type: "button",
      },
      {
        defaultValue: "default",
        description: "Adjust the size of text across the app",
        items: [
          { label: "Small", value: "small" },
          { label: "Default", value: "default" },
          { label: "Large", value: "large" },
        ],
        title: "Font size",
        type: "select",
      },
      {
        description:
          "Change the cursor to a pointer when hovering over any interactive elements",
        title: "Use pointer cursors",
        type: "switch",
      },
      {
        description: "Always underline links in text content",
        title: "Underline links",
        type: "switch",
      },
      {
        description:
          "When enabled, GIFs and animated emojis will be static by default and animate only on hover.",
        title: "Disable animated images & emoji",
        type: "switch",
      },
    ],
    title: "Interface and theme",
  },
];

function SettingControl({ setting }: { setting: Setting }) {
  switch (setting.type) {
    case "select":
      return (
        <Select defaultValue={setting.defaultValue} items={setting.items}>
          <SelectTrigger
            aria-label={setting.title}
            className="w-fit min-w-0"
            size="sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectPopup>
            {setting.items.map(({ label, value }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      );
    case "switch":
      return (
        <Switch
          aria-label={setting.title}
          defaultChecked={setting.defaultChecked}
        />
      );
    case "button":
      return (
        <Button size="sm" variant="ghost">
          {setting.label}
        </Button>
      );
  }
}

export default function PreferencesPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <SidebarTrigger className="m-2 md:hidden" />
      <div className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-8 md:py-16">
        <h1 className="font-semibold text-2xl">Preferences</h1>
        {sections.map((section) => (
          <section className="flex flex-col gap-3" key={section.title}>
            <h2 className="px-1 font-medium text-base">{section.title}</h2>
            <Frame>
              <FramePanel className="divide-y p-0">
                {section.settings.map((setting) => (
                  <div
                    className="flex items-center justify-between gap-4 px-4 py-3"
                    key={setting.title}
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{setting.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {setting.description}
                      </p>
                    </div>
                    <SettingControl setting={setting} />
                  </div>
                ))}
              </FramePanel>
            </Frame>
          </section>
        ))}
      </div>
    </div>
  );
}
