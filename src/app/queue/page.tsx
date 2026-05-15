"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useAppSettings } from "@/components/providers/settings-provider";
import { ArrowDown, ArrowUp, Download, Plus, Search, Trash2 } from "lucide-react";

type QueueStatus = "waiting" | "printing" | "done";

interface QueueItem {
  id: string;
  queueNo: number;
  clientName: string;
  jobType: string;
  pageCount: number;
  note: string;
  status: QueueStatus;
  createdAt: string;
}

interface QueueForm {
  clientName: string;
  jobType: string;
  pageCount: string;
  note: string;
}

const STORAGE_KEY = "leo-queue-items-v1";

export default function QueuePage() {
  const { settings } = useAppSettings();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | QueueStatus>("all");
  const [form, setForm] = useState<QueueForm>({
    clientName: "",
    jobType: "",
    pageCount: "",
    note: ""
  });

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as QueueItem[];
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => (filter === "all" ? true : item.status === filter))
      .filter((item) => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return true;

        return (
          item.clientName.toLowerCase().includes(keyword) ||
          item.jobType.toLowerCase().includes(keyword) ||
          item.queueNo.toString().includes(keyword)
        );
      })
      .sort((a, b) => a.queueNo - b.queueNo);
  }, [items, filter, search]);

  const stats = useMemo(() => {
    const waiting = items.filter((item) => item.status === "waiting").length;
    const printing = items.filter((item) => item.status === "printing").length;
    const done = items.filter((item) => item.status === "done").length;
    const pages = items.reduce((sum, item) => sum + item.pageCount, 0);

    return { waiting, printing, done, pages };
  }, [items]);

  const doneProgress = items.length ? Math.round((stats.done / items.length) * 100) : 0;

  const addQueueItem = (event: FormEvent) => {
    event.preventDefault();
    if (!form.clientName.trim() || !form.jobType.trim() || !form.pageCount.trim()) return;

    const maxQueueNo = items.reduce((max, item) => Math.max(max, item.queueNo), 0);
    const next: QueueItem = {
      id: crypto.randomUUID(),
      queueNo: maxQueueNo + 1,
      clientName: form.clientName.trim(),
      jobType: form.jobType.trim(),
      pageCount: Number(form.pageCount) || 0,
      note: form.note.trim(),
      status: "waiting",
      createdAt: new Date().toISOString()
    };

    setItems((prev) => [...prev, next]);
    setForm({ clientName: "", jobType: "", pageCount: "", note: "" });
  };

  const updateStatus = (id: string, status: QueueStatus) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const moveQueue = (id: string, direction: "up" | "down") => {
    const ordered = [...items].sort((a, b) => a.queueNo - b.queueNo);
    const index = ordered.findIndex((item) => item.id === id);
    if (index < 0) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= ordered.length) return;

    const current = ordered[index];
    const target = ordered[swapIndex];

    const next = items.map((item) => {
      if (item.id === current.id) {
        return { ...item, queueNo: target.queueNo };
      }
      if (item.id === target.id) {
        return { ...item, queueNo: current.queueNo };
      }
      return item;
    });

    setItems(next);
  };

  const exportCsv = () => {
    const header = ["queue_no", "client_name", "job_type", "page_count", "status", "note"];
    const rows = [...filteredItems].map((item) => [
      item.queueNo,
      item.clientName,
      item.jobType,
      item.pageCount,
      item.status,
      item.note.replace(/,/g, " ")
    ]);

    const csvText = [header, ...rows].map((line) => line.join(",")).join("\n");
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `queue-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <section className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{settings.app.name} {settings.sidebar.queue}</h1>
          <p className="text-sm text-textSecondary">บริหารคิวงานร้านแบบเรียลไทม์ เพิ่มงานไว เรียงคิวไว ใช้งานง่าย</p>
        </div>
        <button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-borderSoft bg-surface px-3 py-2 text-sm font-semibold">
          <Download size={14} />
          Export CSV
        </button>
      </section>

      <section className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <article className="card p-3">
          <p className="text-xs text-textSecondary">รอคิว</p>
          <p className="mt-1 text-2xl font-bold">{stats.waiting}</p>
        </article>
        <article className="card p-3">
          <p className="text-xs text-textSecondary">กำลังทำ</p>
          <p className="mt-1 text-2xl font-bold">{stats.printing}</p>
        </article>
        <article className="card p-3">
          <p className="text-xs text-textSecondary">เสร็จแล้ว</p>
          <p className="mt-1 text-2xl font-bold">{stats.done}</p>
        </article>
        <article className="card p-3">
          <p className="text-xs text-textSecondary">รวมจำนวนหน้า</p>
          <p className="mt-1 text-2xl font-bold">{stats.pages}</p>
        </article>
      </section>

      <section className="card mb-4 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">ความคืบหน้ารวม</h2>
          <span className="text-xs font-semibold text-textSecondary">{doneProgress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-gradient-to-r from-accent via-secondary to-primary" style={{ width: `${doneProgress}%` }} />
        </div>
      </section>

      <section className="mb-4 card p-4">
        <h2 className="mb-3 text-lg font-semibold">เพิ่มงานเข้าคิว</h2>
        <form onSubmit={addQueueItem} className="grid gap-3 md:grid-cols-5">
          <input
            placeholder="ชื่อลูกค้า"
            value={form.clientName}
            onChange={(event) => setForm((prev) => ({ ...prev, clientName: event.target.value }))}
            className="rounded-xl border border-borderSoft bg-surface p-2"
            required
          />
          <input
            placeholder="ประเภทงาน"
            value={form.jobType}
            onChange={(event) => setForm((prev) => ({ ...prev, jobType: event.target.value }))}
            className="rounded-xl border border-borderSoft bg-surface p-2"
            required
          />
          <input
            placeholder="จำนวนหน้า"
            type="number"
            min={1}
            value={form.pageCount}
            onChange={(event) => setForm((prev) => ({ ...prev, pageCount: event.target.value }))}
            className="rounded-xl border border-borderSoft bg-surface p-2"
            required
          />
          <input
            placeholder="หมายเหตุ (ถ้ามี)"
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            className="rounded-xl border border-borderSoft bg-surface p-2"
          />
          <button type="submit" className="btn-primary inline-flex items-center justify-center gap-2 font-semibold">
            <Plus size={16} />
            เพิ่มเข้าคิว
          </button>
        </form>
      </section>

      <section className="card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="relative w-full max-w-xs">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
            <input
              className="w-full rounded-xl border border-borderSoft bg-surface py-2 pl-9 pr-3"
              placeholder="ค้นหาชื่อลูกค้า/ประเภทงาน/เลขคิว"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as "all" | QueueStatus)}
            className="rounded-xl border border-borderSoft bg-surface px-3 py-2 text-sm"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="waiting">รอคิว</option>
            <option value="printing">กำลังทำ</option>
            <option value="done">เสร็จแล้ว</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-borderSoft">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-surface-2 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold">ลำดับคิว</th>
                <th className="px-3 py-2 font-semibold">ชื่อลูกค้า</th>
                <th className="px-3 py-2 font-semibold">ประเภทงาน</th>
                <th className="px-3 py-2 font-semibold">จำนวนหน้า</th>
                <th className="px-3 py-2 font-semibold">สถานะ</th>
                <th className="px-3 py-2 font-semibold">หมายเหตุ</th>
                <th className="px-3 py-2 font-semibold">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-textSecondary">ยังไม่มีคิวงานที่ตรงเงื่อนไข</td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="border-t border-borderSoft/70">
                    <td className="px-3 py-2 font-bold">#{item.queueNo}</td>
                    <td className="px-3 py-2">{item.clientName}</td>
                    <td className="px-3 py-2">{item.jobType}</td>
                    <td className="px-3 py-2">{item.pageCount}</td>
                    <td className="px-3 py-2">
                      <span className={`status-chip ${item.status}`}>
                        {item.status === "waiting" ? "รอคิว" : item.status === "printing" ? "กำลังทำ" : "เสร็จแล้ว"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-textSecondary">{item.note || "-"}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-center gap-1">
                        <button type="button" onClick={() => moveQueue(item.id, "up")} className="rounded-md border border-borderSoft p-1.5" title="เลื่อนขึ้น">
                          <ArrowUp size={14} />
                        </button>
                        <button type="button" onClick={() => moveQueue(item.id, "down")} className="rounded-md border border-borderSoft p-1.5" title="เลื่อนลง">
                          <ArrowDown size={14} />
                        </button>
                        <button type="button" onClick={() => updateStatus(item.id, "waiting")} className="rounded-md border border-borderSoft px-2 py-1 text-xs font-semibold">รอ</button>
                        <button type="button" onClick={() => updateStatus(item.id, "printing")} className="rounded-md border border-borderSoft px-2 py-1 text-xs font-semibold">ทำ</button>
                        <button type="button" onClick={() => updateStatus(item.id, "done")} className="rounded-md border border-borderSoft px-2 py-1 text-xs font-semibold">เสร็จ</button>
                        <button type="button" onClick={() => deleteItem(item.id)} className="rounded-md border border-red-300 p-1.5 text-red-600" title="ลบคิว">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
