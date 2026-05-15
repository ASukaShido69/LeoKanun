import type { AppSettings } from "@/types/settings";

export const DEFAULT_SETTINGS: AppSettings = {
  app: {
    name: "LeoKanun",
    description: "Personal dashboard for freelance life",
    language: "th"
  },
  sidebar: {
    dashboard: "แดชบอร์ด",
    schedule: "ตารางเวลา",
    tasks: "งาน",
    finance: "การเงิน",
    clients: "ลูกค้า",
    settings: "ตั้งค่า"
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
    title: "แดชบอร์ด",
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
    miniCalendarTitle: "ปฏิทินเล็ก",
    miniCalendarHint: "กำลังโหลดข้อมูลจากปฏิทิน",
    incomeExpenseTitle: "รายรับ-รายจ่าย 6 เดือน",
    incomeExpenseHint: "กำลังเตรียมแสดงข้อมูล"
  },
  schedule: {
    title: "ตารางเวลา",
    addButton: "+ เพิ่มงาน",
    emptyState: "ยังไม่มีงานที่ต้องทำ",
    modal: {
      title: "เพิ่มงาน",
      eventTitle: "ชื่องาน",
      eventTitlePlaceholder: "กรุณาระบุชื่องาน",
      startDate: "วันที่เริ่มต้น",
      startTime: "เวลาเริ่มต้น",
      endDate: "วันที่สิ้นสุด",
      endTime: "เวลาสิ้นสุด",
      category: "หมวดหมู่",
      status: "สถานะ",
      isAllDay: "ทั้งวัน",
      save: "บันทึก",
      cancel: "ยกเลิก"
    }
  },
  tasks: {
    title: "งาน",
    addButton: "+ เพิ่มงาน",
    emptyState: "ยังไม่มีงาน",
    modal: {
      title: "เพิ่มงาน",
      taskTitle: "ชื่องาน",
      taskTitlePlaceholder: "กรุณาระบุชื่องาน",
      description: "คำอธิบาย",
      descriptionPlaceholder: "เพิ่มรายละเอียด",
      priority: "ความสำคัญ",
      dueDate: "กำหนดส่ง",
      status: "สถานะ",
      save: "บันทึก",
      cancel: "ยกเลิก"
    }
  },
  finance: {
    title: "การเงิน",
    addButton: "+ เพิ่มรายการ",
    emptyState: "ยังไม่มีรายการ",
    modal: {
      title: "เพิ่มรายการ",
      type: "ประเภท",
      amount: "จำนวนเงิน",
      amountPlaceholder: "0.00",
      category: "หมวดหมู่",
      description: "คำอธิบาย",
      descriptionPlaceholder: "เพิ่มรายละเอียด",
      date: "วันที่",
      save: "บันทึก",
      cancel: "ยกเลิก"
    }
  },
  clients: {
    title: "ลูกค้า",
    hint: "รายชื่อลูกค้าและประวัติการทำงาน"
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