import { supabaseAdmin } from "@/lib/supabase-admin";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { error } = await supabaseAdmin
      .from("finance")
      .delete()
      .eq("id", id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
