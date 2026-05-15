# LeoKanun

เว็บแอปจัดการชีวิตและงาน Freelance ส่วนตัว สร้างด้วย Next.js 14 + Supabase

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- Supabase (PostgreSQL + Auth)
- Tailwind CSS
- Recharts
- FullCalendar
- dnd-kit
- Tiptap
- ImgBB (อัปโหลดรูปและไฟล์)
- LINE Messaging API
- Vercel

## โครงสร้างหลัก
- src/app: หน้าและ API routes
- src/components: layout และ UI
- src/lib: helper supabase/line/utils
- src/types: type กลาง
- supabase/schema.sql: โครงสร้างฐานข้อมูล
- supabase/storage.sql: placeholder (ไม่ได้ใช้ Supabase Storage)

## วิธีติดตั้งและเริ่มใช้งาน
1. สร้างโปรเจกต์ Supabase ใหม่
2. เปิด SQL Editor แล้วรันไฟล์ supabase/schema.sql
3. ข้าม Supabase Storage ได้ เพราะโปรเจกต์นี้อัปโหลดด้วย ImgBB
4. สร้าง LINE Bot ใน LINE Developers Console และคัดลอก Channel Access Token
5. ติดตั้ง Node.js 20+ และ npm
6. ติดตั้ง dependencies:

```bash
npm install
```

7. คัดลอกไฟล์ตัวแปรแวดล้อม:

```bash
cp .env.example .env.local
```

8. กรอกค่าทุกตัวใน .env.local
9. รันโปรเจกต์:

```bash
npm run dev
```

10. Deploy ขึ้น Vercel และยืนยัน cron jobs จาก vercel.json

## Environment Variables
ดูตัวอย่างทั้งหมดในไฟล์ .env.example
- ตัวแปรสำคัญสำหรับอัปโหลดรูป: IMGBB_API_KEY
- `SUPABASE_SERVICE_ROLE_KEY` จำเป็นสำหรับ API routes ที่บันทึก settings/clients/jobs

## หมายเหตุ
- UI ในโครงเริ่มต้นนี้เป็นฐานสำหรับต่อยอด module Dashboard/Schedule/Tasks/Finance/Clients/Settings
- ตั้งค่าข้อความทุกส่วนของเว็บได้จากหน้า Settings (JSON)
- API `POST /api/line/send` และ cron routes จะอ่านข้อความจากตาราง `app_settings` ใน Supabase
- อัปโหลดไฟล์ด้วย ImgBB helper ที่ src/lib/imgbb.ts และ API route ที่ src/app/api/upload/image/route.ts
- หน้า Clients จะอัปโหลดรูปไป ImgBB และบันทึก URL ลงตาราง `clients`/`jobs` ผ่าน API routes
- หากต้องการ shadcn/ui ให้รันคำสั่ง init หลังจากติดตั้ง Node แล้ว