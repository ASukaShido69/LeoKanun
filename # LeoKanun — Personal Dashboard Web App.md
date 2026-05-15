# LeoKanun — Personal Dashboard Web App

## ภาพรวมโปรเจกต์
สร้างเว็บแอปพลิเคชันส่วนตัวชื่อ "LeoKanun" สำหรับจัดการชีวิตและงาน Freelance
ใช้งานส่วนตัว 1 คน (แฟนของผู้สร้าง) โดยเน้น Schedule และ Dashboard เป็นหัวใจหลัก

## Tech Stack
- Framework: Next.js 14 (App Router) + TypeScript
- Database & Auth: Supabase (PostgreSQL + Supabase Auth + Storage)
- Styling: Tailwind CSS + shadcn/ui
- Charts: Recharts
- Calendar: react-big-calendar หรือ @fullcalendar/react
- Drag & Drop: @dnd-kit/core
- Rich Editor: Tiptap (สำหรับ task description)
- LINE API: LINE Messaging API (Flex Message)
- Deployment: Vercel

---

## Design System

### Font
- ทุก element ใช้ font "Mali" จาก Google Fonts (Thai + Latin)
- import: `@import url('https://fonts.googleapis.com/css2?family=Mali:wght@300;400;500;600;700&display=swap')`
- ตัวใหญ่/หัวข้อ: Mali 600-700
- ตัวปกติ: Mali 400-500

### สีหลัก (CSS Variables)
```css
:root {
  --primary: #F4A7B9;        /* blush pink */
  --secondary: #C9B8E8;      /* soft lavender */
  --accent: #A8D8B9;         /* sage green */
  --warning: #FFD6A5;        /* peach */
  --background: #FFF8FC;     /* cream white */
  --surface: #FFFFFF;
  --surface-2: #FDF0F6;
  --text-primary: #3D2C35;
  --text-secondary: #8B6F7A;
  --border: #F0D9E8;
  --shadow: rgba(244,167,185,0.15);
}
```

### Component Style
- card: border-radius 16px, box-shadow อ่อนๆ สีชมพู, background white
- button primary: gradient blush → lavender, border-radius 12px
- sidebar: สี --surface-2, width 240px (collapsible บน mobile)
- animation: transition 200ms ease, hover lift (translateY -2px)
- ทุก icon ใช้ Lucide React
- glassmorphism เบาๆ บน dashboard header

---

## โครงสร้างหน้า (App Router)
/app
/                    → redirect → /dashboard
/login               → หน้า login (email + password)
/dashboard           → หน้าหลัก Dashboard
/schedule            → ตารางคิวงาน (Weekly / Monthly / Daily)
/tasks               → To-do & Task List
/finance             → รายรับ-รายจ่าย
/clients             → ข้อมูลลูกค้า Freelance
/settings            → ตั้งค่า LINE, โปรไฟล์
/components
/layout              → Sidebar, Topbar, MobileNav
/dashboard           → widgets ทุกตัว
/schedule            → Calendar components
/tasks               → Task card, Task form
/finance             → Transaction form, Charts
/clients             → Client card, Client form
/ui                  → shadcn components
/lib
/supabase.ts
/line.ts             → LINE Flex Message helpers
/utils.ts
/types/index.ts

---

## Module 1: Dashboard หน้าแรก (/dashboard)

### Layout
- Header: ทักทายชื่อ + วันที่ปัจจุบัน (ไทย) + เวลา real-time
- Grid layout: 2 คอลัมน์ desktop, 1 คอลัมน์ mobile

### Widgets (เรียงตามความสำคัญ)

**Row 1 — Summary Cards (4 cards)**
1. 💼 คิวงานวันนี้ — จำนวน event วันนี้ + รายชื่อ
2. 📋 Task ค้างอยู่ — จำนวน task ที่ยังไม่เสร็จ
3. 💰 รายได้เดือนนี้ — ยอดรวม Freelance เดือนปัจจุบัน
4. ⏰ งานใกล้ครบกำหนด — deadline ภายใน 3 วัน

**Row 2 — Main Widgets**
- Mini Calendar (ซ้าย, 40%): แสดงเดือนปัจจุบัน, จุดสีบน date ที่มี event, คลิกดู event ของวันนั้น
- กราฟรายรับ-รายจ่าย (ขวา, 60%): Bar chart 6 เดือนย้อนหลัง (income สีเขียว, expense สีชมพู) + ยอดสุทธิ

**Row 3 — Lists**
- คิวงานสัปดาห์นี้: รายการ event 7 วันข้างหน้า พร้อมสี category
- Task ที่ค้างอยู่ (top 5): แสดง priority badge + deadline + ปุ่ม mark done

---

## Module 2: ตารางคิวงาน (/schedule) — หัวใจหลัก

