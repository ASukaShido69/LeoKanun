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
      <section className="card space-y-4 p-4">
        {loading ? <p className="text-sm text-textSecondary">กำลังโหลดการตั้งค่า...</p> : null}
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <p className="text-sm text-textSecondary">{settings.settingsPage.description}</p>
        <label className="block text-sm font-medium">
          {settings.settingsPage.textareaLabel}
          <textarea
            className="mt-2 h-96 w-full rounded-xl border border-borderSoft p-3 font-mono text-sm"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-primary font-semibold" onClick={onSave}>
            {settings.settingsPage.saveButton}
          </button>
          <button
            type="button"
            className="rounded-button border border-borderSoft bg-white px-4 py-2 font-semibold"
            onClick={onReset}
          >
            {settings.settingsPage.resetButton}
          </button>
        </div>
        {message ? <p className="text-sm text-textSecondary">{message}</p> : null}
      </section>
    </AppShell>
  );
}