"use client";

import { useEffect, useMemo, useState } from "react";

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

  useEffect(() => {
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

  const activeItems = useMemo(() => items.filter((item) => item.status !== "done"), [items]);
  const current = useMemo(
    () => activeItems.find((item) => item.status === "printing") ?? activeItems[0],
    [activeItems]
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(244,167,185,0.2),_transparent_35%),linear-gradient(180deg,#fffafc_0%,#fff7fb_50%,#fff4f9_100%)] px-3 py-4 text-[#3D2C35] sm:px-4 sm:py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-3xl border border-[#f3d8e6] bg-white/80 p-4 shadow-[0_16px_34px_rgba(244,167,185,0.18)] backdrop-blur sm:p-6">
          <h1 className="mt-1 text-2xl font-bold sm:text-4xl">🎀 หน้าจอคิวลูกค้า</h1>
          <p className="mt-3 text-xs text-[#9f8691]">อัปเดตล่าสุด: {updatedAt.toLocaleTimeString("th-TH")}</p>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
          <article className="rounded-3xl border border-[#f3d8e6] bg-white p-4 shadow-[0_14px_28px_rgba(61,44,53,0.08)] sm:p-6">
            <p className="text-sm font-semibold text-[#8b6f7a]">คิวงานที่กำลังทำ</p>
            {loading ? (
              <p className="mt-4 text-lg">กำลังโหลดคิวงาน...</p>
            ) : !current ? (
              <div className="mt-4 rounded-2xl border border-dashed border-[#f0d7e5] bg-[#fff8fc] p-8 text-center">
                <p className="text-2xl">💤</p>
                <p className="mt-2 text-lg font-semibold">ตอนนี้ไม่มีคิวรอดำเนินการ</p>
                <p className="text-sm text-[#8b6f7a]">แวะมาดูอีกครั้งได้เลย เดี๋ยวมีคิวใหม่เมื่อไรจะขึ้นทันที</p>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-[#edd3e0] bg-[#fff7fb] p-4 sm:p-6">
                <p className="text-xs font-semibold text-[#946f7e]">หมายเลขคิว</p>
                <p className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl">#{current.queueNo}</p>
                <p className="mt-3 text-base font-semibold sm:text-lg">👤 {current.clientName}</p>
                <p className="mt-1 text-sm text-[#7f6771]">🧩 {current.jobType} • 📄 {current.pageCount} หน้า</p>
                <p className="mt-3 inline-flex rounded-full border border-[#e9c5d6] bg-white px-3 py-1 text-xs font-bold text-[#7a4d5e]">
                  {statusLabel(current.status)}
                </p>
              </div>
            )}
          </article>

          <article className="rounded-3xl border border-[#f3d8e6] bg-white p-4 shadow-[0_14px_28px_rgba(61,44,53,0.08)] sm:p-6">
            <p className="text-sm font-semibold text-[#8b6f7a]">คิวทั้งหมด</p>
            <ul className="mt-4 space-y-3">
              {activeItems.length === 0 ? (
                <li className="rounded-2xl border border-dashed border-[#f0d7e5] bg-[#fff8fc] px-4 py-5 text-sm text-[#8b6f7a]">
                  ยังไม่มีคิวงาน
                </li>
              ) : (
                activeItems.map((item) => (
                  <li key={item.id} className="rounded-2xl border border-[#f0d7e5] bg-[#fff9fc] px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold">#{item.queueNo} • {item.clientName}</p>
                        <p className="text-xs text-[#7f6771]">{item.jobType} • {item.pageCount} หน้า</p>
                      </div>
                      <span className="rounded-full border border-[#e9c5d6] bg-white px-3 py-1 text-[11px] font-bold text-[#7a4d5e]">
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
