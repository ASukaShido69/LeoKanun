type FlexType = "morning" | "event" | "weekly";

interface LineTemplateSettings {
  appName: string;
  morningTitle: string;
  eventCreatedTitle: string;
  weeklyTitle: string;
}

export function buildFlexMessage(type: FlexType, data: Record<string, unknown>, settings: LineTemplateSettings) {
  const morningTitle = settings.morningTitle.replace("{appName}", settings.appName);
  const eventCreatedTitle = settings.eventCreatedTitle;

  switch (type) {
    case "morning":
      return {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            { type: "text", text: morningTitle, weight: "bold", size: "lg" },
            { type: "text", text: String(data.date ?? ""), size: "sm" }
          ]
        }
      };
    case "event":
      return {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            { type: "text", text: eventCreatedTitle, weight: "bold" },
            { type: "text", text: String(data.title ?? "") }
          ]
        }
      };
    case "weekly":
      return {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            { type: "text", text: settings.weeklyTitle, weight: "bold", size: "lg" },
            { type: "text", text: String(data.summary ?? ""), size: "sm", wrap: true }
          ]
        }
      };
    default:
      throw new Error("Unknown LINE flex type");
  }
}