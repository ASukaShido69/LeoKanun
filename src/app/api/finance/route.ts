import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

const createFinanceSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  category: z.string(),
  description: z.string().optional().default(""),
  date: z.string()
});

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select("id, type, amount, category, note, date")
      .order("date", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const normalized = (data || []).map((row: any) => ({
      id: row.id,
      type: row.type,
      amount: row.amount,
      category: row.category,
      description: row.note || "",
      date: row.date
    }));

    return Response.json(normalized);
  } catch (err) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = createFinanceSchema.safeParse(payload);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return Response.json(
        { error: `${issue.path.join(".") || "root"} ${issue.message}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("transactions")
      .insert({
        type: parsed.data.type,
        amount: parsed.data.amount,
        category: parsed.data.category,
        note: parsed.data.description,
        date: parsed.data.date
      })
      .select("id, type, amount, category, note, date")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      ok: true,
      data: {
        id: data.id,
        type: data.type,
        amount: data.amount,
        category: data.category,
        description: data.note || "",
        date: data.date
      }
    });
  } catch (err) {
    console.error("Error creating finance entry:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
