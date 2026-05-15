"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { useAppSettings } from "@/components/providers/settings-provider";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
}

export function AddTaskModal({ isOpen, onClose, onSubmit, isLoading }: AddTaskModalProps) {
  const { settings } = useAppSettings();
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    dueDate: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      title: "",
      description: "",
      dueDate: ""
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={settings.tasks.modal.title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-textPrimary">
            {settings.tasks.modal.taskTitle}
          </label>
          <input
            type="text"
            required
            placeholder={settings.tasks.modal.taskTitlePlaceholder}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 w-full rounded-md border border-borderSoft bg-surface-2 px-3 py-2 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-textPrimary">
            {settings.tasks.modal.description}
          </label>
          <textarea
            placeholder={settings.tasks.modal.descriptionPlaceholder}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-md border border-borderSoft bg-surface-2 px-3 py-2 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-textPrimary">
            {settings.tasks.modal.dueDate}
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="mt-1 w-full rounded-md border border-borderSoft bg-surface-2 px-3 py-2 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-borderSoft px-4 py-2 text-sm font-medium text-textPrimary hover:bg-surface-2 transition-colors"
          >
            {settings.tasks.modal.cancel}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "กำลังบันทึก..." : settings.tasks.modal.save}
          </button>
        </div>
      </form>
    </Modal>
  );
}
