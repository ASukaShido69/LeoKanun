"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useAppSettings } from "@/components/providers/settings-provider";
import { ArrowDown, ArrowUp, Download, Pencil, Plus, Save, Search, Star, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

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

interface QueueInlineEditForm {
  clientName: string;
  jobType: string;
  pageCount: string;
}

export default function QueuePage() {
  const { settings, saveSettings } = useAppSettings();
  const queueJobTypes = settings.queuePresets.jobTypes;
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [presetMessage, setPresetMessage] = useState("");
  const [presetSaving, setPresetSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inlineEditForm, setInlineEditForm] = useState<QueueInlineEditForm>({
    clientName: "",
    jobType: "",
    pageCount: ""
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | QueueStatus>("all");
  const [form, setForm] = useState<QueueForm>({
    clientName: "",
    jobType: "",
    pageCount: "",
    note: ""
  });

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/queue", { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "โหลดคิวงานไม่สำเร็จ");
      }

      setItems(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดคิวงานไม่สำเร็จ");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    const channel = supabase
      .channel("public:queue_jobs")
      .on("postgres_changes", { event: "*", schema: "public", table: "queue_jobs" }, () => {
        loadQueue();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [loadQueue]);

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

  const addQueueItem = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.clientName.trim() || !form.jobType.trim() || !form.pageCount.trim()) return;

    setMutating(true);
    setError("");
    try {
      const response = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: form.clientName.trim(),
          jobType: form.jobType.trim(),
          pageCount: Number(form.pageCount) || 1,
          note: form.note.trim()
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "เพิ่มคิวงานไม่สำเร็จ");
      }

      setForm({ clientName: "", jobType: "", pageCount: "", note: "" });
      await loadQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เพิ่มคิวงานไม่สำเร็จ");
    } finally {
      setMutating(false);
    }
  };

  const addFavoriteJobType = async () => {
    const nextType = form.jobType.trim();
    if (!nextType) {
      setPresetMessage("กรอกประเภทงานก่อน แล้วค่อยเพิ่มเป็นรายการโปรด");
      return;
    }

    if (queueJobTypes.some((item) => item.toLowerCase() === nextType.toLowerCase())) {
      setPresetMessage("ประเภทงานนี้มีในรายการโปรดแล้ว");
      return;
    }

    setPresetSaving(true);
    setPresetMessage("");
    try {
      await saveSettings({
        ...settings,
        queuePresets: {
          ...settings.queuePresets,
          jobTypes: [...queueJobTypes, nextType]
        }
      });
      setPresetMessage(`เพิ่ม \"${nextType}\" ในรายการโปรดแล้ว`);
    } catch {
      setPresetMessage("เพิ่มรายการโปรดไม่สำเร็จ");
    } finally {
      setPresetSaving(false);
    }
  };

  const removeFavoriteJobType = async (jobType: string) => {
    setPresetSaving(true);
    setPresetMessage("");
    try {
      await saveSettings({
        ...settings,
        queuePresets: {
          ...settings.queuePresets,
          jobTypes: queueJobTypes.filter((item) => item !== jobType)
        }
      });
      setPresetMessage(`ลบ \"${jobType}\" ออกจากรายการโปรดแล้ว`);
    } catch {
      setPresetMessage("ลบรายการโปรดไม่สำเร็จ");
    } finally {
      setPresetSaving(false);
    }
  };

  const updateStatus = async (id: string, status: QueueStatus) => {
    setMutating(true);
    setError("");
    try {
      const response = await fetch(`/api/queue/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "อัปเดตสถานะไม่สำเร็จ");
      }

      await loadQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setMutating(false);
    }
  };

  const startInlineEdit = (item: QueueItem) => {
    setEditingId(item.id);
    setInlineEditForm({
      clientName: item.clientName,
      jobType: item.jobType,
      pageCount: String(item.pageCount)
    });
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
    setInlineEditForm({ clientName: "", jobType: "", pageCount: "" });
  };

  const saveInlineEdit = async (item: QueueItem) => {
    if (!inlineEditForm.clientName.trim() || !inlineEditForm.jobType.trim() || !inlineEditForm.pageCount.trim()) {
      setError("กรุณากรอก ชื่อลูกค้า ประเภทงาน และจำนวนหน้า ให้ครบ");
      return;
    }

    setMutating(true);
    setError("");
    try {
      const response = await fetch(`/api/queue/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: inlineEditForm.clientName.trim(),
          jobType: inlineEditForm.jobType.trim(),
          pageCount: Number(inlineEditForm.pageCount) || 1,
          note: item.note,
          status: item.status
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "บันทึกการแก้ไขไม่สำเร็จ");
      }

      cancelInlineEdit();
      await loadQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกการแก้ไขไม่สำเร็จ");
    } finally {
      setMutating(false);
    }
  };

  const deleteItem = async (id: string) => {
    setMutating(true);
    setError("");
    try {
      const response = await fetch(`/api/queue/${id}`, { method: "DELETE" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "ลบคิวงานไม่สำเร็จ");
      }

      await loadQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ลบคิวงานไม่สำเร็จ");
    } finally {
      setMutating(false);
    }
  };

  const moveQueue = async (id: string, direction: "up" | "down") => {
    const ordered = [...items].sort((a, b) => a.queueNo - b.queueNo);
    const index = ordered.findIndex((item) => item.id === id);
    if (index < 0) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= ordered.length) return;

    const current = ordered[index];
    const target = ordered[swapIndex];

    setMutating(true);
    setError("");
    try {
      const [aRes, bRes] = await Promise.all([
        fetch(`/api/queue/${current.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ queueNo: target.queueNo })
        }),
        fetch(`/api/queue/${target.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ queueNo: current.queueNo })
        })
      ]);

      if (!aRes.ok || !bRes.ok) {
        const aPayload = await aRes.json().catch(() => ({}));
        const bPayload = await bRes.json().catch(() => ({}));
        throw new Error(aPayload.error ?? bPayload.error ?? "เลื่อนคิวไม่สำเร็จ");
      }

      await loadQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เลื่อนคิวไม่สำเร็จ");
    } finally {
      setMutating(false);
    }
  };

  const getStatusLabel = (status: QueueStatus) => {
    if (status === "waiting") return "รอคิว";
    if (status === "printing") return "กำลังทำ";
    return "เสร็จแล้ว";
  };

  const exportXlsx = async () => {
    setExporting(true);
    setError("");

    try {
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      workbook.creator = settings.app.name;
      workbook.created = new Date();

      const summary = workbook.addWorksheet("สรุปคิวงาน");
      summary.columns = [
        { header: "หัวข้อ", key: "label", width: 28 },
        { header: "ค่า", key: "value", width: 24 }
      ];

      summary.addRows([
        { label: "ชื่อระบบ", value: settings.app.name },
        { label: "วันที่ส่งออก", value: new Date().toLocaleString("th-TH") },
        { label: "รายการทั้งหมด", value: filteredItems.length },
        { label: "รอคิว", value: stats.waiting },
        { label: "กำลังทำ", value: stats.printing },
        { label: "เสร็จแล้ว", value: stats.done },
        { label: "รวมจำนวนหน้า", value: stats.pages },
        { label: "ความคืบหน้า", value: `${doneProgress}%` }
      ]);

      summary.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      summary.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF6B7280" }
      };
      summary.eachRow((row, rowNumber) => {
        row.alignment = { vertical: "middle" };
        if (rowNumber > 1 && rowNumber % 2 === 0) {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8FAFC" }
          };
        }
      });

      const detail = workbook.addWorksheet("ตารางคิวงาน");
      detail.columns = [
        { header: "ลำดับคิว", key: "queueNo", width: 12 },
        { header: "ชื่อลูกค้า", key: "clientName", width: 24 },
        { header: "ประเภทงาน", key: "jobType", width: 22 },
        { header: "จำนวนหน้า", key: "pageCount", width: 12 },
        { header: "สถานะ", key: "status", width: 14 },
        { header: "หมายเหตุ", key: "note", width: 38 },
        { header: "สร้างเมื่อ", key: "createdAt", width: 22 }
      ];

      filteredItems.forEach((item) => {
        detail.addRow({
          queueNo: item.queueNo,
          clientName: item.clientName,
          jobType: item.jobType,
          pageCount: item.pageCount,
          status: getStatusLabel(item.status),
          note: item.note || "-",
          createdAt: new Date(item.createdAt).toLocaleString("th-TH")
        });
      });

      detail.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      detail.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF111827" }
      };
      detail.views = [{ state: "frozen", ySplit: 1 }];

      detail.eachRow((row, rowNumber) => {
        row.alignment = { vertical: "middle" };
        if (rowNumber > 1 && rowNumber % 2 === 0) {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8FAFC" }
          };
        }

        const statusCell = row.getCell(5);
        if (rowNumber > 1) {
          if (statusCell.value === "รอคิว") {
            statusCell.font = { bold: true, color: { argb: "FF9A3412" } };
          } else if (statusCell.value === "กำลังทำ") {
            statusCell.font = { bold: true, color: { argb: "FF6D28D9" } };
          } else if (statusCell.value === "เสร็จแล้ว") {
            statusCell.font = { bold: true, color: { argb: "FF166534" } };
          }
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `queue-report-${new Date().toISOString().split("T")[0]}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "สร้างไฟล์ Excel ไม่สำเร็จ");
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppShell>
      <section className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">{settings.app.name} {settings.sidebar.queue}</h1>
          <p className="text-sm text-textSecondary">บริหารคิวงานร้านแบบเรียลไทม์ เพิ่มงานไว เรียงคิวไว ใช้งานง่าย</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
          <button
            type="button"
            onClick={exportXlsx}
            disabled={exporting || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-borderSoft bg-surface px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download size={14} />
            {exporting ? "กำลังสร้าง Excel..." : "Export Excel (.xlsx)"}
          </button>
        </div>
      </section>

      {error ? (
        <section className="mb-4 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </section>
      ) : null}

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

      <section className="mb-4">
        <article className="card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">ความคืบหน้ารวม</h2>
            <span className="text-xs font-semibold text-textSecondary">{doneProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-gradient-to-r from-accent via-secondary to-primary" style={{ width: `${doneProgress}%` }} />
          </div>

          <div className="mt-4">
            <h2 className="mb-3 text-lg font-semibold">เพิ่มงานเข้าคิว</h2>
            <form onSubmit={addQueueItem} className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <input
                placeholder="ชื่อลูกค้า"
                value={form.clientName}
                onChange={(event) => setForm((prev) => ({ ...prev, clientName: event.target.value }))}
                className="rounded-xl border border-borderSoft bg-surface p-2"
                required
              />
              <div className="flex items-center gap-2 md:col-span-2 xl:col-span-1">
                <input
                  placeholder="ประเภทงาน"
                  list="queue-jobtype-presets"
                  value={form.jobType}
                  onChange={(event) => setForm((prev) => ({ ...prev, jobType: event.target.value }))}
                  className="w-full rounded-xl border border-borderSoft bg-surface p-2"
                  required
                />
                <button
                  type="button"
                  onClick={addFavoriteJobType}
                  disabled={presetSaving}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-borderSoft bg-surface text-amber-500 disabled:opacity-50"
                  title="เพิ่มประเภทงานนี้เป็นรายการโปรด"
                  aria-label="เพิ่มประเภทงานโปรด"
                >
                  <Star size={16} />
                </button>
              </div>
              <datalist id="queue-jobtype-presets">
                {queueJobTypes.map((jobType) => (
                  <option key={jobType} value={jobType} />
                ))}
              </datalist>
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
                className="rounded-xl border border-borderSoft bg-surface p-2 md:col-span-2 xl:col-span-1"
              />
              <button type="submit" className="btn-primary inline-flex items-center justify-center gap-2 font-semibold md:col-span-2 xl:col-span-1">
                <Plus size={16} />
                เพิ่มเข้าคิว
              </button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {queueJobTypes.length === 0 ? <span className="text-xs text-textSecondary">ยังไม่มีประเภทงานโปรด เพิ่มได้จากช่องประเภทงาน</span> : null}
              {queueJobTypes.map((jobType) => (
                <button
                  key={jobType}
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-borderSoft px-3 py-1 text-xs font-semibold text-textSecondary hover:bg-surface-2"
                  onClick={() => setForm((prev) => ({ ...prev, jobType }))}
                >
                  {jobType}
                  <span
                    role="button"
                    aria-label={`ลบ ${jobType} จากรายการโปรด`}
                    className="rounded-full px-1 text-red-500 hover:bg-red-50"
                    onClick={(event) => {
                      event.stopPropagation();
                      void removeFavoriteJobType(jobType);
                    }}
                  >
                    ×
                  </span>
                </button>
              ))}
            </div>
            {presetMessage ? <p className="mt-2 text-xs text-textSecondary">{presetMessage}</p> : null}
          </div>
        </article>
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-textSecondary">กำลังโหลดข้อมูลคิว...</td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-textSecondary">ยังไม่มีคิวงานที่ตรงเงื่อนไข</td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="border-t border-borderSoft/70">
                    <td className="px-3 py-2 font-bold">#{item.queueNo}</td>
                    <td className="px-3 py-2">
                      {editingId === item.id ? (
                        <input
                          className="w-full rounded-md border border-borderSoft bg-surface px-2 py-1"
                          value={inlineEditForm.clientName}
                          onChange={(event) => setInlineEditForm((prev) => ({ ...prev, clientName: event.target.value }))}
                        />
                      ) : (
                        item.clientName
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editingId === item.id ? (
                        <input
                          className="w-full rounded-md border border-borderSoft bg-surface px-2 py-1"
                          list="queue-jobtype-presets"
                          value={inlineEditForm.jobType}
                          onChange={(event) => setInlineEditForm((prev) => ({ ...prev, jobType: event.target.value }))}
                        />
                      ) : (
                        item.jobType
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editingId === item.id ? (
                        <input
                          type="number"
                          min={1}
                          className="w-24 rounded-md border border-borderSoft bg-surface px-2 py-1"
                          value={inlineEditForm.pageCount}
                          onChange={(event) => setInlineEditForm((prev) => ({ ...prev, pageCount: event.target.value }))}
                        />
                      ) : (
                        item.pageCount
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`status-chip ${item.status}`}>
                        {item.status === "waiting" ? "รอคิว" : item.status === "printing" ? "กำลังทำ" : "เสร็จแล้ว"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-textSecondary">{item.note || "-"}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-center gap-1">
                        {editingId === item.id ? (
                          <>
                            <button type="button" onClick={() => saveInlineEdit(item)} className="rounded-md border border-borderSoft p-1.5 text-green-700" title="บันทึก">
                              <Save size={14} />
                            </button>
                            <button type="button" onClick={cancelInlineEdit} className="rounded-md border border-borderSoft p-1.5" title="ยกเลิกแก้ไข">
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <button type="button" onClick={() => startInlineEdit(item)} className="rounded-md border border-borderSoft p-1.5" title="แก้ไขข้อมูลแถว">
                            <Pencil size={14} />
                          </button>
                        )}
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

      {mutating ? <p className="mt-3 text-xs text-textSecondary">กำลังบันทึกการเปลี่ยนแปลง...</p> : null}
    </AppShell>
  );
}
