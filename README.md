# KEBKEB — Personal Expense Tracker

เว็บแอปติดตามรายรับ-รายจ่ายส่วนตัว บันทึกรายการ จัดหมวดหมู่ ตั้งงบประมาณรายเดือน และดูสรุปผ่าน dashboard รองรับทั้งคอมพิวเตอร์และมือถือ

** Live Demo:** https://kebkeb.netlify.app

> **ลองใช้งาน:** สมัครสมาชิกเองได้เลย หรือใช้บัญชีทดลอง
> `demo@example.com` / `<รหัสผ่านบัญชี demo>`
>
> เซิร์ฟเวอร์ใช้แผนฟรี หากไม่มีคนใช้งานสักพักจะหลับ การเข้าครั้งแรกอาจใช้เวลา 30-60 วินาที

<!-- ใส่ภาพหน้าจอ: วางไฟล์ใน docs/ แล้วเปิดบรรทัดด้านล่าง -->
<!-- ![Dashboard](./docs/dashboard.png) -->

## ฟีเจอร์

- สมัครสมาชิก / เข้าสู่ระบบด้วย JWT (สมัครแล้วได้หมวดหมู่เริ่มต้นให้อัตโนมัติ)
- บันทึก แก้ไข ลบ รายรับ-รายจ่าย
- กรองรายการตามเดือน วัน ประเภท และค้นหาตามหมวดหมู่
- จัดการหมวดหมู่ของตัวเอง
- ตั้งงบประมาณรายเดือนต่อหมวดหมู่ เทียบกับยอดใช้จริงด้วย progress bar
- Dashboard สรุปยอด พร้อมกราฟวงกลม (ตามหมวดหมู่) และกราฟแท่ง (รายรับ-รายจ่าย)
- ผู้ใช้ใหม่เห็นคำแนะนำขั้นตอนเริ่มต้นเมื่อยังไม่มีข้อมูล
- Responsive: เมนูแฮมเบอร์เกอร์ รายการแสดงเป็นการ์ดบนมือถือ
- แจ้งผลด้วย toast ข้อความ error เป็นภาษาไทย
- ข้อมูลของแต่ละบัญชีแยกกัน ไม่เห็นข้อมูลของผู้อื่น

## Tech Stack

| ส่วน | เทคโนโลยี |
|---|---|
| Frontend | React 19, Vite, React Router, Axios, Tailwind CSS v4, Recharts |
| Backend | Node.js, Express |
| Database | PostgreSQL (`pg`) |
| Auth | JWT (`jsonwebtoken`), `bcryptjs` |
| Hosting | Netlify (frontend), Render (backend), Neon (database) |

## โครงสร้างโปรเจกต์

```
kebkeb/
├── backend/     # REST API (Express + PostgreSQL)
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── app.js
│   └── server.js
└── frontend/    # หน้าเว็บ (React + Vite)
    └── src/
```

รายละเอียดเพิ่มเติม: [`backend/README.md`](./backend/README.md) · [`frontend/README.md`](./frontend/README.md)

## วิธีรันในเครื่อง

### สิ่งที่ต้องมี

- [Node.js](https://nodejs.org) 18 ขึ้นไป
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (สำหรับรัน PostgreSQL)

### 1. รัน PostgreSQL

```bash
docker run --name pg-local -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=myapp -p 5433:5432 -v pgdata:/var/lib/postgresql/data -d postgres:16
```

ครั้งต่อไปถ้า container หยุดอยู่ ใช้ `docker start pg-local`

### 2. รัน Backend

```bash
cd backend
npm install
cp .env.example .env     # แก้ JWT_SECRET เป็นค่าของตัวเอง
npm run dev
```

รันที่ http://localhost:5000 (เช็ก http://localhost:5000/api/health) ตารางถูกสร้างอัตโนมัติตอนเริ่มทำงาน

### 3. รัน Frontend

เปิด terminal อีกอัน:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

เปิด http://localhost:5173

## Environment Variables

| ที่ | ตัวแปร | คำอธิบาย |
|---|---|---|
| backend | `PORT` | พอร์ตเซิร์ฟเวอร์ (default 5000) |
| backend | `DATABASE_URL` | connection string ของ PostgreSQL |
| backend | `JWT_SECRET` | คีย์เซ็น JWT |
| backend | `JWT_EXPIRES_IN` | อายุ token เช่น `7d` |
| backend | `FRONTEND_URL` | origin ที่อนุญาตให้เรียก API (CORS) คั่นหลายค่าด้วย comma |
| frontend | `VITE_API_URL` | URL ของ backend เช่น `http://localhost:5000/api` |

> ไฟล์ `.env` มี secret ห้าม commit (ถูก ignore ไว้แล้ว) ให้ commit เฉพาะ `.env.example`

## Deploy

1. **Database:** สร้าง project บน [Neon](https://neon.tech) แล้วคัดลอก connection string (ลงท้าย `?sslmode=require`)
2. **Backend (Render Web Service):** Root Directory `backend`, Build `npm install`, Start `npm start` ตั้ง `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL`
3. **Frontend (Netlify):** Base directory `frontend`, Build `npm run build`, Publish `dist` ตั้ง `VITE_API_URL` เป็น `https://<backend>.onrender.com/api` และมีไฟล์ `public/_redirects` เพื่อรองรับ React Router

## ข้อจำกัดที่ทราบ

- แผนฟรีของ Render และ Neon หลับเมื่อไม่มีการใช้งาน request แรกจึงช้า
- ยังไม่มี automated test และ migration tool (ตารางสร้างด้วย `CREATE TABLE IF NOT EXISTS` ตอนเริ่มเซิร์ฟเวอร์)

## License

สำหรับการเรียนรู้และใช้เป็นผลงานส่วนตัว
