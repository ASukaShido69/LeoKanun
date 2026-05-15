import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

const createJobSchema = z.object({
  title: z.string().min(1),
  clientId: z.string().uuid().optional(),
  sampleImages: z.array(z.string().url()).min(1),
  notes: z.string().optional().default("")
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = createJobSchema.safeParse(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return Response.json({ error: `${issue.path.join(".") || "root"} ${issue.message}` }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("jobs")
    .insert({
      title: parsed.data.title,
      client_id: parsed.data.clientId,
      sample_images: parsed.data.sampleImages,
      notes: parsed.data.notes
    })
    .select("id, title, client_id, sample_images")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, data });
}