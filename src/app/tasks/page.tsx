"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useAppSettings } from "@/components/providers/settings-provider";
import { AddTaskModal, type TaskFormData } from "@/components/ui/add-task-modal";
import { Check, Trash2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  due_date?: string;
}

export default function TasksPage() {
  const { settings } = useAppSettings();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (err) {
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          priority: data.priority,
          due_date: data.dueDate || null,
          status: data.status
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        await loadTasks();
      } else {
        const error = await response.json();
        alert(`ผิดพลาด: ${error.error}`);
      }
    } catch (err) {
      console.error("Error adding task:", err);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" })
      });

      if (response.ok) {
        await loadTasks();
      }
    } catch (err) {
      console.error("Error completing task:", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("คุณแน่ใจหรือว่าต้องการลบงานนี้?")) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (response.ok) {
        await loadTasks();
      }
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const tasksByStatus = tasks.reduce(
    (acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  const priorityColors = {
    urgent: "bg-red-500/10 text-red-500 border-red-200",
    high: "bg-orange-500/10 text-orange-500 border-orange-200",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-200",
    low: "bg-green-500/10 text-green-500 border-green-200"
  };

  const statusLabels = {
    todo: "ต้องทำ",
    in_progress: "กำลังทำ",
    done: "เสร็จแล้ว"
  };

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{settings.app.name} {settings.tasks.title}</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary font-semibold"
        >
          {settings.tasks.addButton}
        </button>
      </div>

      {loading ? (
        <section className="card p-4">
          <p className="text-sm text-textSecondary">กำลังโหลด...</p>
        </section>
      ) : tasks.length === 0 ? (
        <section className="card p-4">
          <p className="text-sm text-textSecondary">{settings.tasks.emptyState}</p>
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {["todo", "in_progress", "done"].map((status) => (
            <div key={status} className="card p-4">
              <h2 className="mb-3 font-semibold text-textPrimary">
                {statusLabels[status as keyof typeof statusLabels]} ({tasksByStatus[status]?.length || 0})
              </h2>
              <div className="space-y-2">
                {tasksByStatus[status]?.map((task) => (
                  <div key={task.id} className="rounded-lg border border-borderSoft bg-surface-2 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className={`font-semibold ${status === "done" ? "line-through text-textSecondary" : "text-textPrimary"}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="mt-1 text-xs text-textSecondary">{task.description}</p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${priorityColors[task.priority as keyof typeof priorityColors]}`}
                          >
                            {task.priority}
                          </span>
                          {task.due_date && (
                            <span className="text-[10px] text-textSecondary">
                              ครบกำหนด: {new Date(task.due_date).toLocaleDateString("th-TH")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {status !== "done" && (
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            className="rounded-md p-1.5 hover:bg-surface transition-colors"
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="rounded-md p-1.5 hover:bg-surface transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTask}
        isLoading={isSubmitting}
      />
    </AppShell>
  );
}