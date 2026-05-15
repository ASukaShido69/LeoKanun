export async function sendLineMessages(messages: Record<string, unknown>[], to?: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const userId = to ?? process.env.LINE_USER_ID;

  if (!token || !userId) {
    throw new Error("Missing LINE_CHANNEL_ACCESS_TOKEN or LINE_USER_ID");
  }

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: userId,
      messages
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message);
  }
}

export async function sendFlexMessageToLine(flexMessage: Record<string, unknown>) {
  await sendLineMessages([flexMessage]);
}