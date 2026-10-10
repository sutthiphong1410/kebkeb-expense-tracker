import { useAuth } from "../context/useAuth";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }) => {
    return `pb-1 border-b-2 transition-color ${
        isActive ? 'border-gold text-ledger' : 'border-transparent text-ink/60 hover:text-ink'
    }`
  };
  return (
    <header className="border-b border-paper-line bg-paper shadow-lg">
        <div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
             <h1 className="font-display text-xl text-ledger">สมุดบัญชีของฉัน</h1>
             <nav className="space-x-4 text-sm">
                <NavLink to="/" end className={linkClass}>
                    แดชบอร์ด
                </NavLink>

                <NavLink to="/expenses" end className={linkClass}>
                    รายการทั้งหมด
                </NavLink>

                <NavLink to="/budgets" end className={linkClass}>
                    งบประมาณ
                </NavLink>

                <NavLink to="/categories" end className={linkClass}>
                    หมวดหมู่
                </NavLink>
                <span className="text-ink/40">|</span>
                <span className="text-ink/40">สวัสดี, {user?.name}</span>
                <button onClick={logout} className="text-expense hover:underline">
                    ออกจากระบบ
                </button>
             </nav>
        </div>
    </header>
  );
};
export default Navbar;
