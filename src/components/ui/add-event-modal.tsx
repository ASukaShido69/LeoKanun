"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { useAppSettings } from "@/components/providers/settings-provider";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface EventFormData {
  title: string;
  category: string;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  isAllDay: boolean;
  status: string;
}

const categories = ["freelance", "meeting", "personal", "deadline", "other"];
const statuses = ["upcoming", "in_progress", "done", "cancelled"];

export function AddEventModal({ isOpen, onClose, onSubmit, isLoading }: AddEventModalProps) {
  const { settings } = useAppSettings();
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    category: "freelance",
    startDate: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endDate: "",
    endTime: "10:00",
    isAllDay: false,
    status: "upcoming"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      title: "",
      category: "freelance",
      startDate: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endDate: "",
      endTime: "10:00",
      isAllDay: false,
      status: "upcoming"
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={settings.schedule.modal.title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-textPrimary">
            {settings.schedule.modal.eventTitle}
          </label>
          <input
            type="text"
            required
            placeholder={settings.schedule.modal.eventTitlePlaceholder}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 w-full rounded-md border border-borderSoft bg-surface-2 px-3 py-2 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-textPrimary">
              {settings.schedule.modal.category}
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 w-full rounded-md border border-borderSoft bg-surface-2 px-3 py-2 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-textPrimary">
              {settings.schedule.modal.status}
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="mt-1 w-full rounded-md border border-borderSoft bg-surface-2 px-3 py-2 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isAllDay"
            checked={formData.isAllDay}
            onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
            className="h-4 w-4 rounded border-borderSoft"
          />
          <label htmlFor="isAllDay" className="text-sm font-medium text-textPrimary">
            {settings.schedule.modal.isAllDay}
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-textPrimary">
              {settings.schedule.modal.startDate}
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="mt-1 w-full rounded-md border border-borderSoft bg-surface-2 px-3 py-2 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {!formData.isAllDay && (
            <div>
              <label className="block text-sm font-medium text-textPrimary">
                {settings.schedule.modal.startTime}
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="mt-1 w-full rounded-md border border-borderSoft bg-surface-2 px-3 py-2 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-textPrimary">
              {settings.schedule.modal.endDate}
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="mt-1 w-full rounded-md border border-borderSoft bg-surface-2 px-3 py-2 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {!formData.isAllDay && (
            <div>
              <label className="block text-sm font-medium text-textPrimary">
                {settings.schedule.modal.endTime}
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="mt-1 w-full rounded-md border border-borderSoft bg-surface-2 px-3 py-2 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-borderSoft px-4 py-2 text-sm font-medium text-textPrimary hover:bg-surface-2 transition-colors"
          >
            {settings.schedule.modal.cancel}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "กำลังบันทึก..." : settings.schedule.modal.save}
          </button>
        </div>
      </form>
    </Modal>
  );
}
