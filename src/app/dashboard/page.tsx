"use client";

import { useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useAppSettings } from "@/components/providers/settings-provider";
import { useRealtimeEvents, useRealtimeTransactions, useRealtimeJobs, EventData, TransactionData, JobData } from "@/lib/use-realtime-data";

function Widget({ title, value }: { title: string; value: string }) {
  return (
    <article className="card p-4">
      <p className="text-sm text-textSecondary">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </article>
  );
}

export default function DashboardPage() {
  const { settings } = useAppSettings();
  const { events, loading: eventsLoading } = useRealtimeEvents();
  const { transactions, loading: transLoading } = useRealtimeTransactions();
  const { jobs, loading: jobsLoading } = useRealtimeJobs();

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    const todayEvents = events.filter((e: EventData) => e.start_datetime?.startsWith(today)).length;
    const pendingJobs = jobs.filter((j: JobData) => j.status === "pending").length;
    const monthlyIncome = transactions
      .filter((t: TransactionData) => t.date?.startsWith(thisMonth) && t.type === "income")
      .reduce((sum, t: TransactionData) => sum + (t.amount || 0), 0);
    const nearDeadlineJobs = jobs.length; // placeholder

    return {
      todayQueue: todayEvents.toString(),
      pendingTask: pendingJobs.toString(),
      monthlyIncome: `฿${monthlyIncome.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`,
      nearDeadline: nearDeadlineJobs.toString()
    };
  }, [events, jobs, transactions]);

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-bold">{settings.app.name} {settings.dashboard.title}</h1>
      <section className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Widget
          title={settings.dashboard.cards.todayQueueTitle}
          value={eventsLoading ? "..." : `${stats.todayQueue} รายการ`}
        />
        <Widget title={settings.dashboard.cards.pendingTaskTitle} value={jobsLoading ? "..." : `${stats.pendingTask} งาน`} />
        <Widget
          title={settings.dashboard.cards.monthlyIncomeTitle}
          value={transLoading ? "..." : stats.monthlyIncome}
        />
        <Widget title={settings.dashboard.cards.nearDeadlineTitle} value={jobsLoading ? "..." : `${stats.nearDeadline} งาน`} />
      </section>
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <article className="card p-4 lg:col-span-2">
          <h2 className="text-lg font-semibold">{settings.dashboard.miniCalendarTitle}</h2>
          <p className="mt-2 text-sm text-textSecondary">{settings.dashboard.miniCalendarHint}</p>
          <div className="mt-4 space-y-2">
            {eventsLoading ? (
              <p className="text-xs text-textSecondary">กำลังโหลดงาน...</p>
            ) : (
              events.slice(0, 5).map((event) => (
                <div key={event.id} className="rounded-lg border border-borderSoft p-2">
                  <p className="text-xs font-semibold">{event.title}</p>
                  <p className="text-[10px] text-textSecondary">{new Date(event.start_datetime).toLocaleDateString("th-TH")}</p>
                </div>
              ))
            )}
          </div>
        </article>
        <article className="card p-4 lg:col-span-3">
          <h2 className="text-lg font-semibold">{settings.dashboard.incomeExpenseTitle}</h2>
          <p className="mt-2 text-sm text-textSecondary">{settings.dashboard.incomeExpenseHint}</p>
          <div className="mt-4 space-y-2">
            {transLoading ? (
              <p className="text-xs text-textSecondary">กำลังโหลดรายการ...</p>
            ) : (
              transactions.slice(0, 5).map((trans) => (
                <div key={trans.id} className="flex items-center justify-between rounded-lg border border-borderSoft p-2">
                  <div className="text-xs">
                    <p className="font-semibold">{trans.category}</p>
                    <p className="text-[10px] text-textSecondary">{trans.date}</p>
                  </div>
                  <p className={`text-xs font-bold ${trans.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {trans.type === "income" ? "+" : "-"}฿{Math.abs(trans.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </AppShell>
  );
}