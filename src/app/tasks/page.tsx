"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useAppSettings } from "@/components/providers/settings-provider";

export default function TasksPage() {
  const { settings } = useAppSettings();

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-bold">{settings.app.name} {settings.tasks.title}</h1>
      <section className="card p-4">
        <p className="text-sm text-textSecondary">{settings.tasks.hint}</p>
      </section>
    </AppShell>
  );
}