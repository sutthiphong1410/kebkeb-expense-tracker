# KEBKEB Expense Tracker (Frontend)

หน้าเว็บของแอปติดตามรายรับ-รายจ่าย เขียนด้วย React + Vite + Tailwind CSS + Recharts

**Live:** https://kebkeb.netlify.app

## Tech Stack

- **React 19 + Vite**
- **React Router** — routing และ protected routes
- **Axios** — เรียก API พร้อม interceptor แนบ JWT และจัดการ error
- **Tailwind CSS v4** — styling
- **Recharts** — กราฟวงกลมและกราฟแท่ง
- **sonner** — toast แจ้งผล
- **lucide-react** — ไอคอน
- **dayjs** — จัดการวันที่

## วิธีรัน (Local Development)

ต้องรัน backend ก่อน (ดู [`backend/README.md`](../backend/README.md))

```bash
npm install
cp .env.example .env   # แก้ VITE_API_URL ถ้า backend รันคนละพอร์ต
npm run dev
```

เปิด http://localhost:5173

## Scripts

| คำสั่ง | หน้าที่ |
|---|---|
| `npm run dev` | รัน dev server |
| `npm run build` | build ไปที่ `dist/` |
| `npm run preview` | ดูผล build ในเครื่อง |
| `npm run lint` | ตรวจโค้ดด้วย ESLint |

ทดสอบบนมือถือจริง (เครือข่าย Wi-Fi เดียวกัน): `npm run dev -- --host` แล้วเปิด URL แบบ `http://192.168.x.x:5173`

## Environment Variables

| ตัวแปร | คำอธิบาย |
|---|---|
| `VITE_API_URL` | URL ของ backend เช่น `http://localhost:5000/api` (production ใช้ URL ของ Render ต่อท้าย `/api`) |

ตัวแปรขึ้นต้น `VITE_` ถูกฝังในไฟล์ที่ build ห้ามใส่ secret และต้องตั้งค่า **ก่อน build** ถ้าแก้ภายหลังต้อง deploy ใหม่

## โครงสร้างโปรเจกต์

```
src/
  api/          เรียก API (auth, categories, expenses ฯลฯ)
  client.js     axios instance + interceptor (แนบ token, จัดการ 401, toast error)
  context/      AuthContext / useAuth — สถานะ login ทั้งแอป
  components/   UI ที่ใช้ซ้ำ (Navbar, ExpenseForm, ExpenseTable, กราฟ, Modal, MonthPicker, DayStrip ฯลฯ)
  pages/        หน้าเต็ม (Login, Register, Dashboard, Expenses, Budgets, Categories)
public/
  _redirects    ให้ Netlify ส่ง index.html ทุกเส้นทาง (รองรับ React Router)
```

## ฟีเจอร์

- Register / Login ด้วย JWT, protected routes, ออกจากระบบอัตโนมัติเมื่อ token หมดอายุ
- CRUD รายรับ-รายจ่าย กรองตามเดือน วัน ประเภท และค้นหา
- จัดการหมวดหมู่และงบประมาณรายเดือน
- Dashboard: การ์ดสรุป, progress bar งบเทียบยอดใช้จริง, กราฟวงกลม, กราฟแท่ง
- Empty state แนะนำผู้ใช้ใหม่ให้เริ่มจากเพิ่มรายการแรก
- Responsive: เมนูแฮมเบอร์เกอร์, รายการเป็นการ์ดบนมือถือ, ตัวกรองเป็น select บนจอเล็ก
- Toast แจ้งผลสำเร็จ/ผิดพลาด

## Build และ Deploy

```bash
npm run build
```

ผลลัพธ์อยู่ที่ `dist/` (ไม่ต้อง commit) deploy บน Netlify:

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`
- Environment: `VITE_API_URL`

ต้องมีไฟล์ `public/_redirects` เนื้อหา:

```
/*    /index.html   200
```

ไม่งั้น refresh ที่ `/login` หรือ `/expenses` จะขึ้น 404
