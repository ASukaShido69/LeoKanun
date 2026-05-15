"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_SETTINGS } from "@/lib/default-settings";
import { appSettingsSchema, type AppSettingsSchema } from "@/lib/settings-schema";

interface AppSettingsContextValue {
  settings: AppSettingsSchema;
  loading: boolean;
  error: string;
  saveSettings: (next: AppSettingsSchema) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettingsSchema>(DEFAULT_SETTINGS);
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

      setSettings(parsed.data as AppSettingsSchema);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load settings");
      setSettings(DEFAULT_SETTINGS as AppSettingsSchema);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  const value = useMemo(
    () => ({
      settings,
      loading,
      error,
      saveSettings: async (next: AppSettingsSchema) => {
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

        setSettings(parsed.data as AppSettingsSchema);
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

        setSettings(DEFAULT_SETTINGS as AppSettingsSchema);
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