import type * as React from "react";
import { AppShell } from "@/components/app-shell";
import { AppSidebar } from "@/components/app-sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell sidebar={<AppSidebar />}>{children}</AppShell>;
}
