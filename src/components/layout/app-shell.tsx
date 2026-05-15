import type { ReactNode } from "react";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col pb-24 lg:flex-row lg:pb-0">
      <Sidebar />
      <main className="w-full min-w-0 flex-1 p-3 sm:p-4 lg:p-6">
        <Topbar />
        {children}
      </main>
      <MobileNav />
    </div>
  );
}