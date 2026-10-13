import { useEffect, useState } from "react";
import { expenseApi } from "./../api/expenses";
import Navbar from "./../components/Navbar";
import ExpenseTable from "./ExpenseTable";
import ExpenseForm from "./../components/ExpenseForm";
import Modal from "./../components/Modal";
import dayjs from "dayjs";
import { categoryApi } from "../api/categories";
import MonthPicker from "../components/MonthPicker";
import DayStrip from "../components/DayStrip";
import { toast } from "sonner";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState("");
  const [monthFilter, setMonthFilter] = useState(dayjs().format("YYYY-MM"));
  const [monthsWithData, setMonthsWithData] = useState([]);
  const [dayFilter, setDayFilter] = useState("");
  const [daysWithData, setDaysWithData] = useState([]);

  const TYPE_OPTIONS = [
    { value: "", label: "ทั้งหมด" },
    { value: "income", label: "รายรับ" },
    { value: "expense", label: "รายจ่าย" },
  ];

  const loadMonths = async () => {
    try {
      const months = await expenseApi.getMonths();
      setMonthsWithData(months);
    } catch (err) {
      console.error("loadMonths failed:", err);
      setMonthsWithData([]);
    }
  };

  const loadDays = async () => {
    try {
      setDaysWithData(await expenseApi.getDays(monthFilter));
    } catch {
      setDaysWithData([]);
    }
  };

  useEffect(() => {
    setDayFilter("");
    loadDays();
  }, [monthFilter]);

  useEffect(() => {
    loadMonths();
  }, []);

  const loadExpense = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (searchCategory) params.category = searchCategory;
      if (monthFilter) params.month = monthFilter;
      if (dayFilter) params.date = dayFilter;
      const data = await expenseApi.getAll(params);
      setExpenses(data);
    } catch {
      setError("โหลดรายการไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpense();
  }, [filterType, searchCategory, monthFilter, dayFilter]);

  const loadCategoriesData = async () => {
    setCategoryError("");
    try {
      const data = await categoryApi.getAll();

      setCategories(data);
    } catch {
      setCategoryError("โหลดหมวดหมู่ไม่สำเร็จ");
    }
  };

  const openAddForm = async () => {
    setEditingExpense(null);
    await loadCategoriesData();
    setShowForm(true);
  };

  const openEditForm = async (expense) => {
    setEditingExpense(expense);
    await loadCategoriesData();
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingExpense) {
      await expenseApi.update(editingExpense.id, formData);
      toast.success("บันทึกรายการแล้ว");
    } else {
      await expenseApi.create(formData);
      toast.success("บันทึกรายการแล้ว");
    }
    setShowForm(false);
    loadExpense();
  };

  const handleDelete = async (id) => {
    if (!confirm("ยืนยันการลบรายการนี้")) return;
    await expenseApi.delete(id);
    loadExpense();
    toast.success("ลบรายการแล้ว");
  };
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="flex items-center justify-between gap-3 mb-5 md:mb-6">
          <h2 className="font-display text-xl md:text-2xl">รายการทั้งหมด</h2>
          <button
            onClick={openAddForm}
            className="bg-ledger text-white px-4 py-2.5 text-sm whitespace-nowrap hover:bg-ledger-light transition-colors rounded-full cursor-pointer"
          >
            + เพิ่มรายการ
          </button>
        </div>

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-end gap-x-3 gap-y-2 text-sm">
            <MonthPicker
              value={monthFilter}
              onChange={setMonthFilter}
              monthsWithData={monthsWithData}
            />

            <div className="flex flex-col items-start gap-1">
              <p className="text-xs text-gray-400">ประเภท</p>

             
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-2xl border border-paper-line bg-white px-3  text-base text-ink/70 focus:outline-none focus:border-ledger sm:hidden"
              >
                {TYPE_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>

              <div className="hidden gap-1 sm:flex">
                {TYPE_OPTIONS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilterType(f.value)}
                    className={`px-3 py-1.5 border transition-colors rounded-2xl hover:bg-ledger/10 ${
                      filterType === f.value
                        ? "border-ledger text-ledger bg-ledger/5"
                        : "border-paper-line text-ink/60"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex w-full items-center rounded-2xl border border-gray-300 px-3 py-1.5 md:w-auto">
            <input
              type="text"
              className="min-w-0 flex-1 text-base focus:outline-none md:text-sm"
              placeholder="ค้นหารายการ"
              onChange={(e) => setSearchCategory(e.target.value)}
            />
            <i className="fa fa-magnifying-glass text-sm text-gray-500"></i>
          </div>
        </div>

        <div className="mb-5  max-w-full overflow-x-auto">
             <p className="absolute -top-10 text-gray-400 text-[10px]">วันที่</p>
          <DayStrip
            month={monthFilter}
            value={dayFilter}
            onChange={setDayFilter}
            daysWithData={daysWithData}
          />
        </div>

        {loading && <p className="text-ink/50">กำลังโหลด...</p>}
        {error && <p className="text-expense">{error}</p>}
        {!loading && !error && (
          <ExpenseTable
            expenses={expenses}
            onEdit={openEditForm}
            onDelete={handleDelete}
            onAdd={openAddForm}
          />
        )}
      </main>

      {showForm && (
        <Modal
          title={editingExpense ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
          onClose={() => setShowForm(false)}
        >
          <ExpenseForm
            initialData={editingExpense}
            onSubmit={handleFormSubmit}
            categories={categories}
            error={categoryError}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}
    </div>
  );
};
export default Expenses;
