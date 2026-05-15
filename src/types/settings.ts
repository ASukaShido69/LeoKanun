// Updated app settings interface with modal support
export interface AppSettings {
  app: {
    name: string;
    description: string;
    language: string;
  };
  sidebar: {
    dashboard: string;
    schedule: string;
    tasks: string;
    finance: string;
    clients: string;
    settings: string;
  };
  topbar: {
    greeting: string;
    timePrefix: string;
    timeSuffix: string;
  };
  login: {
    title: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    submitLabel: string;
  };
  dashboard: {
    title: string;
    cards: {
      todayQueueTitle: string;
      todayQueueValue: string;
      pendingTaskTitle: string;
      pendingTaskValue: string;
      monthlyIncomeTitle: string;
      monthlyIncomeValue: string;
      nearDeadlineTitle: string;
      nearDeadlineValue: string;
    };
    miniCalendarTitle: string;
    miniCalendarHint: string;
    incomeExpenseTitle: string;
    incomeExpenseHint: string;
  };
  schedule: {
    title: string;
    addButton: string;
    emptyState: string;
    modal: {
      title: string;
      eventTitle: string;
      eventTitlePlaceholder: string;
      startDate: string;
      startTime: string;
      endDate: string;
      endTime: string;
      category: string;
      status: string;
      isAllDay: string;
      save: string;
      cancel: string;
    };
  };
  tasks: {
    title: string;
    addButton: string;
    emptyState: string;
    modal: {
      title: string;
      taskTitle: string;
      taskTitlePlaceholder: string;
      description: string;
      descriptionPlaceholder: string;
      priority: string;
      dueDate: string;
      status: string;
      save: string;
      cancel: string;
    };
  };
  finance: {
    title: string;
    addButton: string;
    emptyState: string;
    modal: {
      title: string;
      type: string;
      amount: string;
      amountPlaceholder: string;
      category: string;
      description: string;
      descriptionPlaceholder: string;
      date: string;
      save: string;
      cancel: string;
    };
  };
  clients: {
    title: string;
    hint: string;
  };
  settingsPage: {
    title: string;
    description: string;
    textareaLabel: string;
    saveButton: string;
    resetButton: string;
    successMessage: string;
    invalidJsonMessage: string;
  };
  line: {
    morningTitle: string;
    eventCreatedTitle: string;
    weeklyTitle: string;
  };
  upload: {
    provider: string;
  };
}