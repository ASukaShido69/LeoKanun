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
  const { settings, saveSettings } = useAppSettings();
  const expenseCategories = settings.financePresets.expenseCategories;
  const incomeCategories = settings.financePresets.incomeCategories;
  const [presetSaving, setPresetSaving] = useState(false);
  const [presetMessage, setPresetMessage] = useState("");

  const [formData, setFormData] = useState<FinanceFormData>({
    type: "expense",
    amount: 0,
    category: expenseCategories[0] ?? "",
    description: "",
    date: new Date().toISOString().split("T")[0]
  });

  const categories = formData.type === "expense" ? expenseCategories : incomeCategories;

  useEffect(() => {
    if (!categories.includes(formData.category)) {
      setFormData((prev) => ({ ...prev, category: categories[0] ?? "" }));
    }
  }, [categories, formData.category]);

  const addFavoriteCategory = async () => {
    const nextCategory = formData.category.trim();
    if (!nextCategory) {
      setPresetMessage("กรอกหมวดหมู่ก่อน แล้วค่อยเพิ่มเป็นรายการโปรด");
      return;
    }

    const source = formData.type === "income" ? incomeCategories : expenseCategories;
    if (source.some((item) => item.toLowerCase() === nextCategory.toLowerCase())) {
      setPresetMessage("หมวดหมู่นี้มีในรายการโปรดแล้ว");
      return;
    }

    setPresetSaving(true);
    setPresetMessage("");
    try {
      if (formData.type === "income") {
        await saveSettings({
          ...settings,
          financePresets: {
            ...settings.financePresets,
            incomeCategories: [...incomeCategories, nextCategory]
          }
        });
      } else {
        await saveSettings({
          ...settings,
          financePresets: {
            ...settings.financePresets,
            expenseCategories: [...expenseCategories, nextCategory]
          }
        });
      }
      setPresetMessage(`เพิ่ม \"${nextCategory}\" ในรายการโปรดแล้ว`);
    } catch {
      setPresetMessage("เพิ่มรายการโปรดไม่สำเร็จ");
    } finally {
      setPresetSaving(false);
    }
  };

  const removeFavoriteCategory = async (categoryToRemove: string) => {
    setPresetSaving(true);
    setPresetMessage("");
    try {
      if (formData.type === "income") {
        await saveSettings({
          ...settings,
          financePresets: {
            ...settings.financePresets,
            incomeCategories: incomeCategories.filter((item) => item !== categoryToRemove)
          }
        });
      } else {
        await saveSettings({
          ...settings,
          financePresets: {
            ...settings.financePresets,
            expenseCategories: expenseCategories.filter((item) => item !== categoryToRemove)
          }
        });
      }
      setPresetMessage(`ลบ \"${categoryToRemove}\" ออกจากรายการโปรดแล้ว`);
    } catch {
      setPresetMessage("ลบรายการโปรดไม่สำเร็จ");
    } finally {
      setPresetSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category.trim()) {
      setPresetMessage("กรุณาระบุหมวดหมู่");
      return;
    }

    await onSubmit(formData);
    setFormData({
      type: "expense",
      amount: 0,
      category: settings.financePresets.expenseCategories[0] ?? "",
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
          <div className="mt-1 flex items-center gap-2">
            <input
              list="finance-category-presets"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="พิมพ์หรือเลือกหมวดหมู่"
              className="w-full rounded-md border border-borderSoft bg-surface-2 px-3 py-2 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={addFavoriteCategory}
              disabled={presetSaving}
              className="rounded-md border border-borderSoft px-3 py-2 text-xs font-semibold text-amber-600 disabled:opacity-50"
            >
              +โปรด
            </button>
          </div>
          <datalist id="finance-category-presets">
            {categories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.length === 0 ? <span className="text-xs text-textSecondary">ยังไม่มีหมวดหมู่โปรด</span> : null}
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-borderSoft px-2 py-1 text-xs"
                onClick={() => setFormData((prev) => ({ ...prev, category: cat }))}
              >
                {cat}
                <span
                  className="rounded-full px-1 text-red-500 hover:bg-red-50"
                  onClick={(event) => {
                    event.stopPropagation();
                    void removeFavoriteCategory(cat);
                  }}
                >
                  ×
                </span>
              </button>
            ))}
          </div>
          {presetMessage ? <p className="mt-2 text-xs text-textSecondary">{presetMessage}</p> : null}
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
