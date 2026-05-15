import { DEFAULT_SETTINGS } from "@/lib/default-settings";
import { appSettingsSchema, type AppSettingsSchema } from "@/lib/settings-schema";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeWithDefaults(defaultValue: unknown, sourceValue: unknown): unknown {
  if (Array.isArray(defaultValue)) {
    if (!Array.isArray(sourceValue)) {
      return defaultValue;
    }

    // Keep only non-empty strings for string array presets.
    return sourceValue.filter((item) => typeof item === "string" && item.trim().length > 0);
  }

  if (isRecord(defaultValue)) {
    const source = isRecord(sourceValue) ? sourceValue : {};
    const merged: Record<string, unknown> = {};

    for (const key of Object.keys(defaultValue)) {
      merged[key] = mergeWithDefaults(defaultValue[key], source[key]);
    }

    return merged;
  }

  if (sourceValue === undefined || sourceValue === null) {
    return defaultValue;
  }

  return sourceValue;
}

export function normalizeAppSettings(input: unknown): AppSettingsSchema {
  const merged = mergeWithDefaults(DEFAULT_SETTINGS, input);
  const parsed = appSettingsSchema.safeParse(merged);

  if (parsed.success) {
    return parsed.data;
  }

  // Last fallback to fully safe defaults.
  const fallback = appSettingsSchema.safeParse(DEFAULT_SETTINGS);
  if (!fallback.success) {
    throw new Error("Failed to parse default settings");
  }

  return fallback.data;
}
