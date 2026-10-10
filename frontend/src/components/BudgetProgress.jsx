const formatMoney = (n) =>
  Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 });

const getStatus = (pct) => {
  if (pct > 100)
    return { bar: "bg-expense", text: "text-expense", label: "เกินงบ" };
  if (pct >= 80)
    return { bar: "bg-amber-500", text: "text-amber-600", label: "ใกล้เต็ม" };
  return { bar: "bg-income", text: "text-ink/60", label: "" };
};

const BudgetProgress = ({ budgets }) => {
  if (budgets.length === 0) {
    return (
      <p className="text-ink/50 text-sm py-8 text-center">
        ยังไม่ได้ตั้งงบประมาณสำหรับเดือนนี้
      </p>
    );
  }
  return (
    <ul className="space-y-5">
      {budgets.map((b) => {
        const pct = (b.spent / b.budget) * 100;
        const s = getStatus(pct);
        const remaining = b.budget - b.spent;
        return (
          <li key={b.budget_id}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-medium">{b.category}</span>
              <span className={`text-sm tabular ${s.text}`}>
                {s.label && <b className="mr-2">{s.label}</b>}
                {pct.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-paper-line">
              <div
                className={`h-full ${s.bar} transition-all`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-ink/50 mt-1 tabular">
              <span>
                ใช้ไป ฿{formatMoney(b.spent)} / ฿{formatMoney(b.budget)}
              </span>
              <span>
                {remaining >= 0
                  ? `เหลือ ฿${formatMoney(remaining)}`
                  : `เกิน ฿${formatMoney(-remaining)}`}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
export default BudgetProgress;