### มุมมอง (View Toggle)
- Weekly Grid — 7 คอลัมน์ × 24 ชั่วโมง, drag-and-drop event ได้
- Monthly Calendar — grid เดือน, event แสดงเป็น pill สี
- Daily Timeline — timeline 24 ชั่วโมง, event เรียงตามเวลา

### Event Fields

title: string (required)
description: text
client_id: FK → clients (optional, สำหรับงาน freelance)
category: enum ['freelance', 'meeting', 'personal', 'deadline', 'other']
color: string (เลือกสีได้ 8 สี)
start_datetime: timestamptz (required)
end_datetime: timestamptz
is_all_day: boolean
is_recurring: boolean
recurrence_rule: text (RRULE format)
reminder_minutes: int[] (เช่น [30, 1440] = 30นาที, 1วัน)
status: enum ['upcoming', 'in_progress', 'done', 'cancelled']
attachments: text[] (Supabase Storage URLs)


### UI Details
- คลิก event → Slide-over panel แสดงรายละเอียด + ปุ่มแก้ไข/ลบ
- คลิก date/time ว่าง → เปิด modal เพิ่ม event ทันที (pre-fill วันเวลา)
- ค้นหา event ด้านบน
- Filter by category (pill buttons)
- สี category: freelance=lavender, meeting=blue, personal=pink, deadline=red, other=gray
- ปุ่ม "เพิ่มงาน" ลอยมุมขวาล่าง (FAB)

---

## Module 3: To-do / Task (/tasks)

### Task Fields

title: string (required)
description: text (Tiptap rich text)
priority: enum ['urgent', 'high', 'medium', 'low']
status: enum ['todo', 'in_progress', 'done']
due_date: date
client_id: FK → clients (optional)
tags: text[]
estimated_hours: numeric
created_at, updated_at


### UI
- Kanban view (Todo | กำลังทำ | เสร็จแล้ว) drag-and-drop ได้
- List view พร้อม filter/sort
- Task card: priority badge สี, deadline, ชื่อ client ถ้ามี
- Quick add: พิมพ์ชื่อ task แล้ว Enter ได้เลย

---

## Module 4: รายรับ-รายจ่าย (/finance)

### Transaction Fields

type: enum ['income', 'expense']
amount: numeric(12,2)
category: text (customizable)
source: text (ชื่อลูกค้า หรือแหล่งที่มา)
note: text
date: date
receipt_url: text (Supabase Storage)


### หมวดหมู่เริ่มต้น
- รายรับ: งาน Freelance, มัดจำ, ยอดเต็ม, อื่นๆ
- รายจ่าย: อาหาร, เดินทาง, อุปกรณ์, ค่าซอฟต์แวร์, อื่นๆ

### UI
- สรุปบนสุด: รายรับ / รายจ่าย / คงเหลือ เดือนนี้
- ตารางรายการ (filter เดือน/ประเภท/หมวดหมู่)
- กราฟ Pie แยก category รายจ่าย
- Export CSV
- เพิ่มรายการ: Modal form สั้นๆ

---

## Module 5: ลูกค้า Freelance (/clients)

### Client Fields

name: string (required)
nickname: string
phone: string
line_id: string
facebook: string
instagram: string
email: string
notes: text
tags: text[]
created_at


### Job (งานต่อ client)

client_id: FK
title: string
description: text
price: numeric (ราคาเต็ม)
deposit: numeric (มัดจำ)
paid_amount: numeric (จ่ายมาแล้ว)
status: enum ['pending', 'in_progress', 'delivered', 'paid', 'cancelled']
deadline: date
delivered_at: date
sample_images: text[] (Supabase Storage URLs)
attachments: text[]
notes: text


### UI
- Grid card แต่ละ client: ชื่อ, สถานะงานล่าสุด, ยอดค้างชำระ
- คลิก client → หน้า detail: ข้อมูลติดต่อ + ประวัติงานทั้งหมด
- สถานะมีสีบ่งบอก: รอ=เหลือง, กำลังทำ=ฟ้า, ส่งแล้ว=เขียว, จ่ายแล้ว=ม่วง
- อัปโหลดรูปตัวอย่างงาน (Supabase Storage)

---

## Supabase Database Schema

```sql
-- Enable RLS on all tables

-- Events / Schedule
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES clients(id),
  category TEXT DEFAULT 'other',
  color TEXT DEFAULT '#C9B8E8',
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  is_all_day BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT,
  reminder_minutes INTEGER[],
  status TEXT DEFAULT 'upcoming',
  attachments TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'todo',
  due_date DATE,
  tags TEXT[],
  estimated_hours NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  category TEXT NOT NULL,
  source TEXT,
  note TEXT,
  date DATE NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nickname TEXT,
  phone TEXT,
  line_id TEXT,
  facebook TEXT,
  instagram TEXT,
  email TEXT,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs (งานต่อ client)
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2),
  deposit NUMERIC(12,2) DEFAULT 0,
  paid_amount NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  deadline DATE,
  delivered_at DATE,
  sample_images TEXT[],
  attachments TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (ทำทุก table)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own data" ON events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON clients FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON jobs FOR ALL USING (auth.uid() = user_id);
```

