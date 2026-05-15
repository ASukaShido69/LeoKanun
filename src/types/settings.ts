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
    hint: string;
  };
  tasks: {
    title: string;
    hint: string;
  };
  finance: {
    title: string;
    hint: string;
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