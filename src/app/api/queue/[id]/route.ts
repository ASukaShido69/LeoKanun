import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

const updateQueueSchema = z
  .object({
    queueNo: z.number().int().min(1).optional(),
    clientName: z.string().min(1).optional(),
    jobType: z.string().min(1).optional(),
    pageCount: z.number().int().min(1).optional(),
    note: z.string().optional(),
    status: z.enum(["waiting", "printing", "done"]).optional()
  })
  .refine((value) => Object.keys(value).length > 0, { message: "At least one field is required" });

const replaceQueueSchema = z.object({
  clientName: z.string().min(1),
  jobType: z.string().min(1),
  pageCount: z.number().int().min(1),
  note: z.string().optional().default(""),
  status: z.enum(["waiting", "printing", "done"]).optional()
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await request.json();
    const parsed = updateQueueSchema.safeParse(payload);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return Response.json({ error: `${issue.path.join(".") || "root"} ${issue.message}` }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (parsed.data.queueNo !== undefined) updates.queue_no = parsed.data.queueNo;
    if (parsed.data.clientName !== undefined) updates.client_name = parsed.data.clientName;
    if (parsed.data.jobType !== undefined) updates.job_type = parsed.data.jobType;
    if (parsed.data.pageCount !== undefined) updates.page_count = parsed.data.pageCount;
    if (parsed.data.note !== undefined) updates.note = parsed.data.note;
    if (parsed.data.status !== undefined) updates.status = parsed.data.status;

    const { data, error } = await supabaseAdmin
      .from("queue_jobs")
      .update(updates)
      .eq("id", id)
      .select("id, queue_no, client_name, job_type, page_count, note, status, created_at")
      .single();

    if (error || !data) {
      return Response.json({ error: error?.message ?? "Failed to update queue item" }, { status: 500 });
    }

    return Response.json({ ok: true, data: mapQueueRow(data as QueueRow) });
  } catch (err) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await request.json();
    const parsed = replaceQueueSchema.safeParse(payload);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return Response.json({ error: `${issue.path.join(".") || "root"} ${issue.message}` }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      client_name: parsed.data.clientName,
      job_type: parsed.data.jobType,
      page_count: parsed.data.pageCount,
      note: parsed.data.note,
      updated_at: new Date().toISOString()
    };

    if (parsed.data.status) {
      updates.status = parsed.data.status;
    }

    const { data, error } = await supabaseAdmin
      .from("queue_jobs")
      .update(updates)
      .eq("id", id)
      .select("id, queue_no, client_name, job_type, page_count, note, status, created_at")
      .single();

    if (error || !data) {
      return Response.json({ error: error?.message ?? "Failed to update queue item" }, { status: 500 });
    }

    return Response.json({ ok: true, data: mapQueueRow(data as QueueRow) });
  } catch (err) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin.from("queue_jobs").delete().eq("id", id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
