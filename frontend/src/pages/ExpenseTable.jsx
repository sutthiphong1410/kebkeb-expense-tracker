import dayjs from "dayjs";

const formatMoney = (n) =>
  Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 });

const ExpenseTable = ({ expenses, onEdit, onDelete, onAdd }) => {
  if (expenses.length === 0) {
    return (
      <div
        onClick={onAdd}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/30 px-4 py-16 text-center text-ink/50 sm:flex-row"
      >
        <p>ยังไม่มีรายการ เพิ่มรายการแรกของคุณได้เลย</p>
        <i className="fa fa-circle-plus p-1 text-2xl"></i>
      </div>
    );
  }

  return (
    <>
      {/* มือถือ: การ์ด */}
      <ul className="space-y-3 md:hidden">
        {expenses.map((exp) => (
          <li
            key={exp.id}
            className="rounded-2xl border border-paper-line bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="break-words font-medium">{exp.category_name}</p>
                <p className="text-xs text-ink/50">
                  {dayjs(exp.date).format("DD/MM/YYYY")}
                </p>
              </div>
              <p
                className={`shrink-0 font-medium tabular ${
                  exp.type === "income" ? "text-income" : "text-expense"
                }`}
              >
                {exp.type === "income" ? "+" : "-"}
                {formatMoney(exp.amount)}
              </p>
            </div>

            {exp.description && (
              <p className="mt-2 break-words text-sm text-ink/60">
                {exp.description}
              </p>
            )}

            <div className="mt-3 flex justify-end gap-5 border-t border-paper-line pt-3 text-sm">
              <button onClick={() => onEdit(exp)} className="py-1 text-ledger">
                แก้ไข
              </button>
              <button
                onClick={() => onDelete(exp.id)}
                className="py-1 text-expense"
              >
                ลบ
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* จอใหญ่: ตาราง */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="ledgar-row text-left text-ink/50">
              <th className="py-2 font-normal">วันที่</th>
              <th className="py-2 font-normal">หมวดหมู่</th>
              <th className="py-2 font-normal">รายละเอียด</th>
              <th className="py-2 text-right font-normal">จำนวนเงิน</th>
              <th className="py-2 text-center font-normal">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id} className="ledger-row">
                <td className="py-3 text-ink/70">
                  {dayjs(exp.date).format("DD/MM/YYYY")}
                </td>
                <td className="py-3">{exp.category_name}</td>
                <td className="max-w-xs break-words py-3 text-ink/60">
                  {exp.description || "-"}
                </td>
                <td
                  className={`py-3 text-right tabular ${
                    exp.type === "income" ? "text-income" : "text-expense"
                  }`}
                >
                  {exp.type === "income" ? "+" : "-"}
                  {formatMoney(exp.amount)}
                </td>
                <td className="space-x-3 py-3 text-center">
                  <button
                    onClick={() => onEdit(exp)}
                    className="cursor-pointer text-ledger hover:underline"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => onDelete(exp.id)}
                    className="cursor-pointer text-expense hover:underline"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
export default ExpenseTable;
