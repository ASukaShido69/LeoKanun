export type EventCategory = "freelance" | "meeting" | "personal" | "deadline" | "other";
export type EventStatus = "upcoming" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "urgent" | "high" | "medium" | "low";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  start_datetime: string;
  end_datetime?: string | null;
  status: EventStatus;
}

export interface TaskItem {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string | null;
}