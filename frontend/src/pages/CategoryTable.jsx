const CategoryTable = ({ categories, type, onEdit, onDelete, onAdd }) => {
  if (categories.length === 0) {
    return (
      <div
        onClick={onAdd}
        className="text-center py-16 text-ink/50 border border-dashed border-ink/30 flex items-center justify-center rounded-2xl  cursor-pointer"
      >
        <p> ยังไม่มีรายการ เพิ่มรายการแรกของคุณได้เลย</p>
        <i className="fa fa-circle-plus p-3 text-2xl"></i>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <h1
        className={
          type === "expense"
            ? "font-light py-2 text-expense"
            : "font-light py-2 text-income"
        }
      >
        {type == "expense" ? "รายจ่าย" : "รายได้"}
      </h1>
      <table className="w-full text-sm rounded-2xl overflow-hidden">
        <thead>
          <tr
            className={
              type === "expense"
                ? "ledgar-row text-left text-white bg-expense"
                : "ledgar-row text-left text-white bg-income"
            }
          >
            <th className="py-2 font-normal pl-2">หมวดหมู่</th>
            <th className="py-2 font-normal text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((exp) => (
            <tr key={exp.id} className="ledger-row">
              <td className="py-3 pl-2">{exp.name}</td>
              <td className="py-3 text-center space-x-3">
                <button
                  onClick={() => onEdit(exp)}
                  className="text-ledger hover:underline cursor-pointer"
                >
                  แก้ไข
                </button>

                <button
                  onClick={() => onDelete(exp.id)}
                  className="text-expense hover:underline cursor-pointer"
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
export default CategoryTable;
