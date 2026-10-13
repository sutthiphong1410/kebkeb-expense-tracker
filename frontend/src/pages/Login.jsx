import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./../context/useAuth";
import { useEffect } from "react";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const notice = sessionStorage.getItem("authNotice");
    if (notice) {
      toast.info(notice);
      sessionStorage.removeItem("authNotice");
    }
  }, []);

  const hanldeSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-ledger mb-1">
          สมุดบัญชีของฉัน
        </h1>
        <p className="text-sm text-ink/60 mb-8">
          เข้าสู่ระบบเพื่อดูรายวัน-รายจ่ายของคุณ
        </p>

        <form onSubmit={hanldeSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-ink/70">อีเมล</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-paper-line bg-white px-3 py-2 outline-none focus:border-ledger transition-colors"
              placeholder="your@example.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-ink/70">รหัสผ่าน</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-paper-line bg-white px-3 py-2 outline-none focus:border-ledger transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ledger text-white py-2.5 hover:bg-ledger transition-colors disabled:opacity-50"
          >
            {loading ? "กำลังเข้าสู่ระบบ" : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p className="text-sm text-ink/60 mt-6">
          ยังไม่มีบัญชี{" "}
          <Link
            to={"/register"}
            className="text-ledger underline underline-offset-2"
          >
            สมัคสมาชิก
          </Link>
        </p>
      </div>
    </div>
  );
};
export default Login;
