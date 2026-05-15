"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_SETTINGS } from "@/lib/default-settings";
import { appSettingsSchema } from "@/lib/settings-schema";
import type { AppSettings } from "@/types/settings";

interface AppSettingsContextValue {
  settings: AppSettings;
  loading: boolean;
  error: string;
  saveSettings: (next: AppSettings) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchSettings() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/settings", {
        method: "GET",
        cache: "no-store"
      });

      const payload = (await response.json()) as { error?: string; data?: unknown };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "Failed to load settings");
      }

      const parsed = appSettingsSchema.safeParse(payload.data);
      if (!parsed.success) {
        throw new Error("Invalid settings shape from API");
      }

      setSettings(parsed.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load settings");
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      settings,
      loading,
      error,
      saveSettings: async (next: AppSettings) => {
        const parsed = appSettingsSchema.safeParse(next);
        if (!parsed.success) {
          throw new Error("Invalid settings payload");
        }

        const response = await fetch("/api/settings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(parsed.data)
        });

        const payload = (await response.json()) as { error?: string; data?: unknown };
        if (!response.ok || !payload.data) {
          throw new Error(payload.error ?? "Failed to save settings");
        }

        setSettings(parsed.data);
      },
      resetSettings: async () => {
        const response = await fetch("/api/settings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(DEFAULT_SETTINGS)
        });

        const payload = (await response.json()) as { error?: string; data?: unknown };
        if (!response.ok || !payload.data) {
          throw new Error(payload.error ?? "Failed to reset settings");
        }

        setSettings(DEFAULT_SETTINGS);
      }
    }),
    [settings, loading, error]
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used inside AppSettingsProvider");
  }

  return context;
}