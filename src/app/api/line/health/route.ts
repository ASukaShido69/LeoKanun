export async function GET() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const userId = process.env.LINE_USER_ID;

  const env = {
    lineChannelAccessToken: Boolean(token),
    lineUserId: Boolean(userId)
  };

  if (!token || !userId) {
    return Response.json(
      {
        ok: false,
        health: "missing_env",
        env,
        checkedAt: new Date().toISOString()
      },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://api.line.me/v2/bot/info", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
    });

    const raw = await response.text();
    let parsed: unknown = raw;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw;
    }

    return Response.json({
      ok: response.ok,
      health: response.ok ? "healthy" : "degraded",
      env,
      lineApiStatus: response.status,
      lineApiResponse: parsed,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        health: "unreachable",
        env,
        error: error instanceof Error ? error.message : "LINE health check failed",
        checkedAt: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
