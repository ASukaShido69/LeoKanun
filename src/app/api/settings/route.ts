import { DEFAULT_SETTINGS } from "@/lib/default-settings";
import { appSettingsSchema } from "@/lib/settings-schema";
import { supabaseAdmin } from "@/lib/supabase-admin";

const SETTINGS_KEY = "global";

async function readSettingsFromDb() {
  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .select("settings_json")
    .eq("settings_key", SETTINGS_KEY)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    const { error: insertError } = await supabaseAdmin.from("app_settings").insert({
      settings_key: SETTINGS_KEY,
      settings_json: DEFAULT_SETTINGS
    });

    if (insertError) {
      throw new Error(insertError.message);
    }

    return DEFAULT_SETTINGS;
  }

  const parsed = appSettingsSchema.safeParse(data.settings_json);
  if (!parsed.success) {
    throw new Error("Invalid settings_json in database");
  }

  return parsed.data;
}

export async function GET() {
  try {
    const settings = await readSettingsFromDb();
    return Response.json({ ok: true, data: settings });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const parsed = appSettingsSchema.safeParse(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return Response.json({ error: `${issue.path.join(".") || "root"} ${issue.message}` }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("app_settings").upsert(
    {
      settings_key: SETTINGS_KEY,
      settings_json: parsed.data
    },
    { onConflict: "settings_key" }
  );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, data: parsed.data });
}