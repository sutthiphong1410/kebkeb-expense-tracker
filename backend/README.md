# KEBKEB Expense Tracker API (Backend)

REST API สำหรับแอปติดตามรายรับ-รายจ่าย เขียนด้วย Node.js + Express + PostgreSQL

## Tech Stack

- **Express.js** — web framework
- **PostgreSQL** (`pg`) — database (production ใช้ [Neon](https://neon.tech))
- **JWT** (`jsonwebtoken`) — authentication
- **bcryptjs** — password hashing
- **cors** — จำกัด origin ของ frontend

## วิธีรัน (Local Development)

### 1. รัน PostgreSQL ด้วย Docker

```bash
docker run --name pg-local -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=myapp -p 5433:5432 -v pgdata:/var/lib/postgresql/data -d postgres:16
```

ครั้งต่อไปถ้า container หยุดอยู่ ใช้ `docker start pg-local`

### 2. ตั้งค่าและรันเซิร์ฟเวอร์

```bash
npm install
cp .env.example .env   # แก้ JWT_SECRET เป็นค่าของตัวเอง
npm run dev            # รันด้วย nodemon
```

เซิร์ฟเวอร์รันที่ http://localhost:5000 และสร้างตารางให้อัตโนมัติตอนเริ่มทำงาน

## Scripts

| คำสั่ง | หน้าที่ |
|---|---|
| `npm run dev` | รันด้วย nodemon (auto-restart) |
| `npm start` | รันแบบ production |

## Environment Variables

| ตัวแปร | คำอธิบาย |
|---|---|
| `PORT` | พอร์ตของเซิร์ฟเวอร์ (default 5000) |
| `DATABASE_URL` | connection string ของ PostgreSQL (production ต้องลงท้าย `?sslmode=require`) |
| `JWT_SECRET` | คีย์สำหรับเซ็น JWT (production ใช้สตริงสุ่มยาวๆ) |
| `JWT_EXPIRES_IN` | อายุ token เช่น `7d` |
| `FRONTEND_URL` | origin ของ frontend ที่อนุญาต (CORS) ไม่มี `/` ท้าย คั่นหลายค่าด้วย comma เช่น `https://kebkeb.netlify.app,http://localhost:5173` |

## API Endpoints

ทุก endpoint ยกเว้น Health และ Auth ต้องแนบ `Authorization: Bearer <token>`

### Health

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/api/health` | เช็กสถานะเซิร์ฟเวอร์ |

### Auth

| Method | Endpoint | Body | คำอธิบาย |
|---|---|---|---|
| POST | `/api/auth/register` | `{ email, password, name }` | สมัครสมาชิก (สร้างหมวดหมู่เริ่มต้นให้ อีเมลถูกแปลงเป็นตัวพิมพ์เล็ก) |
| POST | `/api/auth/login` | `{ email, password }` | เข้าสู่ระบบ |

### Categories

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/api/categories` | ดึงทั้งหมด (`?category=&type=&active=`) |
| GET | `/api/categories/:id` | ดึงรายการเดียว |
| POST | `/api/categories` | สร้างใหม่ `{ name, type }` |
| PUT | `/api/categories/:id` | แก้ไข |
| DELETE | `/api/categories/:id` | ลบ (ลบไม่ได้ถ้ามี expense/budget ผูกอยู่ ตอบ 409) |

### Expenses

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/api/expenses` | ดึงทั้งหมด (`?type=&category=&month=&date=`) |
| GET | `/api/expenses/summary` | สรุปยอดสำหรับ dashboard (`?month=YYYY-MM`) |
| GET | `/api/expenses/months` | รายการเดือนที่มีข้อมูล |
| GET | `/api/expenses/days` | รายการวันที่มีข้อมูล (`?month=YYYY-MM`) |
| GET | `/api/expenses/:id` | ดึงรายการเดียว |
| POST | `/api/expenses` | สร้างใหม่ `{ amount, category_id, type, date, description? }` |
| PUT | `/api/expenses/:id` | แก้ไข |
| DELETE | `/api/expenses/:id` | ลบ |

### Budgets

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/api/budgets` | ดึงทั้งหมด (`?category=&month=`) |
| GET | `/api/budgets/summary` | งบเทียบยอดใช้จริง (`?month=YYYY-MM`) |
| GET | `/api/budgets/:id` | ดึงรายการเดียว |
| POST | `/api/budgets` | สร้างงบ `{ category_id, amount, month }` (ถ้ามีของหมวด+เดือนนั้นแล้วจะอัปเดตยอด ตอบ 200) |
| PUT | `/api/budgets/:id` | แก้ไข |
| DELETE | `/api/budgets/:id` | ลบ |

## Database Schema

- **users**: id, email (unique), password_hash, name, created_at
- **categories**: id, user_id (FK), name, type (income/expense), is_active, created_at, updated_at — unique (user_id, name, type)
- **expenses**: id, user_id (FK), category_id (FK), amount (NUMERIC 12,2), description, type (income/expense), date (DATE), created_at
- **budgets**: id, user_id (FK), category_id (FK), amount (NUMERIC 12,2), month (YYYY-MM), created_at, updated_at — unique (user_id, category_id, month)

## ความปลอดภัย

- รหัสผ่านเก็บแบบ hash ด้วย bcrypt
- ทุก query ใช้ parameterized query (กัน SQL injection)
- ตรวจ `user_id` ทุก query จึงเข้าถึงได้เฉพาะข้อมูลของตัวเอง และตรวจว่า `category_id` เป็นของผู้ใช้คนนั้น
- CORS จำกัดเฉพาะ origin ใน `FRONTEND_URL`

## Deploy

- Database: [Neon](https://neon.tech)
- Server: [Render](https://render.com) — Root Directory `backend`, Build `npm install`, Start `npm start`
- ตั้ง `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL` ใน Environment ของ Render
