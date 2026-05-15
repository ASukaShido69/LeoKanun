"use client";

import Link from "next/link";
import { CalendarDays, DollarSign, LayoutDashboard, Settings, Users, CheckSquare } from "lucide-react";
import { useAppSettings } from "@/components/providers/settings-provider";

export function Sidebar() {
  const { settings } = useAppSettings();

  const items = [
    { href: "/dashboard", label: settings.sidebar.dashboard, icon: LayoutDashboard },
    { href: "/schedule", label: settings.sidebar.schedule, icon: CalendarDays },
    { href: "/tasks", label: settings.sidebar.tasks, icon: CheckSquare },
    { href: "/finance", label: settings.sidebar.finance, icon: DollarSign },
    { href: "/clients", label: settings.sidebar.clients, icon: Users },
    { href: "/settings", label: settings.sidebar.settings, icon: Settings }
  ];

  return (
    <aside className="hidden h-screen w-60 shrink-0 border-r border-borderSoft/80 bg-surface2/95 p-4 md:block">
      <div className="mb-6 rounded-2xl border border-white/60 bg-white/65 p-4 shadow-card backdrop-blur-md">
        <h1 className="text-2xl font-bold">{settings.app.name}</h1>
        <p className="mt-1 text-xs text-textSecondary">Personal Dashboard</p>
      </div>
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-textPrimary hover:bg-white/90"
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}