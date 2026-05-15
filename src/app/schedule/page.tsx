"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useAppSettings } from "@/components/providers/settings-provider";
import { useRealtimeEvents } from "@/lib/use-realtime-data";
import { AddEventModal, type EventFormData } from "@/components/ui/add-event-modal";

export default function SchedulePage() {
  const { settings } = useAppSettings();
  const { events, loading, error, refetch } = useRealtimeEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventsByDate = events.reduce(
    (acc, event) => {
      const date = event.start_datetime?.split("T")[0] || "unknown";
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    },
    {} as Record<string, typeof events>
  );

  const handleAddEvent = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      const startDateTime = `${data.startDate}T${data.startTime || "00:00"}:00`;
      const endDateTime = data.endDate
        ? `${data.endDate}T${data.endTime || "00:00"}:00`
        : startDateTime;

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          category: data.category,
          start_datetime: startDateTime,
          end_datetime: endDateTime,
          is_all_day: data.isAllDay,
          status: data.status
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        await refetch?.();
      } else {
        const error = await response.json();
        alert(`ผิดพลาด: ${error.error}`);
      }
    } catch (err) {
      console.error("Error adding event:", err);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{settings.app.name} {settings.schedule.title}</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary font-semibold"
        >
          {settings.schedule.addButton}
        </button>
      </div>
      <section className="card p-4">
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        {loading ? (
          <p className="text-sm text-textSecondary">กำลังโหลดปฏิทิน...</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-textSecondary">{settings.schedule.emptyState}</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(eventsByDate)
              .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
              .map(([date, dateEvents]) => (
                <div key={date}>
                  <h3 className="mb-2 font-semibold text-textPrimary">
                    {new Date(date + "T00:00:00").toLocaleDateString("th-TH", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </h3>
                  <div className="space-y-2 border-l-2 border-borderSoft pl-3">
                    {dateEvents.map((event) => (
                      <div key={event.id} className="rounded-lg bg-surface-2 p-3">
                        <p className="font-semibold text-textPrimary">{event.title}</p>
                        <p className="text-xs text-textSecondary">
                          {event.is_all_day
                            ? "ทั้งวัน"
                            : `${new Date(event.start_datetime).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`}
                        </p>
                        <div className="mt-1 inline-block rounded-full bg-primary/20 px-2 py-1">
                          <span className="text-[10px] font-semibold text-primary">{event.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddEvent}
        isLoading={isSubmitting}
      />
    </AppShell>
  );
}