import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

  const hasNoData =
    summary &&
    summary.byMonth.length === 0 &&
    summary.byCategory.length === 0 &&
    summary.budgets.length === 0;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="font-display text-xl md:text-2xl">ภาพรวมการเงิน</h2>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-paper-line bg-paper px-3 py-1 rounded-2xl"
          />
        </div>

        {loading && <p className="text-ink/50">กำลังโหลดข้อมูล...</p>}
        {error && <p className="text-expense">{error}</p>}

        {summary && hasNoData && (
          <div className="border border-dashed border-paper-line bg-white px-6 py-10 text-center rounded-2xl">
            <p className="font-display text-xl text-ink">
              ยังไม่มีข้อมูลแรกในเดือนนี้เลย
            </p>
            <p className="mt-2 text-sm text-ink/50">
              เริ่มจากบันทึกรายรับหรือรายจ่ายรายการแรก
              แล้วภาพรวมและกราฟจะแสดงที่นี่
            </p>

            <ol className="mx-auto mt-6 max-w-sm space-y-3 text-left text-sm text-ink/70">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ledger text-xs text-white">
                  1
                </span>
                <span>เพิ่ม รายรับ-รายจ่ายที่เมนู “รายการทั้งหมด” หรือ คลิกเพิ่มรายการแรกด้านล่างได้เลย</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ledger text-xs text-white">
                  2
                </span>
                <span>ตั้งงบประมาณรายเดือนของแต่ละหมวด (ไม่บังคับ)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ledger text-xs text-white">
                  3
                </span>
                <span>กลับมาดูสรุปและกราฟที่หน้านี้</span>
              </li>
            </ol>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/expenses"
                className="rounded-full bg-ledger px-5 py-2.5 text-sm text-white transition-colors hover:bg-ledger-light"
              >
                + เพิ่มรายการแรก
              </Link>
              <Link
                to="/budgets"
                className="rounded-full border border-paper-line px-5 py-2.5 text-sm text-ink/70 transition-colors hover:bg-ledger/10"
              >
                ตั้งงบประมาณ
              </Link>
            </div>
          </div>
        )}

        {summary && !hasNoData && (
          <>
            <SummaryCard summary={summary} />

            <div className="border border-paper-line p-5 mb-8 rounded-2xl">
              <h3 className="font-display text-lg mb-4">
                งบประมาณเทียบกับรายจ่ายจริง
              </h3>
              {summary.budgets.length === 0 ? (
                <div className="text-center text-sm text-ink/50">
                  <p>ยังไม่ได้ตั้งงบประมาณเดือนนี้</p>
                  <Link
                    to="/budgets"
                    className="mt-3 inline-block rounded-full border border-paper-line px-4 py-1.5 text-ink/70 transition-colors hover:bg-ledger/10"
                  >
                    ตั้งงบประมาณ
                  </Link>
                </div>
              ) : (
                <BudgetProgress budgets={summary.budgets} />
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="border border-paper-line p-5 rounded-2xl">
                <h3 className="font-display text-lg mb-3">รายจ่ายตามหมวดหมู่</h3>
                {summary.byCategory.length === 0 ? (
                  <p className="py-8 text-center text-sm text-ink/50">
                    ยังไม่มีรายจ่ายในเดือนนี้
                  </p>
                ) : (
                  <Categorychart data={summary.byCategory} />
                )}
              </div>

              <div className="border border-paper-line p-5 rounded-2xl">
                <h3 className="font-display text-lg mb-3">รายรับ-รายจ่าย</h3>
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