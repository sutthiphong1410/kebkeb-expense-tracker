import { useEffect, useState } from "react";
import { budgetApi } from "../api/budgets";
import { useMemo } from "react";

const BudgetForm = ({
  initialData,
  categories = [],
  error,
  monthFilter,
  onSubmit,
  onCancel,
}) => {
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
  const [amount, setAmount] = useState(initialData?.amount || "");
  const [month, setMonth] = useState(initialData?.month || monthFilter);
  const [submitting, setSubmmitting] = useState(false);
  const [submitError, setSubmmitError] = useState("");
  const [usedIds, setUsedIds] = useState([]);
  const [loadingUsed, setLoadingUsed] = useState(false);

  const expenseCategories = useMemo(
    () =>
      categories.filter(
        (c) => 
          c.type === "expense" &&
           (c.is_active || c.id === initialData?.category_id)
      ),
    [categories, initialData?.category_id]
  )

  useEffect(() => {
    let ignore = false;
    const loadUsed = async () => {
      setLoadingUsed(true);
      try {
        const data = await budgetApi.getAll({ month });
        if (ignore) return;
        const used = data
          .filter((b) => b.id !== initialData?.id)
          .map((b) => b.category_id);
        setUsedIds(used);

        setCategoryId((prev) => {
          if (prev !== "" && !used.includes(Number(prev))) return prev;
          return expenseCategories.find((c) => !used.includes(c.id))?.id ?? "";
        });
      } catch {
        if (!ignore) setUsedIds([]);
      } finally {
        if (!ignore) setLoadingUsed(false);
      }
    };
    loadUsed();
    return () => {
      ignore = true;
    };
  }, [month, initialData?.id, expenseCategories]);

  const allUsed =
    expenseCategories.length > 0 &&
    expenseCategories.every((c) => usedIds.includes(c.id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId) return;
    setSubmmitting(true);
    setSubmmitError("")
    try {
      await onSubmit({ amount: Number(amount), category_id:Number(categoryId), month });
    } catch (err){
      setSubmmitError(
        err?.response?.data?.error || err?.message || "บันทึกไม่สำเร็จ"
      )
    } finally {
      setSubmmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1 text-ink/70">หมวดหมู่</label>
        {error && <p className="text-expense">{error}</p>}
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={loadingUsed || allUsed}
          className="w-full border border-paper-line bg-white px-3 py-2 outline-none focus:border-ledger rounded-2xl"
        >
          {expenseCategories.map((c) => {
            const isUsed = usedIds.includes(c.id);
            return (
              <option key={c.id} value={c.id} disabled={isUsed}>
                {c.name}
                {isUsed ? " (สร้างแล้ว)" : ""}
              </option>
            );
          })}
        </select>
        {allUsed && (
          <p className="text-xs text-expense mt-1">
            เดือนนี้สร้างงบครบทุกหมวดหมู่แล้ว
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1 text-ink/70">
            จำนวนเงิน (บาท)
          </label>
          <input
            type="number"
            required
            min={"0.01"}
            step={"0.01"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-paper-line bg-white px-3 py-2 outline-none focus:border-ledger rounded-2xl"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-ink/70">เดือน</label>
          <input
            type="month"
            required
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full border border-paper-line bg-white px-3 py-2 outline-none focus:border-ledger rounded-2xl"
          />
        </div>
      </div>
      
      <div>
         {submitError && <p className="text-expense text-sm">{submitError}</p>}
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting || !categoryId || allUsed}
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
export default BudgetForm;
