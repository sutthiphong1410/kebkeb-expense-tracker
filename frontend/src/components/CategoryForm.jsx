import { useState } from "react";

const CategoryForm = ({ initialData, onSubmit, onCancel }) => {
  const [type, setType] = useState(initialData?.type || "expense");
  const [name, setName] = useState(initialData?.name || "");
  const [submitting, setSubmmitting] = useState(false);

  const handleTypeChange = (newType) => {
    setType(newType);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmmitting(true);
    try {
      await onSubmit({ type, name });
    } finally {
      setSubmmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        {["expense", "income"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTypeChange(t)}
            className={`flex-1 py-2 text-sm border transition-colors rounded-2xl cursor-pointer ${
              type === t
                ? t === "expense"
                  ? "bg-expense text-white border-expense"
                  : "bg-income text-white border-income"
                : "border-paper-line text-ink/60 hover:scale-105 transition-transform duration-500 hover:text-black"
            }`}
          >
            {t === "expense" ? "รายจ่าย" : "รายรับ"}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm mb-1 text-ink/70">ชื่อหมวดหมู่</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-paper-line bg-white px-3 py-2 outline-none focus:border-ledger rounded-2xl"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-ledger text-white py-2.5 hover:bg-ledger-light transition-colors disabled:opacity-50 rounded-2xl cursor-pointer"
        >
          {submitting
            ? "กำลังบันทึก..."
            : initialData
              ? "บันทึกการแก้ไข"
              : "เพิ่มรายการ"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 border border-paper-line text-ink/70 hover:bg-paper-line/30 rounded-2xl cursor-pointer"
          >
            ยกเลิก
          </button>
        )}
      </div>
    </form>
  );
};
export default CategoryForm;
