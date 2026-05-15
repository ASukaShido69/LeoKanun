"use client";

import { useEffect, useState } from "react";
import { Modal } from "./modal";
import { useAppSettings } from "@/components/providers/settings-provider";

interface AddFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FinanceFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface FinanceFormData {
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
}

export function AddFinanceModal({ isOpen, onClose, onSubmit, isLoading }: AddFinanceModalProps) {
  const { settings } = useAppSettings();
  const expenseCategories = settings.financePresets.expenseCategories.length
    ? settings.financePresets.expenseCategories
    : ["ค่าใช้จ่ายอื่น ๆ"];
  const incomeCategories = settings.financePresets.incomeCategories.length
    ? settings.financePresets.incomeCategories
    : ["รายรับอื่น ๆ"];

  const [formData, setFormData] = useState<FinanceFormData>({
    type: "expense",
    amount: 0,
    category: expenseCategories[0],
    description: "",
    date: new Date().toISOString().split("T")[0]
  });

  const categories = formData.type === "expense" ? expenseCategories : incomeCategories;

  useEffect(() => {
    if (!categories.includes(formData.category)) {
      setFormData((prev) => ({ ...prev, category: categories[0] }));
    }
  }, [categories, formData.category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      type: "expense",
      amount: 0,
      category: expenseCategories[0],
      description: "",
      date: new Date().toISOString().split("T")[0]
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={settings.finance.modal.title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-textPrimary">
              {settings.finance.modal.type}
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as "income" | "expense",
                  category: e.target.value === "income" ? incomeCategories[0] : expenseCategories[0]
                })
              }
              className="mt-1 w-full rounded-md border border-borderSoft bg-surface-2 px-3 py-2 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="expense">ค่าใช้จ่าย</option>
              <option value="income">รายรับ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-textPrimary">
              {settings.finance.modal.amount}
            </label>
            <input
              type="number"
              required
              placeholder={settings.finance.modal.amountPlaceholder}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              step="0.01"
              min="0"
              className="mt-1 w-full rounded-md border border-borderSoft bg-surface-2 px-3 py-2 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-textPrimary">
            {settings.finance.modal.category}
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
            {settings.finance.modal.description}
          </label>
          <textarea
            placeholder={settings.finance.modal.descriptionPlaceholder}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded-md border border-borderSoft bg-surface-2 px-3 py-2 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-textPrimary">
            {settings.finance.modal.date}
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="mt-1 w-full rounded-md border border-borderSoft bg-surface-2 px-3 py-2 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-borderSoft px-4 py-2 text-sm font-medium text-textPrimary hover:bg-surface-2 transition-colors"
          >
            {settings.finance.modal.cancel}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "กำลังบันทึก..." : settings.finance.modal.save}
          </button>
        </div>
      </form>
    </Modal>
  );
}
