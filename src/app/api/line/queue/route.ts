import { buildFlexMessage } from "@/lib/line";
import { sendFlexMessageToLine } from "@/lib/line-sender";
import { getServerAppSettings } from "@/lib/server-settings";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface QueueRow {
  id: string;
  queue_no: number;
  client_name: string;
  job_type: string;
  page_count: number;
  note: string | null;
  status: "waiting" | "printing" | "done";
  created_at: string;
}

function statusLabel(status: QueueRow["status"]) {
  if (status === "waiting") return "รอคิว";
  if (status === "printing") return "กำลังทำ";
  return "เสร็จแล้ว";
}

export async function POST() {
  try {
    const settings = await getServerAppSettings();

    const { data, error } = await supabaseAdmin
      .from("queue_jobs")
      .select("id, queue_no, client_name, job_type, page_count, note, status, created_at")
      .order("queue_no", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return Response.json({ error: "No queue item found" }, { status: 404 });
    }

    const queue = data as QueueRow;
    const title = `คิว #${queue.queue_no} | ${queue.client_name}`;
    const detail = `${queue.job_type} • ${queue.page_count} หน้า • ${statusLabel(queue.status)}`;

    const flexMessage = buildFlexMessage(
      "event",
      { title: `${title}\n${detail}` },
      {
        appName: settings.app.name,
        morningTitle: settings.line.morningTitle,
        eventCreatedTitle: "คิวงานร้านอัปเดต 📌",
        weeklyTitle: settings.line.weeklyTitle
      }
    );

    await sendFlexMessageToLine(flexMessage as Record<string, unknown>);

    return Response.json({ ok: true, data: queue });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to send queue message" },
      { status: 500 }
    );
  }
}
