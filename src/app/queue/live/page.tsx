"use client";

import { useEffect, useMemo, useState } from "react";
import { Moon, SunMedium } from "lucide-react";

type QueueStatus = "waiting" | "printing" | "done";

interface QueueItem {
  id: string;
  queueNo: number;
  clientName: string;
  jobType: string;
  pageCount: number;
  status: QueueStatus;
  note?: string;
}

function statusLabel(status: QueueStatus) {
  if (status === "waiting") {
    return "⏳ รอคิว";
  }

  if (status === "printing") {
    return "🖨️ กำลังดำเนินการ";
  }

  return "✅ รับงานได้แล้ว";
}

export default function QueueLivePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date>(new Date());
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("leo-theme");
    const nextTheme =
      savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);

    const loadQueue = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/queue", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "โหลดคิวไม่สำเร็จ");
        }

        setItems(Array.isArray(payload) ? payload : []);
        setUpdatedAt(new Date());
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadQueue();
    const timer = window.setInterval(loadQueue, 10000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const activeItems = useMemo(
    () => items.filter((item) => item.status !== "done").sort((a, b) => a.queueNo - b.queueNo),
    [items]
  );

  const reindexedActiveItems = useMemo(
    () => activeItems.map((item, index) => ({ ...item, newQueueNo: index + 1 })),
    [activeItems]
  );

  const current = useMemo(
    () => reindexedActiveItems.find((item) => item.status === "printing") ?? reindexedActiveItems[0],
    [reindexedActiveItems]
  );

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    window.localStorage.setItem("leo-theme", nextTheme);
  };

  return (
    <main className="min-h-screen bg-background px-3 py-4 text-textPrimary sm:px-4 sm:py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="card p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="mt-1 text-2xl font-bold sm:text-4xl">🎀 หน้าจอคิวลูกค้า</h1>
              <p className="mt-3 text-xs text-textSecondary">อัปเดตล่าสุด: {updatedAt.toLocaleTimeString("th-TH")}</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-xl border border-borderSoft bg-surface px-3 py-2 text-xs font-semibold text-textPrimary hover:bg-surface-2"
              aria-label="Toggle color theme"
            >
              {theme === "dark" ? <SunMedium size={14} /> : <Moon size={14} />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
          <article className="card p-4 sm:p-6">
            <p className="text-sm font-semibold text-textSecondary">คิวงานที่กำลังทำ</p>
            {loading ? (
              <p className="mt-4 text-lg">กำลังโหลดคิวงาน...</p>
            ) : !current ? (
              <div className="mt-4 rounded-2xl border border-dashed border-borderSoft bg-surface-2 p-8 text-center">
                <p className="text-2xl">💤</p>
                <p className="mt-2 text-lg font-semibold">ตอนนี้ไม่มีคิวรอดำเนินการ</p>
                <p className="text-sm text-textSecondary">แวะมาดูอีกครั้งได้เลย เดี๋ยวมีคิวใหม่เมื่อไรจะขึ้นทันที</p>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-borderSoft bg-surface-2 p-4 sm:p-6">
                <p className="text-xs font-semibold text-textSecondary">ลำดับคิวใหม่</p>
                <p className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl">#{current.newQueueNo}</p>
                <p className="mt-3 text-base font-semibold sm:text-lg">👤 {current.clientName}</p>
                <p className="mt-1 text-sm text-textSecondary">🧩 {current.jobType} • 📄 {current.pageCount} หน้า</p>
                <p className="mt-3 inline-flex rounded-full border border-borderSoft bg-surface px-3 py-1 text-xs font-bold text-textPrimary">
                  {statusLabel(current.status)}
                </p>
              </div>
            )}
          </article>

          <article className="card p-4 sm:p-6">
            <p className="text-sm font-semibold text-textSecondary">คิวทั้งหมด</p>
            <ul className="mt-4 space-y-3">
              {reindexedActiveItems.length === 0 ? (
                <li className="rounded-2xl border border-dashed border-borderSoft bg-surface-2 px-4 py-5 text-sm text-textSecondary">
                  ยังไม่มีคิวงาน
                </li>
              ) : (
                reindexedActiveItems.map((item) => (
                  <li key={item.id} className="rounded-2xl border border-borderSoft bg-surface-2 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold">#{item.newQueueNo} • {item.clientName}</p>
                        <p className="text-xs text-textSecondary">{item.jobType} • {item.pageCount} หน้า</p>
                      </div>
                      <span className="rounded-full border border-borderSoft bg-surface px-3 py-1 text-[11px] font-bold text-textPrimary">
                        {statusLabel(item.status)}
                      </span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
