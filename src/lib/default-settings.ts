export const DEFAULT_SETTINGS = {
  app: {
    name: "LeoKanun",
    description: "Personal dashboard for freelance life",
    language: "th"
  },
  sidebar: {
    dashboard: "แดชบอร์ด",
    queue: "คิวงานร้าน",
    tasks: "งาน",
    finance: "การเงิน",
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
    incomeExpenseTitle: "รายรับ-รายจ่าย 6 เดือน",
    incomeExpenseHint: "กำลังเตรียมแสดงข้อมูล"
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
      dueDate: "กำหนดส่ง",
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
  queuePresets: {
    jobTypes: ["พิมพ์เอกสาร", "เข้าเล่ม", "เคลือบบัตร", "ถ่ายเอกสาร", "ออกแบบงานพิมพ์"]
  },
  financePresets: {
    incomeCategories: ["ค่าบริการ", "งานโปรเจกต์", "งานด่วน", "รายได้อื่น ๆ"],
    expenseCategories: ["ค่าวัสดุ", "ค่าไฟฟ้า", "ค่าเช่า", "ค่าขนส่ง", "ค่าใช้จ่ายอื่น ๆ"]
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
    weeklyTitle: "สรุปประจำสัปดาห์",
    webhookUrl: ""
  },
  upload: {
    provider: "imgbb"
  }
} as any;