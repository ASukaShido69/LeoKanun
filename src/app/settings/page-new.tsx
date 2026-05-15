"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { DEFAULT_SETTINGS } from "@/lib/default-settings";
import { appSettingsSchema } from "@/lib/settings-schema";
import type { AppSettings } from "@/types/settings";
import { useAppSettings } from "@/components/providers/settings-provider";

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <input
        className="mt-1 w-full rounded-xl border border-borderSoft p-2"
        type="text"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
    </label>
  );
}

export default function SettingsPage() {
  const { settings, loading, error, saveSettings, resetSettings } = useAppSettings();
  const [draft, setDraft] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"basic" | "layout" | "json">("basic");

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  async function onSave() {
    try {
      const parsed = appSettingsSchema.safeParse(draft);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        setMessage(`${settings.settingsPage.invalidJsonMessage}: ${issue.path.join(".") || "root"} ${issue.message}`);
        return;
      }

      await saveSettings(parsed.data as AppSettings);
      setMessage(settings.settingsPage.successMessage);
    } catch {
      setMessage(settings.settingsPage.invalidJsonMessage);
    }
  }

  async function onReset() {
    try {
      await resetSettings();
      setDraft(DEFAULT_SETTINGS);
      setMessage("");
    } catch {
      setMessage("รีเซ็ตไม่สำเร็จ");
    }
  }

  const exportConfig = () => {
    const dataStr = JSON.stringify(draft, null, 2);
    const element = document.createElement("a");
    element.setAttribute("href", `data:text/json;charset=utf-8,${encodeURIComponent(dataStr)}`);
    element.setAttribute("download", `leokanun-settings-${new Date().toISOString().split("T")[0]}.json`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-bold">{settings.app.name} {settings.settingsPage.title}</h1>
      {loading ? <p className="text-sm text-textSecondary">กำลังโหลดการตั้งค่า...</p> : null}
      {error ? <p className="text-sm text-red-500">เกิดข้อผิดพลาด: {error}</p> : null}

      <div className="mb-4 flex gap-2 border-b border-borderSoft">
        {["basic", "layout", "json"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as "basic" | "layout" | "json")}
            className={`px-4 py-2 font-semibold transition ${tab === t ? "border-b-2 border-primary text-primary" : "text-textSecondary hover:text-textPrimary"}`}
          >
            {t === "basic" ? "📱 App" : t === "layout" ? "🎨 UI" : "💾 JSON"}
          </button>
        ))}
      </div>

      {tab === "basic" && (
        <section className="space-y-4">
          <article className="card space-y-3 p-4">
            <h2 className="font-semibold">App Settings</h2>
            <TextField label="App Name" value={draft.app.name} onChange={(v) => setDraft({ ...draft, app: { ...draft.app, name: v } })} />
            <TextField label="Description" value={draft.app.description} onChange={(v) => setDraft({ ...draft, app: { ...draft.app, description: v } })} />
            <TextField label="Language" value={draft.app.language} onChange={(v) => setDraft({ ...draft, app: { ...draft.app, language: v } })} />
          </article>
          <article className="card space-y-3 p-4">
            <h2 className="font-semibold">Topbar</h2>
            <TextField label="Greeting" value={draft.topbar.greeting} onChange={(v) => setDraft({ ...draft, topbar: { ...draft.topbar, greeting: v } })} />
            <TextField label="Time Prefix" value={draft.topbar.timePrefix} onChange={(v) => setDraft({ ...draft, topbar: { ...draft.topbar, timePrefix: v } })} />
            <TextField label="Time Suffix" value={draft.topbar.timeSuffix} onChange={(v) => setDraft({ ...draft, topbar: { ...draft.topbar, timeSuffix: v } })} />
          </article>
          <article className="card space-y-3 p-4">
            <h2 className="font-semibold">LINE Messaging</h2>
            <TextField label="Morning Title" value={draft.line.morningTitle} onChange={(v) => setDraft({ ...draft, line: { ...draft.line, morningTitle: v } })} />
            <TextField label="Event Created Title" value={draft.line.eventCreatedTitle} onChange={(v) => setDraft({ ...draft, line: { ...draft.line, eventCreatedTitle: v } })} />
            <TextField label="Weekly Title" value={draft.line.weeklyTitle} onChange={(v) => setDraft({ ...draft, line: { ...draft.line, weeklyTitle: v } })} />
          </article>
        </section>
      )}

      {tab === "layout" && (
        <section className="space-y-4">
          <article className="card space-y-3 p-4">
            <h2 className="font-semibold">Sidebar Navigation</h2>
            <TextField label="Dashboard" value={draft.sidebar.dashboard} onChange={(v) => setDraft({ ...draft, sidebar: { ...draft.sidebar, dashboard: v } })} />
            <TextField label="Schedule" value={draft.sidebar.schedule} onChange={(v) => setDraft({ ...draft, sidebar: { ...draft.sidebar, schedule: v } })} />
            <TextField label="Tasks" value={draft.sidebar.tasks} onChange={(v) => setDraft({ ...draft, sidebar: { ...draft.sidebar, tasks: v } })} />
            <TextField label="Finance" value={draft.sidebar.finance} onChange={(v) => setDraft({ ...draft, sidebar: { ...draft.sidebar, finance: v } })} />
            <TextField label="Clients" value={draft.sidebar.clients} onChange={(v) => setDraft({ ...draft, sidebar: { ...draft.sidebar, clients: v } })} />
            <TextField label="Settings" value={draft.sidebar.settings} onChange={(v) => setDraft({ ...draft, sidebar: { ...draft.sidebar, settings: v } })} />
          </article>
          <article className="card space-y-3 p-4">
            <h2 className="font-semibold">Dashboard Cards</h2>
            <TextField label="Today Queue" value={draft.dashboard.cards.todayQueueTitle} onChange={(v) => setDraft({ ...draft, dashboard: { ...draft.dashboard, cards: { ...draft.dashboard.cards, todayQueueTitle: v } } })} />
            <TextField label="Pending Tasks" value={draft.dashboard.cards.pendingTaskTitle} onChange={(v) => setDraft({ ...draft, dashboard: { ...draft.dashboard, cards: { ...draft.dashboard.cards, pendingTaskTitle: v } } })} />
            <TextField label="Monthly Income" value={draft.dashboard.cards.monthlyIncomeTitle} onChange={(v) => setDraft({ ...draft, dashboard: { ...draft.dashboard, cards: { ...draft.dashboard.cards, monthlyIncomeTitle: v } } })} />
            <TextField label="Near Deadline" value={draft.dashboard.cards.nearDeadlineTitle} onChange={(v) => setDraft({ ...draft, dashboard: { ...draft.dashboard, cards: { ...draft.dashboard.cards, nearDeadlineTitle: v } } })} />
          </article>
        </section>
      )}

      {tab === "json" && (
        <section className="card space-y-4 p-4">
          <h2 className="font-semibold">Full JSON Settings</h2>
          <textarea
            className="h-96 w-full rounded-xl border border-borderSoft p-3 font-mono text-sm"
            value={JSON.stringify(draft, null, 2)}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
              try {
                setDraft(JSON.parse(e.target.value));
              } catch {}
            }}
          />
        </section>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn-primary font-semibold" onClick={onSave}>
          {settings.settingsPage.saveButton}
        </button>
        <button type="button" className="rounded-button border border-borderSoft bg-white px-4 py-2 font-semibold" onClick={onReset}>
          {settings.settingsPage.resetButton}
        </button>
        <button type="button" className="rounded-button border border-primary/30 bg-primary/10 px-4 py-2 font-semibold text-primary" onClick={exportConfig}>
          ⬇️ Export Settings
        </button>
      </div>

      {message && (
        <div className={`mt-4 rounded-xl p-3 ${message.includes("สำเร็จ") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          <p className="text-sm">{message}</p>
        </div>
      )}
    </AppShell>
  );
}