---

## LINE Messaging API — Flex Message

### ตั้งค่า
- ใช้ LINE Messaging API (ไม่ใช่ LINE Notify ซึ่งปิดบริการแล้ว)
- สร้าง LINE Bot (LINE Developers Console)
- เก็บ CHANNEL_ACCESS_TOKEN ใน Supabase secrets / env
- ส่งผ่าน `/api/line/send` Next.js API Route

### Flex Message 3 แบบ

**1. สรุปงานประจำวันตอนเช้า (เวลา 08:00)**
ส่งทุกวันผ่าน Vercel Cron Job (`/api/cron/morning`)
```json
{
  "type": "bubble",
  "hero": { gradient blush-lavender header, ชื่อ "LeoKanun ☀️", วันที่ภาษาไทย },
  "body": {
    "sections": [
      "📅 คิวงานวันนี้ (N รายการ)" → list event ชื่อ + เวลา,
      "📋 Task ค้างอยู่ (N รายการ)" → list task urgent ก่อน,
      "💰 รายได้เดือนนี้" → ยอดตัวเลข
    ]
  },
  "footer": { ปุ่ม "เปิด LeoKanun" → link เว็บ }
}
```

**2. แจ้งเตือนเมื่อเพิ่ม/แก้ไข Event**
ส่งทันทีเมื่อ create/update event
```json
{
  "type": "bubble",
  "header": { สีตาม category, icon, "เพิ่มงานใหม่แล้ว! 📌" },
  "body": {
    "ชื่องาน": event.title,
    "วันเวลา": formatted Thai datetime,
    "ลูกค้า": client.name (ถ้ามี),
    "หมวด": category badge
  },
  "footer": { ปุ่ม "ดูตาราง" }
}
```

**3. สรุปประจำสัปดาห์ (วันจันทร์ 09:00)**
ส่งทุกวันจันทร์ผ่าน Vercel Cron Job (`/api/cron/weekly`)
```json
{
  "type": "carousel",
  "bubbles": [
    bubble1: สรุปสัปดาห์ที่ผ่านมา (งานเสร็จ N ชิ้น, รายได้ X บาท),
    bubble2: คิวงานสัปดาห์หน้า (event list 7 วัน),
    bubble3: Task ที่ต้องทำสัปดาห์นี้
  ]
}
```

### API Route
```typescript
// /app/api/line/send/route.ts
export async function POST(req: Request) {
  const { type, data } = await req.json()
  const flexMessage = buildFlexMessage(type, data) // switch บน type
  await fetch('https://api.line.me/v2/bot/message/broadcast', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ messages: [flexMessage] })
  })
}
```

### Vercel Cron (vercel.json)
```json
{
  "crons": [
    { "path": "/api/cron/morning", "schedule": "0 1 * * *" },
    { "path": "/api/cron/weekly", "schedule": "0 2 * * 1" }
  ]
}
```
(UTC+7: 08:00 = 01:00 UTC, วันจันทร์ 09:00 = 02:00 UTC)

---

## Environment Variables (.env.local)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
LINE_CHANNEL_ACCESS_TOKEN=
LINE_USER_ID=               # YOUR LINE User ID สำหรับ push message
NEXT_PUBLIC_APP_URL=        # https://leokanun.vercel.app
CRON_SECRET=                # random string สำหรับ protect cron routes

---

## Deliverables
1. Next.js project ครบทุก module พร้อมใช้งาน
2. `supabase/schema.sql` — รัน SQL ได้ทันที
3. `supabase/storage.sql` — สร้าง bucket สำหรับรูปและไฟล์
4. `vercel.json` — พร้อม cron config
5. `.env.example` — ทุก variable
6. `README.md` ภาษาไทย — ขั้นตอน setup ทีละขั้น:
   (1) สร้าง Supabase project
   (2) รัน SQL schema
   (3) สร้าง LINE Bot
   (4) clone + npm install
   (5) deploy Vercel

---

## สิ่งสำคัญสุดท้าย
- ภาษาไทยทั้งหมดใน UI
- Font Mali ทุก element
- ชื่อเว็บ "LeoKanun" แสดงทุกหน้า
- Mobile-first responsive
- ไม่มี Journal module
- เน้น Schedule + Dashboard ให้สวยที่สุดและใช้งานได้จริง
- Supabase Realtime สำหรับ event/task updates