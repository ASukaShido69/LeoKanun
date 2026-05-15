import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

const createEventSchema = z.object({
  title: z.string().min(1),
  category: z.string(),
  start_datetime: z.string(),
  end_datetime: z.string().optional(),
  is_all_day: z.boolean().optional().default(false),
  status: z.string()
});

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("events")
      .select("*")
      .order("start_datetime", { ascending: false });

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
    const parsed = createEventSchema.safeParse(payload);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return Response.json(
        { error: `${issue.path.join(".") || "root"} ${issue.message}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("events")
      .insert({
        title: parsed.data.title,
        category: parsed.data.category,
        start_datetime: parsed.data.start_datetime,
        end_datetime: parsed.data.end_datetime,
        is_all_day: parsed.data.is_all_day,
        status: parsed.data.status
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true, data });
  } catch (err) {
    console.error("Error creating event:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
