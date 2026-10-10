import { useEffect, useState } from "react";
import { expenseApi } from "./../api/expenses";
import Navbar from "./../components/Navbar";
import SummaryCard from "./../components/SummaryCard";
import Categorychart from "./../components/Categorychart";
import Monthlychart from "../components/Monthlychart";
import BudgetProgress from "../components/BudgetProgress";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    expenseApi
      .getSummary(month)
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch(() => {
        if (!cancelled) setError("โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">ภาพรวมการเงิน</h2>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-paper-line bg-paper px-3 py-1 rounded-2xl"
          />
        </div>

        {loading && <p className="text-ink/50">กำลังโหลดข้อมูล...</p>}
        {error && <p className="text-expense">{error}</p>}

        {summary && (
          <>
            <SummaryCard summary={summary} />
            <div className="border border-paper-line p-5 mb-8">
              <h3 className="font-display text-lg mb-4">
                งบประมาณเทียบกับรายจ่ายจริง
              </h3>
              <BudgetProgress budgets={summary.budgets} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-paper-line p-5">
                <h3 className="font-display text-lg mb-3">
                  รายจ่ายตามหมวดหมู่
                </h3>
                <Categorychart data={summary.byCategory} />
              </div>

              <div className="border border-paper-line p-5">
                <h3 className="font-display text-lg mb-3">
                  รายรับ-รายจ่าย
                </h3>
                <Monthlychart data={summary.byMonth} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
export default Dashboard;
