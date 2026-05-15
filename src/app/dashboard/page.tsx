"use client";

import { useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useAppSettings } from "@/components/providers/settings-provider";
import { useRealtimeQueue, useRealtimeTransactions, QueueData, TransactionData } from "@/lib/use-realtime-data";

function statusBadge(status: QueueData["status"]) {
  if (status === "waiting") {
    return { label: "⏳ รอคิว", className: "status-chip waiting" };
  }
  if (status === "printing") {
    return { label: "🖨️ กำลังทำ", className: "status-chip printing" };
  }
  return { label: "✅ เสร็จแล้ว", className: "status-chip done" };
}

export default function DashboardPage() {
  const { settings } = useAppSettings();
  const { queueItems, loading: queueLoading } = useRealtimeQueue();
  const { transactions, loading: transLoading } = useRealtimeTransactions();

  const latestQueue = useMemo(() => queueItems.slice(0, 10), [queueItems]);
  const latestTransactions = useMemo(() => transactions.slice(0, 10), [transactions]);

  const insights = useMemo(() => {
    const waitingCount = queueItems.filter((item) => item.status === "waiting").length;
    const printingCount = queueItems.filter((item) => item.status === "printing").length;
    const doneCount = queueItems.filter((item) => item.status === "done").length;

    const today = new Date().toISOString().split("T")[0];
    const todayTransactions = transactions.filter((t) => t.date === today);
    const incomeToday = todayTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expenseToday = todayTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

    const jobTypeCounts = queueItems.reduce<Record<string, number>>((acc, item) => {
      acc[item.job_type] = (acc[item.job_type] || 0) + 1;
      return acc;
    }, {});
    const topJobType = Object.entries(jobTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    const expenseCategoryCounts = transactions
      .filter((t) => t.type === "expense")
      .reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
    const topExpenseCategory = Object.entries(expenseCategoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    return {
      waitingCount,
      printingCount,
      doneCount,
      incomeToday,
      expenseToday,
      netToday: incomeToday - expenseToday,
      topJobType,
      topExpenseCategory
    };
  }, [queueItems, transactions]);

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-bold">{settings.app.name} {settings.dashboard.title}</h1>
      <section className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="card p-3">
          <p className="text-xs text-textSecondary">⚡ สถานะคิวตอนนี้</p>
          <p className="mt-1 text-sm font-semibold">รอ {insights.waitingCount} • ทำ {insights.printingCount} • เสร็จ {insights.doneCount}</p>
        </article>
        <article className="card p-3">
          <p className="text-xs text-textSecondary">📌 ประเภทงานยอดนิยม</p>
          <p className="mt-1 text-sm font-semibold">{insights.topJobType}</p>
        </article>
        <article className="card p-3">
          <p className="text-xs text-textSecondary">🧾 หมวดรายจ่ายสูงสุด</p>
          <p className="mt-1 text-sm font-semibold">{insights.topExpenseCategory}</p>
        </article>
        <article className="card p-3">
          <p className="text-xs text-textSecondary">💡 สุทธิวันนี้</p>
          <p className={`mt-1 text-sm font-bold ${insights.netToday >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
            ฿{Math.abs(insights.netToday).toLocaleString("th-TH", { minimumFractionDigits: 2 })} {insights.netToday >= 0 ? "(บวก)" : "(ลบ)"}
          </p>
        </article>
      </section>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="card p-4">
          <h2 className="text-lg font-semibold">📋 ตารางคิวงาน</h2>
          <p className="mt-1 text-sm text-textSecondary">โหมดใช้งานหน้าร้าน: เห็นคิวล่าสุดชัดเจนและอ่านง่าย</p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-borderSoft">
            <table className="min-w-full text-sm">
              <thead className="bg-surface-2 text-left">
                <tr>
                  <th className="px-3 py-2 font-semibold">🔢 คิว</th>
                  <th className="px-3 py-2 font-semibold">👤 ลูกค้า</th>
                  <th className="px-3 py-2 font-semibold">🧩 ประเภทงาน</th>
                  <th className="px-3 py-2 font-semibold">📄 หน้า</th>
                  <th className="px-3 py-2 font-semibold">🚦 สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {queueLoading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-textSecondary">กำลังโหลดคิวงาน...</td>
                  </tr>
                ) : latestQueue.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-textSecondary">ยังไม่มีคิวงาน</td>
                  </tr>
                ) : (
                  latestQueue.map((item) => {
                    const badge = statusBadge(item.status);
                    return (
                      <tr key={item.id} className="border-t border-borderSoft/70">
                        <td className="px-3 py-2 font-bold">#{item.queue_no}</td>
                        <td className="px-3 py-2">{item.client_name}</td>
                        <td className="px-3 py-2">{item.job_type}</td>
                        <td className="px-3 py-2">{item.page_count}</td>
                        <td className="px-3 py-2">
                          <span className={badge.className}>{badge.label}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card p-4">
          <h2 className="text-lg font-semibold">💸 ตารางรายรับรายจ่าย</h2>
          <p className="mt-1 text-sm text-textSecondary">สรุปรายการการเงินล่าสุดของร้าน</p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-borderSoft">
            <table className="min-w-full text-sm">
              <thead className="bg-surface-2 text-left">
                <tr>
                  <th className="px-3 py-2 font-semibold">🗓️ วันที่</th>
                  <th className="px-3 py-2 font-semibold">🏷️ หมวดหมู่</th>
                  <th className="px-3 py-2 font-semibold">🔁 ประเภท</th>
                  <th className="px-3 py-2 text-right font-semibold">💰 จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody>
                {transLoading ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-textSecondary">กำลังโหลดรายการ...</td>
                  </tr>
                ) : latestTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-textSecondary">ยังไม่มีรายการรายรับรายจ่าย</td>
                  </tr>
                ) : (
                  latestTransactions.map((trans: TransactionData) => (
                    <tr key={trans.id} className="border-t border-borderSoft/70">
                      <td className="px-3 py-2">{new Date(trans.date).toLocaleDateString("th-TH")}</td>
                      <td className="px-3 py-2">{trans.category}</td>
                      <td className="px-3 py-2">{trans.type === "income" ? "📈 รายรับ" : "📉 รายจ่าย"}</td>
                      <td className={`px-3 py-2 text-right font-bold ${trans.type === "income" ? "text-emerald-500" : "text-rose-500"}`}>
                        {trans.type === "income" ? "+" : "-"}฿{Math.abs(trans.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </AppShell>
  );
}