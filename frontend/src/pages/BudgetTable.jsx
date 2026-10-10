const formatMoney = (n) =>
  Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 });

const BudgetTable = ({ budgets, onEdit, onDelete,  onAdd }) => {
  if (budgets.length === 0) {
    return (
      <div onClick={onAdd} className="text-center py-16 text-ink/50 border border-dashed border-ink/30 flex items-center justify-center rounded-2xl  cursor-pointer">
        <p> ยังไม่มีรายการ เพิ่มรายการแรกของคุณได้เลย</p>
        <i className="fa fa-circle-plus p-3 text-2xl"></i>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="ledgar-row text-left text-ink/50">
            <th className="py-2 font-normal">หมวดหมู่</th>
            <th className="py-2 font-normal text-right">จำนวนเงิน</th>
            <th className="py-2 font-normal text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {budgets.map((exp) => (
            <tr key={exp.id} className="ledger-row">
              <td className="py-3">{exp.category_name}</td>
              <td
                className={`py-3 text-right tabular`}
              >
            
                {formatMoney(exp.amount)}
              </td>
              <td className="py-3 text-center space-x-3">
                <button
                  onClick={() => onEdit(exp)}
                  className="text-ledger hover:underline"
                >
                  แก้ไข
                </button>

                <button
                  onClick={() => onDelete(exp.id)}
                  className="text-expense hover:underline"
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default BudgetTable;
