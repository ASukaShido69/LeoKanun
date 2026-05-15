"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DollarSign, LayoutDashboard, Settings, ListOrdered } from "lucide-react";
import { useAppSettings } from "@/components/providers/settings-provider";

export function MobileNav() {
  const pathname = usePathname();
  const { settings } = useAppSettings();

  const items = [
    { href: "/dashboard", label: settings.sidebar.dashboard, icon: LayoutDashboard },
    { href: "/queue", label: settings.sidebar.queue, icon: ListOrdered },
    { href: "/finance", label: settings.sidebar.finance, icon: DollarSign },
    { href: "/settings", label: settings.sidebar.settings, icon: Settings }
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 flex w-[95vw] max-w-xl -translate-x-1/2 items-center justify-between rounded-2xl border border-borderSoft bg-surface/90 px-3 py-2 shadow-card backdrop-blur-xl md:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href as any}
            className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] font-semibold ${
              active ? "bg-surface2 text-textPrimary" : "text-textSecondary"
            }`}
          >
            <Icon size={16} />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}