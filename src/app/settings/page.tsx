"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { DEFAULT_SETTINGS } from "@/lib/default-settings";
import { appSettingsSchema, type AppSettingsSchema } from "@/lib/settings-schema";
import { useAppSettings } from "@/components/providers/settings-provider";
import { Modal } from "@/components/ui/modal";

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <input
        className="mt-1 w-full rounded-xl border border-borderSoft p-2"
        type="text"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
    </label>
  );
}

export default function SettingsPage() {
  const { settings, loading, error, saveSettings } = useAppSettings();
  const [draft, setDraft] = useState<AppSettingsSchema>(DEFAULT_SETTINGS as AppSettingsSchema);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"basic" | "layout" | "json">("basic");
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [lineResult, setLineResult] = useState("");
  const [lineLoading, setLineLoading] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function onSave() {
    try {
      const parsed = appSettingsSchema.safeParse(draft);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        setMessage(`${settings.settingsPage.invalidJsonMessage}: ${issue.path.join(".") || "root"} ${issue.message}`);
        return;
      }

      await saveSettings(parsed.data);
      setMessage(settings.settingsPage.successMessage);
    } catch {
      setMessage(settings.settingsPage.invalidJsonMessage);
    }
  }

  const exportConfig = () => {
    const dataStr = JSON.stringify(draft, null, 2);
    const element = document.createElement("a");
    element.setAttribute("href", `data:text/json;charset=utf-8,${encodeURIComponent(dataStr)}`);
    element.setAttribute("download", `leokanun-settings-${new Date().toISOString().split("T")[0]}.json`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const runLineAction = async (runner: () => Promise<unknown>) => {
    setLineLoading(true);
    setLineResult("");

    try {
      const result = await runner();
      setLineResult(JSON.stringify(result, null, 2));
    } catch (err) {
      setLineResult(JSON.stringify({ error: err instanceof Error ? err.message : "LINE action failed" }, null, 2));
    } finally {
      setLineLoading(false);
    }
  };

  const sendLatestQueueToLine = async () => {
    await runLineAction(async () => {
      const response = await fetch("/api/line/queue", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to send queue to LINE");
      return payload;
    });
  };

  const testLineApiCall = async () => {
    await runLineAction(async () => {
      const response = await fetch("/api/line/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "weekly",
          data: { summary: "LINE Dashboard test call at " + new Date().toLocaleString("th-TH") }
        })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "LINE API test failed");
      return payload;
    });
  };

  const testWebhook = async () => {
    await runLineAction(async () => {
      const response = await fetch("/api/line/webhook/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl: draft.line.webhookUrl || undefined })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Webhook test failed");
      return payload;
    });
  };

  const checkLineHealth = async () => {
    await runLineAction(async () => {
      const response = await fetch("/api/line/health", { method: "GET", cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Health check failed");
      return payload;
    });
  };

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-bold">{settings.app.name} {settings.settingsPage.title}</h1>
      {loading ? <p className="text-sm text-textSecondary">กำลังโหลดการตั้งค่า...</p> : null}
      {error ? <p className="text-sm text-red-500">เกิดข้อผิดพลาด: {error}</p> : null}

      <div className="mb-4 flex gap-2 overflow-x-auto border-b border-borderSoft pb-1">
        {["basic", "layout", "json"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as "basic" | "layout" | "json")}
            className={`shrink-0 whitespace-nowrap px-4 py-2 font-semibold transition ${tab === t ? "border-b-2 border-primary text-primary" : "text-textSecondary hover:text-textPrimary"}`}
          >
            {t === "basic" ? "📱 App" : t === "layout" ? "🎨 UI" : "💾 JSON"}
          </button>
        ))}
      </div>

      {tab === "basic" && (
        <section className="space-y-4">
          <article className="card space-y-3 p-4">
            <h2 className="font-semibold">App Settings</h2>
            <TextField label="App Name" value={draft.app.name} onChange={(v) => setDraft({ ...draft, app: { ...draft.app, name: v } })} />
            <TextField label="Description" value={draft.app.description} onChange={(v) => setDraft({ ...draft, app: { ...draft.app, description: v } })} />
            <TextField label="Language" value={draft.app.language} onChange={(v) => setDraft({ ...draft, app: { ...draft.app, language: v } })} />
          </article>
          <article className="card space-y-3 p-4">
            <h2 className="font-semibold">Topbar</h2>
            <TextField label="Greeting" value={draft.topbar.greeting} onChange={(v) => setDraft({ ...draft, topbar: { ...draft.topbar, greeting: v } })} />
            <TextField label="Time Prefix" value={draft.topbar.timePrefix} onChange={(v) => setDraft({ ...draft, topbar: { ...draft.topbar, timePrefix: v } })} />
            <TextField label="Time Suffix" value={draft.topbar.timeSuffix} onChange={(v) => setDraft({ ...draft, topbar: { ...draft.topbar, timeSuffix: v } })} />
          </article>
          <article className="card space-y-3 p-4">
            <h2 className="font-semibold">LINE Messaging</h2>
            <TextField label="Morning Title" value={draft.line.morningTitle} onChange={(v) => setDraft({ ...draft, line: { ...draft.line, morningTitle: v } })} />
            <TextField label="Event Created Title" value={draft.line.eventCreatedTitle} onChange={(v) => setDraft({ ...draft, line: { ...draft.line, eventCreatedTitle: v } })} />
            <TextField label="Weekly Title" value={draft.line.weeklyTitle} onChange={(v) => setDraft({ ...draft, line: { ...draft.line, weeklyTitle: v } })} />
            <TextField label="Webhook URL" value={draft.line.webhookUrl} onChange={(v) => setDraft({ ...draft, line: { ...draft.line, webhookUrl: v } })} />
          </article>
          <article className="card space-y-3 p-4">
            <h2 className="font-semibold">LINE Dashboard</h2>
            <p className="text-sm text-textSecondary">ตั้งค่าและทดสอบการทำงาน LINE เช่น ส่งคิวงานล่าสุด, Test API, Webhook และ Health</p>
            <button
              type="button"
              className="rounded-button border border-borderSoft bg-surface px-4 py-2 text-sm font-semibold text-textPrimary hover:bg-surface-2"
              onClick={() => setIsLineModalOpen(true)}
            >
              เปิด LINE Dashboard Modal
            </button>
          </article>
        </section>
      )}

      {tab === "layout" && (
        <section className="space-y-4">
          <article className="card space-y-3 p-4">
            <h2 className="font-semibold">Sidebar Navigation</h2>
            <TextField label="Dashboard" value={draft.sidebar.dashboard} onChange={(v) => setDraft({ ...draft, sidebar: { ...draft.sidebar, dashboard: v } })} />
            <TextField label="Queue" value={draft.sidebar.queue} onChange={(v) => setDraft({ ...draft, sidebar: { ...draft.sidebar, queue: v } })} />
            <TextField label="Tasks" value={draft.sidebar.tasks} onChange={(v) => setDraft({ ...draft, sidebar: { ...draft.sidebar, tasks: v } })} />
            <TextField label="Finance" value={draft.sidebar.finance} onChange={(v) => setDraft({ ...draft, sidebar: { ...draft.sidebar, finance: v } })} />
            <TextField label="Settings" value={draft.sidebar.settings} onChange={(v) => setDraft({ ...draft, sidebar: { ...draft.sidebar, settings: v } })} />
          </article>
          <article className="card space-y-3 p-4">
            <h2 className="font-semibold">Dashboard Cards</h2>
            <TextField label="Today Queue" value={draft.dashboard.cards.todayQueueTitle} onChange={(v) => setDraft({ ...draft, dashboard: { ...draft.dashboard, cards: { ...draft.dashboard.cards, todayQueueTitle: v } } })} />
            <TextField label="Pending Tasks" value={draft.dashboard.cards.pendingTaskTitle} onChange={(v) => setDraft({ ...draft, dashboard: { ...draft.dashboard, cards: { ...draft.dashboard.cards, pendingTaskTitle: v } } })} />
            <TextField label="Monthly Income" value={draft.dashboard.cards.monthlyIncomeTitle} onChange={(v) => setDraft({ ...draft, dashboard: { ...draft.dashboard, cards: { ...draft.dashboard.cards, monthlyIncomeTitle: v } } })} />
            <TextField label="Near Deadline" value={draft.dashboard.cards.nearDeadlineTitle} onChange={(v) => setDraft({ ...draft, dashboard: { ...draft.dashboard, cards: { ...draft.dashboard.cards, nearDeadlineTitle: v } } })} />
          </article>
          <article className="card space-y-3 p-4">
            <h2 className="font-semibold">Preset Lists (ใช้งานประจำ)</h2>
            <ListEditor
              label="ประเภทงานร้าน"
              items={draft.queuePresets.jobTypes}
              placeholder="เช่น พิมพ์สี A3"
              onChange={(next) => setDraft({ ...draft, queuePresets: { ...draft.queuePresets, jobTypes: next } })}
            />
            <ListEditor
              label="หมวดหมู่รายรับ"
              items={draft.financePresets.incomeCategories}
              placeholder="เช่น งานพิมพ์ด่วน"
              onChange={(next) => setDraft({ ...draft, financePresets: { ...draft.financePresets, incomeCategories: next } })}
            />
            <ListEditor
              label="หมวดหมู่รายจ่าย"
              items={draft.financePresets.expenseCategories}
              placeholder="เช่น ค่ากระดาษ"
              onChange={(next) => setDraft({ ...draft, financePresets: { ...draft.financePresets, expenseCategories: next } })}
            />
          </article>
        </section>
      )}

      {tab === "json" && (
        <section className="card space-y-4 p-4">
          <h2 className="font-semibold">Full JSON Settings</h2>
          <textarea
            className="h-96 w-full rounded-xl border border-borderSoft p-3 font-mono text-sm"
            value={JSON.stringify(draft, null, 2)}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
              try {
                setDraft(JSON.parse(e.target.value));
              } catch {}
            }}
          />
        </section>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button type="button" className="btn-primary font-semibold" onClick={onSave}>
          {settings.settingsPage.saveButton}
        </button>
        <button type="button" className="rounded-button border border-primary/30 bg-primary/10 px-4 py-2 font-semibold text-primary" onClick={exportConfig}>
          ⬇️ Export Settings
        </button>
      </div>

      {message && (
        <div className={`mt-4 rounded-xl p-3 ${message.includes("สำเร็จ") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          <p className="text-sm">{message}</p>
        </div>
      )}

      <Modal isOpen={isLineModalOpen} onClose={() => setIsLineModalOpen(false)} title="LINE Dashboard" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-textSecondary">สำหรับส่งคิวงานร้าน, ทดสอบ API, ทดสอบ Webhook และเช็ก Health แบบเรียลไทม์</p>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className="btn-primary text-sm font-semibold"
              onClick={sendLatestQueueToLine}
              disabled={lineLoading}
            >
              ส่งคิวงานร้านล่าสุดไป LINE
            </button>
            <button
              type="button"
              className="rounded-button border border-borderSoft bg-surface px-4 py-2 text-sm font-semibold text-textPrimary hover:bg-surface-2"
              onClick={testLineApiCall}
              disabled={lineLoading}
            >
              Test Call API /api/line/send
            </button>
            <button
              type="button"
              className="rounded-button border border-borderSoft bg-surface px-4 py-2 text-sm font-semibold text-textPrimary hover:bg-surface-2"
              onClick={testWebhook}
              disabled={lineLoading}
            >
              Test Webhook
            </button>
            <button
              type="button"
              className="rounded-button border border-borderSoft bg-surface px-4 py-2 text-sm font-semibold text-textPrimary hover:bg-surface-2"
              onClick={checkLineHealth}
              disabled={lineLoading}
            >
              Check Webhook/API Health
            </button>
          </div>

          <label className="block text-sm">
            <span className="font-medium">Webhook URL (optional for remote test)</span>
            <input
              type="url"
              value={draft.line.webhookUrl}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, line: { ...draft.line, webhookUrl: e.target.value } })}
              placeholder="https://your-webhook.example.com/line"
              className="mt-1 w-full rounded-xl border border-borderSoft p-2"
            />
          </label>

          <div className="rounded-xl border border-borderSoft bg-surface p-3">
            <p className="text-sm font-semibold">Webhook สำหรับยิง LINE Message API</p>
            <p className="mt-1 text-xs text-textSecondary">เรียก endpoint นี้เพื่อส่งข้อความหรือ flex message เข้า LINE ได้โดยตรง</p>
            <pre className="mt-2 overflow-auto rounded-lg bg-surface-2 p-3 text-[11px] text-textSecondary">{`${origin || "https://your-domain.com"}/api/line/webhook/message\nHeaders: Content-Type: application/json\nOptional: x-webhook-secret: YOUR_LINE_WEBHOOK_SECRET\nBody: {\n  "text": "ทดสอบส่งข้อความจาก webhook"\n}`}</pre>
          </div>

          <button
            type="button"
            className="rounded-button border border-borderSoft bg-surface px-4 py-2 text-sm font-semibold text-textPrimary hover:bg-surface-2"
            onClick={onSave}
            disabled={lineLoading}
          >
            บันทึก Webhook URL ลง Settings
          </button>

          <div className="rounded-xl border border-borderSoft bg-surface-2 p-3">
            <p className="mb-2 text-sm font-semibold">Result</p>
            <pre className="max-h-72 overflow-auto text-xs text-textSecondary">{lineLoading ? "กำลังประมวลผล..." : lineResult || "ยังไม่มีผลลัพธ์"}</pre>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}

function ListEditor({
  label,
  items,
  placeholder,
  onChange
}: {
  label: string;
  items: string[];
  placeholder: string;
  onChange: (next: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const addItem = () => {
    const next = input.trim();
    if (!next) return;
    if (items.includes(next)) {
      setInput("");
      return;
    }
    onChange([...items, next]);
    setInput("");
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2 rounded-xl border border-borderSoft p-3">
      <p className="text-sm font-semibold">{label}</p>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-borderSoft p-2 text-sm"
        />
        <button
          type="button"
          onClick={addItem}
          className="rounded-button border border-borderSoft bg-surface px-3 py-2 text-xs font-semibold"
        >
          เพิ่ม
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.length === 0 ? <span className="text-xs text-textSecondary">ยังไม่มีรายการ</span> : null}
        {items.map((item, index) => (
          <span key={`${item}-${index}`} className="inline-flex items-center gap-1 rounded-full border border-borderSoft px-2 py-1 text-xs">
            {item}
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="rounded-full px-1 text-red-500 hover:bg-red-50"
              aria-label="remove"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}