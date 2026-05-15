import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

const createQueueSchema = z.object({
  clientName: z.string().min(1),
  jobType: z.string().min(1),
  pageCount: z.number().int().min(1),
  note: z.string().optional().default("")
});

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

function mapQueueRow(row: QueueRow) {
  return {
    id: row.id,
    queueNo: row.queue_no,
    clientName: row.client_name,
    jobType: row.job_type,
    pageCount: row.page_count,
    note: row.note ?? "",
    status: row.status,
    createdAt: row.created_at
  };
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("queue_jobs")
      .select("id, queue_no, client_name, job_type, page_count, note, status, created_at")
      .order("queue_no", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json((data ?? []).map((row) => mapQueueRow(row as QueueRow)));
  } catch (err) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = createQueueSchema.safeParse(payload);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return Response.json({ error: `${issue.path.join(".") || "root"} ${issue.message}` }, { status: 400 });
    }

    const { data: maxRows, error: maxError } = await supabaseAdmin
      .from("queue_jobs")
      .select("queue_no")
      .order("queue_no", { ascending: false })
      .limit(1);

    if (maxError) {
      return Response.json({ error: maxError.message }, { status: 500 });
    }

    const maxQueueNo = maxRows?.[0]?.queue_no ?? 0;

    const { data, error } = await supabaseAdmin
      .from("queue_jobs")
      .insert({
        queue_no: maxQueueNo + 1,
        client_name: parsed.data.clientName,
        job_type: parsed.data.jobType,
        page_count: parsed.data.pageCount,
        note: parsed.data.note,
        status: "waiting"
      })
      .select("id, queue_no, client_name, job_type, page_count, note, status, created_at")
      .single();

    if (error || !data) {
      return Response.json({ error: error?.message ?? "Failed to create queue item" }, { status: 500 });
    }

    return Response.json({ ok: true, data: mapQueueRow(data as QueueRow) });
  } catch (err) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
