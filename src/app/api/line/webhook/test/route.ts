import { z } from "zod";
import { getServerAppSettings } from "@/lib/server-settings";

const testWebhookSchema = z.object({
  targetUrl: z.string().url().optional()
});

const SAMPLE_PAYLOAD = {
  destination: "Uxxxxxxxxxxxxxxxxxxxx",
  events: [
    {
      type: "message",
      mode: "active",
      timestamp: Date.now(),
      source: { type: "user", userId: "UtestUser" },
      webhookEventId: `test-${Date.now()}`,
      deliveryContext: { isRedelivery: false },
      message: { id: "100001", type: "text", text: "LINE webhook test" },
      replyToken: "test-reply-token"
    }
  ]
};

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const parsed = testWebhookSchema.safeParse(raw);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return Response.json({ error: `${issue.path.join(".") || "root"} ${issue.message}` }, { status: 400 });
    }

    const settings = await getServerAppSettings().catch(() => null);
    const targetUrl = parsed.data.targetUrl || settings?.line?.webhookUrl;

    if (!targetUrl) {
      return Response.json({
        ok: true,
        mode: "local-test",
        payload: SAMPLE_PAYLOAD,
        message: "Webhook test payload generated"
      });
    }

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-line-signature": "test-signature"
      },
      body: JSON.stringify(SAMPLE_PAYLOAD)
    });

    const rawText = await response.text();

    return Response.json({
      ok: response.ok,
      mode: "remote-test",
      targetUrl,
      status: response.status,
      responseBody: rawText,
      payload: SAMPLE_PAYLOAD
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Webhook test failed" },
      { status: 500 }
    );
  }
}
