import { z } from "zod";
import { sendLineMessages } from "@/lib/line-sender";

const webhookMessageSchema = z
  .object({
    to: z.string().min(1).optional(),
    text: z.string().min(1).optional(),
    messages: z.array(z.record(z.unknown())).min(1).optional(),
    flexMessage: z.record(z.unknown()).optional()
  })
  .refine((value) => Boolean(value.text || value.flexMessage || value.messages?.length), {
    message: "Provide text, flexMessage, or messages"
  });

export async function POST(request: Request) {
  const requiredSecret = process.env.LINE_WEBHOOK_SECRET;
  const providedSecret = request.headers.get("x-webhook-secret") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (requiredSecret && providedSecret !== requiredSecret) {
    return Response.json({ error: "Unauthorized webhook secret" }, { status: 401 });
  }

  try {
    const raw = await request.json();
    const parsed = webhookMessageSchema.safeParse(raw);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return Response.json({ error: issue.message }, { status: 400 });
    }

    const messages = [
      ...(parsed.data.text ? [{ type: "text", text: parsed.data.text }] : []),
      ...(parsed.data.flexMessage ? [parsed.data.flexMessage] : []),
      ...(parsed.data.messages ?? [])
    ];

    await sendLineMessages(messages as Record<string, unknown>[], parsed.data.to);

    return Response.json({
      ok: true,
      sent: messages.length,
      to: parsed.data.to ?? process.env.LINE_USER_ID ?? null,
      webhookProtected: Boolean(requiredSecret)
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "LINE webhook message failed" },
      { status: 500 }
    );
  }
}
