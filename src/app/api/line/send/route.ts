import { buildFlexMessage } from "@/lib/line";
import { sendFlexMessageToLine } from "@/lib/line-sender";
import { getServerAppSettings } from "@/lib/server-settings";
import { z } from "zod";

const sendLineSchema = z.object({
  type: z.enum(["morning", "event", "weekly"]),
  data: z.record(z.unknown()).default({})
});

export async function POST(req: Request) {
  const raw = await req.json();
  const parsed = sendLineSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  let settings;
  try {
    settings = await getServerAppSettings();
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Settings load failed" }, { status: 500 });
  }

  const { type, data } = parsed.data;
  const flexMessage = buildFlexMessage(type, data, {
    appName: settings.app.name,
    morningTitle: settings.line.morningTitle,
    eventCreatedTitle: settings.line.eventCreatedTitle,
    weeklyTitle: settings.line.weeklyTitle
  });

  try {
    await sendFlexMessageToLine(flexMessage as Record<string, unknown>);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "LINE send failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}