import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react"; // npm install lucide-react
import { useAuth } from "./../context/useAuth";

const links = [
  { to: "/", label: "ภาพรวมการเงิน" },
  { to: "/expenses", label: "รายการทั้งหมด" },
  { to: "/budgets", label: "งบประมาณ" },
  { to: "/categories", label: "หมวดหมู่" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (!confirm("ยืนยันจะออกจากระบบหรือไม่")) return;
    logout();
  };

  const linkClass = ({ isActive }) =>
    `block py-2 md:py-0 md:border-b-2 ${
      isActive
        ? "font-medium md:border-amber-500"
        : "text-stone-600 md:border-transparent"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <span className="text-lg font-medium">สมุดบัญชีของฉัน</span>

        {/* ปุ่มแฮมเบอร์เกอร์ (เฉพาะมือถือ) */}
        <button
          className="p-2 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="เมนู"
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* เมนูจอใหญ่ */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={linkClass}
            >
              {l.label}
            </NavLink>
          ))}
          <span className="text-stone-400">สวัสดี, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-orange-700 cursor-pointer hover:underline"
          >
            ออกจากระบบ
          </button>
        </nav>
      </div>

      {/* เมนูมือถือ (กางลง) */}
      {open && (
      <nav className="absolute inset-x-0 top-full border-b border-stone-200 bg-white px-4 pb-3 text-sm shadow-md md:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <p className="py-2 text-stone-400">สวัสดี, {user?.name}</p>
          <button
            onClick={handleLogout}
            className="py-2 text-orange-700 cursor-pointer hover:underline"
          >
            ออกจากระบบ
          </button>
        </nav>
      )}
    </header>
  );
}
