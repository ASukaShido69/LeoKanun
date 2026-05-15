"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useAppSettings } from "@/components/providers/settings-provider";
import { AddFinanceModal, type FinanceFormData } from "@/components/ui/add-finance-modal";
import { Trash2 } from "lucide-react";

interface FinanceEntry {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description?: string;
  date: string;
}

export default function FinancePage() {
  const { settings } = useAppSettings();
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const response = await fetch("/api/finance", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (err) {
      console.error("Error loading finance entries:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (data: FinanceFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: data.type,
          amount: data.amount,
          category: data.category,
          description: data.description,
          date: data.date
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        await loadEntries();
      } else {
        const error = await response.json();
        alert(`ผิดพลาด: ${error.error}`);
      }
    } catch (err) {
      console.error("Error adding entry:", err);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("คุณแน่ใจหรือว่าต้องการลบรายการนี้?")) return;

    try {
      const response = await fetch(`/api/finance/${entryId}`, { method: "DELETE" });
      if (response.ok) {
        await loadEntries();
      }
    } catch (err) {
      console.error("Error deleting entry:", err);
    }
  };

  const totalIncome = entries
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = entries
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);

  const netIncome = totalIncome - totalExpense;

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <AppShell>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">{settings.app.name} {settings.finance.title}</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary w-full font-semibold sm:w-auto"
        >
          {settings.finance.addButton}
        </button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="card p-4">
          <p className="text-sm text-textSecondary">รายรับ</p>
          <p className="mt-2 text-2xl font-bold text-green-500">
            ฿{totalIncome.toFixed(2)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-textSecondary">ค่าใช้จ่าย</p>
          <p className="mt-2 text-2xl font-bold text-red-500">
            ฿{totalExpense.toFixed(2)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-textSecondary">คงเหลือ</p>
          <p className={`mt-2 text-2xl font-bold ${netIncome >= 0 ? "text-blue-500" : "text-orange-500"}`}>
            ฿{netIncome.toFixed(2)}
          </p>
        </div>
      </div>

      {loading ? (
        <section className="card p-4">
          <p className="text-sm text-textSecondary">กำลังโหลด...</p>
        </section>
      ) : entries.length === 0 ? (
        <section className="card p-4">
          <p className="text-sm text-textSecondary">{settings.finance.emptyState}</p>
        </section>
      ) : (
        <section className="card">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-borderSoft">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">
                    วันที่
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">
                    รายการ
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">
                    หมวดหมู่
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-textPrimary">
                    จำนวนเงิน
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-textPrimary">
                    ประเภท
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-textPrimary">
                    ลบ
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-borderSoft hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-3 text-sm text-textPrimary">
                      {new Date(entry.date).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-4 py-3 text-sm text-textPrimary">
                      <div>
                        <p className="font-semibold">{entry.description || "-"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-textSecondary">
                      {entry.category}
                    </td>
                    <td className={`px-4 py-3 text-right text-sm font-semibold ${entry.type === "income" ? "text-green-500" : "text-red-500"}`}>
                      {entry.type === "income" ? "+" : "-"}฿{entry.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-textSecondary">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${entry.type === "income" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                        {entry.type === "income" ? "รายรับ" : "ค่าใช้จ่าย"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="rounded-md p-1.5 hover:bg-surface transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {sortedEntries.map((entry) => (
              <article key={entry.id} className="rounded-2xl border border-borderSoft bg-surface/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-textSecondary">{new Date(entry.date).toLocaleDateString("th-TH")}</p>
                    <p className="mt-1 font-semibold text-textPrimary">{entry.description || "-"}</p>
                    <p className="mt-1 text-sm text-textSecondary">🏷️ {entry.category}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="rounded-md p-1.5 hover:bg-surface transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${entry.type === "income" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                    {entry.type === "income" ? "รายรับ" : "ค่าใช้จ่าย"}
                  </span>
                  <p className={`text-sm font-semibold ${entry.type === "income" ? "text-green-500" : "text-red-500"}`}>
                    {entry.type === "income" ? "+" : "-"}฿{entry.amount.toFixed(2)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <AddFinanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddEntry}
        isLoading={isSubmitting}
      />
    </AppShell>
  );
}