import { appSettingsSchema } from "@/lib/settings-schema";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { DEFAULT_SETTINGS } from "@/lib/default-settings";
import type { ZodIssue } from "zod";

const SETTINGS_KEY = "global";

export async function getServerAppSettings() {
  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .select("settings_json")
    .eq("settings_key", SETTINGS_KEY)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("app_settings")
      .insert({
        settings_key: SETTINGS_KEY,
        settings_json: DEFAULT_SETTINGS
      })
      .select("settings_json")
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    const insertedParsed = appSettingsSchema.safeParse(inserted.settings_json);
    if (!insertedParsed.success) {
      throw new Error("Failed to parse default settings");
    }

    return insertedParsed.data;
  }

  const parsed = appSettingsSchema.safeParse(data.settings_json);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue: ZodIssue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`settings_json validation failed: ${message}`);
  }

  return parsed.data;
}