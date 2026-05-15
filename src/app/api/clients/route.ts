import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

const createClientSchema = z.object({
  name: z.string().min(1),
  avatarUrl: z.string().url(),
  notes: z.string().optional().default("")
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = createClientSchema.safeParse(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return Response.json({ error: `${issue.path.join(".") || "root"} ${issue.message}` }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("clients")
    .insert({
      name: parsed.data.name,
      avatar_url: parsed.data.avatarUrl,
      notes: parsed.data.notes
    })
    .select("id, name, avatar_url")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, data });
}