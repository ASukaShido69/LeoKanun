import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
  priority: z.string().optional().default("medium"),
  due_date: z.string().nullable().optional(),
  status: z.string().optional().default("todo")
});

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data || []);
  } catch (err) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = createTaskSchema.safeParse(payload);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return Response.json(
        { error: `${issue.path.join(".") || "root"} ${issue.message}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .insert({
        title: parsed.data.title,
        description: parsed.data.description,
        priority: parsed.data.priority,
        due_date: parsed.data.due_date,
        status: parsed.data.status
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true, data });
  } catch (err) {
    console.error("Error creating task:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
