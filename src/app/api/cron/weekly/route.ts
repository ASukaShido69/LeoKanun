import { buildFlexMessage } from "@/lib/line";
import { sendFlexMessageToLine } from "@/lib/line-sender";
import { getServerAppSettings } from "@/lib/server-settings";

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return unauthorized();
  }

  let settings;
  try {
    settings = await getServerAppSettings();
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Settings load failed" }, { status: 500 });
  }

  const flexMessage = buildFlexMessage(
    "weekly",
    { summary: "สรุปงานและแผนสัปดาห์นี้" },
    {
      appName: settings.app.name,
      morningTitle: settings.line.morningTitle,
      eventCreatedTitle: settings.line.eventCreatedTitle,
      weeklyTitle: settings.line.weeklyTitle
    }
  );

  try {
    await sendFlexMessageToLine(flexMessage as Record<string, unknown>);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "LINE send failed" }, { status: 500 });
  }

  return Response.json({
    ok: true,
    message: "Weekly summary sent"
  });
}