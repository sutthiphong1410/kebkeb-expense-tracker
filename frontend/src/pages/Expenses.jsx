import { useEffect, useState } from "react";
import { expenseApi } from "./../api/expenses";
import Navbar from "./../components/Navbar";
import ExpenseTable from "./ExpenseTable";
import ExpenseForm from "./../components/ExpenseForm";
import Modal from "./../components/Modal";
import dayjs from "./../../node_modules/dayjs/esm/index";
import { categoryApi } from "../api/categories";
import MonthPicker from "../components/MonthPicker";
import DayStrip from "../components/DayStrip";

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
    } else {
      await expenseApi.create(formData);
    }
    setShowForm(false);
    loadExpense();
  };

  const handleDelete = async (id) => {
    if (!confirm("ยืนยันการลบรายการนี้")) return;
    await expenseApi.delete(id);
    loadExpense();
  };
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">รายการทั้งหมด</h2>
          <button
            onClick={openAddForm}
            className="bg-ledger text-white px-4 py-2 text-sm hover:bg-ledger-light transition-colors rounded-full"
          >
            + เพิ่มรายการ
          </button>
        </div>

        <div className="flex mb-5 justify-between items-center">
          <div className="flex gap-2 py-2  text-sm ">
            <MonthPicker
              value={monthFilter}
              onChange={setMonthFilter}
              monthsWithData={monthsWithData}
            />
            

            <div className="relative space-x-1">
              {[
                { value: "", label: "ทั้งหมด" },
                { value: "income", label: "รายรับ" },
                { value: "expense", label: "รายจ่าย" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilterType(f.value)}
                  className={`px-3 py-1 border transition-colors rounded-2xl hover:bg-ledger/10 ${
                    filterType === f.value
                      ? "border-ledger text-ledger bg-ledger/5"
                      : "border-paper-line text-ink/60"
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <p className="absolute -top-5 left-1 text-gray-400 text-[10px]">
                ประเภท
              </p>
            </div>
          </div>
          <div className="border border-gray-300 rounded-2xl py-1 px-2">
            <input
              type="text"
              className="focus:outline-none text-sm"
              placeholder="ค้นหารายการ"
              onChange={(e) => setSearchCategory(e.target.value)}
            />
            <i className="fa fa-magnifying-glass text-sm text-gray-500 cursor-pointer"></i>
          </div>
        </div>
        <div className="mb-5 mt-7">
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
