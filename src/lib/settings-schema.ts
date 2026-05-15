import { z } from "zod";

export const appSettingsSchema = z.object({
  app: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    language: z.string().min(2)
  }),
  sidebar: z.object({
    dashboard: z.string().min(1),
    schedule: z.string().min(1),
    tasks: z.string().min(1),
    finance: z.string().min(1),
    clients: z.string().min(1),
    settings: z.string().min(1)
  }),
  topbar: z.object({
    greeting: z.string().min(1),
    timePrefix: z.string().min(1),
    timeSuffix: z.string().min(1)
  }),
  login: z.object({
    title: z.string().min(1),
    emailLabel: z.string().min(1),
    emailPlaceholder: z.string().min(1),
    passwordLabel: z.string().min(1),
    passwordPlaceholder: z.string().min(1),
    submitLabel: z.string().min(1)
  }),
  dashboard: z.object({
    title: z.string().min(1),
    cards: z.object({
      todayQueueTitle: z.string().min(1),
      todayQueueValue: z.string().min(1),
      pendingTaskTitle: z.string().min(1),
      pendingTaskValue: z.string().min(1),
      monthlyIncomeTitle: z.string().min(1),
      monthlyIncomeValue: z.string().min(1),
      nearDeadlineTitle: z.string().min(1),
      nearDeadlineValue: z.string().min(1)
    }),
    miniCalendarTitle: z.string().min(1),
    miniCalendarHint: z.string().min(1),
    incomeExpenseTitle: z.string().min(1),
    incomeExpenseHint: z.string().min(1)
  }),
  schedule: z.object({
    title: z.string().min(1),
    addButton: z.string().min(1),
    emptyState: z.string().min(1),
    modal: z.object({
      title: z.string().min(1),
      eventTitle: z.string().min(1),
      eventTitlePlaceholder: z.string().min(1),
      startDate: z.string().min(1),
      startTime: z.string().min(1),
      endDate: z.string().min(1),
      endTime: z.string().min(1),
      category: z.string().min(1),
      status: z.string().min(1),
      isAllDay: z.string().min(1),
      save: z.string().min(1),
      cancel: z.string().min(1)
    })
  }),
  tasks: z.object({
    title: z.string().min(1),
    addButton: z.string().min(1),
    emptyState: z.string().min(1),
    modal: z.object({
      title: z.string().min(1),
      taskTitle: z.string().min(1),
      taskTitlePlaceholder: z.string().min(1),
      description: z.string().min(1),
      descriptionPlaceholder: z.string().min(1),
      priority: z.string().min(1),
      dueDate: z.string().min(1),
      status: z.string().min(1),
      save: z.string().min(1),
      cancel: z.string().min(1)
    })
  }),
  finance: z.object({
    title: z.string().min(1),
    addButton: z.string().min(1),
    emptyState: z.string().min(1),
    modal: z.object({
      title: z.string().min(1),
      type: z.string().min(1),
      amount: z.string().min(1),
      amountPlaceholder: z.string().min(1),
      category: z.string().min(1),
      description: z.string().min(1),
      descriptionPlaceholder: z.string().min(1),
      date: z.string().min(1),
      save: z.string().min(1),
      cancel: z.string().min(1)
    })
  }),
  clients: z.object({
    title: z.string().min(1),
    hint: z.string().min(1)
  }),
  settingsPage: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    textareaLabel: z.string().min(1),
    saveButton: z.string().min(1),
    resetButton: z.string().min(1),
    successMessage: z.string().min(1),
    invalidJsonMessage: z.string().min(1)
  }),
  line: z.object({
    morningTitle: z.string().min(1),
    eventCreatedTitle: z.string().min(1),
    weeklyTitle: z.string().min(1)
  }),
  upload: z.object({
    provider: z.literal("imgbb")
  })
});

export type AppSettingsSchema = z.infer<typeof appSettingsSchema>;