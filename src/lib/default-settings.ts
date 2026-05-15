import type { AppSettings } from "@/types/settings";

export const DEFAULT_SETTINGS: AppSettings = {
  app: {
    name: "LeoKanun",
    description: "Personal dashboard for freelance life",
    language: "th"
  },
  sidebar: {
    dashboard: "Dashboard",
    schedule: "Schedule",
    tasks: "Tasks",
    finance: "Finance",
    clients: "Clients",
    settings: "Settings"
  },
  topbar: {
    greeting: "สวัสดี",
    timePrefix: "เวลา",
    timeSuffix: "น."
  },
  login: {
    title: "เข้าสู่ระบบ",
    emailLabel: "อีเมล",
    emailPlaceholder: "name@email.com",
    passwordLabel: "รหัสผ่าน",
    passwordPlaceholder: "********",
    submitLabel: "เข้าสู่ระบบ"
  },
  dashboard: {
    title: "Dashboard",
    cards: {
      todayQueueTitle: "คิวงานวันนี้",
      todayQueueValue: "0 รายการ",
      pendingTaskTitle: "Task ค้างอยู่",
      pendingTaskValue: "0 งาน",
      monthlyIncomeTitle: "รายได้เดือนนี้",
      monthlyIncomeValue: "฿0.00",
      nearDeadlineTitle: "งานใกล้ครบกำหนด",
      nearDeadlineValue: "0 งาน"
    },
    miniCalendarTitle: "Mini Calendar",
    miniCalendarHint: "เตรียมเชื่อมต่อข้อมูล event จาก Supabase",
    incomeExpenseTitle: "รายรับ-รายจ่าย 6 เดือน",
    incomeExpenseHint: "เตรียมวางกราฟ Recharts"
  },
  schedule: {
    title: "Schedule",
    addButton: "+ เพิ่มงาน",
    hint: "พื้นที่สำหรับ Weekly / Monthly / Daily calendar และ drag-and-drop"
  },
  tasks: {
    title: "Tasks",
    hint: "พื้นที่สำหรับ Kanban + List view + Tiptap editor"
  },
  finance: {
    title: "Finance",
    hint: "พื้นที่สำหรับสรุปรายรับรายจ่าย ตาราง และกราฟ"
  },
  clients: {
    title: "Clients",
    hint: "พื้นที่สำหรับรายการลูกค้าและประวัติงาน"
  },
  settingsPage: {
    title: "ตั้งค่าระบบ",
    description: "แก้ข้อความทั้งหมดของเว็บผ่าน JSON ด้านล่าง",
    textareaLabel: "App Settings JSON",
    saveButton: "บันทึกการตั้งค่า",
    resetButton: "รีเซ็ตค่าเริ่มต้น",
    successMessage: "บันทึกสำเร็จ",
    invalidJsonMessage: "JSON ไม่ถูกต้อง"
  },
  line: {
    morningTitle: "{appName} ☀️",
    eventCreatedTitle: "เพิ่มงานใหม่แล้ว! 📌",
    weeklyTitle: "สรุปประจำสัปดาห์"
  },
  upload: {
    provider: "imgbb"
  }
};