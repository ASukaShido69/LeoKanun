// Updated app settings interface with modal support
export interface AppSettings {
  app: {
    name: string;
    description: string;
    language: string;
  };
  sidebar: {
    dashboard: string;
    queue: string;
    tasks: string;
    finance: string;
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
    incomeExpenseTitle: string;
    incomeExpenseHint: string;
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
      dueDate: string;
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
  queuePresets: {
    jobTypes: string[];
  };
  financePresets: {
    incomeCategories: string[];
    expenseCategories: string[];
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
    webhookUrl: string;
  };
  upload: {
    provider: string;
  };
}