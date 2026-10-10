import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate,Link } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error || "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-ledger mb-1">
          สร้างบัญชีใหม่
        </h1>
        <p className="text-sm text-ink/60 mb-8">
          เริ่มติดตามรายรับ-รายจ่ายของคุณวันนี้
        </p>

        {error && (
          <div className="mb-4 text-sm text-expense border border-expense/30 bg-expense/5 px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-ink/70">ชื่อ</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-paper-line bg-white px-3 py-2 outline-none focus:border-ledger transition-colors"
              placeholder="ชื่อของคุณ"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-ink/70">อีเมล</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-paper-line bg-white px-3 py-2 outline-none focus:border-ledger transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-ink/70">รหัสผ่น</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-paper-line bg-white px-3 py-2 outline-none focus:border-ledger transition-colors"
              placeholder="อย่างน้อย 6 ตัวอักษร"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ledger text-white py-2.5 hover:bg-ledger-light transition-colors disabled:opacity-50"
          >
            {loading ? "กำลังเข้าสู่่ระบบ" : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p className="text-sm text-ink/60 mt-6">
            มีบัญชีอยู่แล้ว{' '}
            <Link to={'/login'} className="text-ledger underline underline-offset-2">
             เข้าสู่ระบบ
            </Link>
        </p>
      </div>
    </div>
  );
};
export default Register;
