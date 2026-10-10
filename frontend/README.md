# KEBKEB Expense Tracker (Frontend)

แอปติดตามรายรับ-รายจ่าย เขียนด้วย React + Vite + Tailwind CSS + Recharts

## Tech Stack

- **React 19 + Vite**
- **React Router** — routing และ protected routes
- **Axios** — เรียก API พร้อม interceptor แนบ JWT token อัตโนมัติ
- **Tailwind CSS v4** — styling
- **Recharts** — กราฟวงกลมและกราฟแท่ง

## วิธีรัน (Local Development)

ต้องรัน backend ก่อน (ดู [`backend/README.md`](../backend/README.md)) แล้วค่อยรัน frontend:

```bash
npm install
cp .env.example .env   # แก้ VITE_API_URL ถ้า backend รันคนละ port
npm run dev
```

เปิด http://localhost:5173

## Environment Variables

| ตัวแปร | คำอธิบาย |
|---|---|
| `VITE_API_URL` | URL ของ backend เช่น `http://localhost:5000/api` (production ใช้ URL ของ Render) |

ตัวแปรที่ขึ้นต้นด้วย `VITE_` จะถูกฝังลงในไฟล์ที่ build ออกมา ห้ามใส่ secret ใดๆ ในนี้

## โครงสร้างโปรเจกต์

```
src/
  api/            เรียก API (auth.js, categories.js, expenses.js, client.js)
  context/        AuthContext — จัดการสถานะ login ทั้งแอป
  components/     UI ที่ใช้ซ้ำได้ (ExpenseForm, ExpenseTable, กราฟ, Modal)
  pages/          หน้าเต็ม (Login, Register, Dashboard, Expenses)
```

## Features

- Register / Login พร้อม JWT authentication
- Protected routes — ต้อง login ก่อนถึงเข้าหน้า Dashboard/Expenses ได้
- CRUD รายการรายรับ-รายจ่ายเต็มรูปแบบ
- จัดการหมวดหมู่ของตัวเอง (หมวดเริ่มต้นถูกสร้างให้ตอนสมัคร)
- Filter ตามประเภท หมวดหมู่ เดือน
- ตั้งงบประมาณรายเดือนต่อหมวดหมู่ และเทียบกับยอดใช้จริง
- Dashboard สรุปยอด + กราฟวงกลม (ตามหมวดหมู่) + กราฟแท่ง (รายเดือน)

## Build สำหรับ Production

```bash
npm run build
```

ไฟล์ build จะอยู่ที่ `dist/` — นำไป deploy บน Render Static Site, Vercel หรือ Netlify ได้

ตอน deploy ต้องตั้ง `VITE_API_URL` ให้ชี้ไปที่ backend บน Render **ก่อน build** เพราะค่านี้ถูกฝังตอน build ไม่ใช่ตอนรัน

ถ้าใช้ React Router และ deploy เป็น static site ต้องตั้ง rewrite ให้ทุก path ชี้ไป `index.html` ไม่งั้น refresh หน้า `/expenses` จะได้ 404 (Render: Redirects/Rewrites เพิ่ม `/*` → `/index.html` แบบ Rewrite, Vercel/Netlify ตั้งค่าคล้ายกัน)