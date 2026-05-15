import type { ReactNode } from "react";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen pb-20 md:pb-0">
      <Sidebar />
      <main className="w-full p-4 md:p-6">
        <Topbar />
        {children}
      </main>
      <MobileNav />
    </div>
  );
}