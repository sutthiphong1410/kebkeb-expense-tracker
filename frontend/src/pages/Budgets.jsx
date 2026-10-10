import { useEffect, useState } from "react";
import { budgetApi } from "../api/budgets";
import Navbar from "./../components/Navbar";
import BudgetTable from "./BudgetTable";
import BudgetForm from "../components/BudgetForm";
import Modal from "./../components/Modal";
import dayjs from "./../../node_modules/dayjs/esm/index";
import { categoryApi } from "../api/categories";

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [searchCategory, setSearchCategory] = useState("");
  const [monthFilter, setMonthFilter] = useState(dayjs().format("YYYY-MM"));
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState("");

  const loadBudget = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (searchCategory) params.category = searchCategory;
      if (monthFilter) params.month = monthFilter;
      const data = await budgetApi.getAll(params);
      setBudgets(data);
    } catch {
      setError("โหลดรายการไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudget();
  }, [monthFilter, searchCategory]);

  const loadCategoriesData = async () => {
    setCategoryError("");
    try {
      const data = await categoryApi.getAll();

      setCategories(data.filter((d)=>d.type === 'expense'));
    } catch {
      setCategoryError("โหลดหมวดหมู่ไม่สำเร็จ");
    }
  };

  const openAddForm = async () => {
    setEditingBudget(null);
    await loadCategoriesData();
    setShowForm(true);
  };

  const openEditForm = async (budget) => {
    setEditingBudget(budget);
    await loadCategoriesData();
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingBudget) {
      await budgetApi.update(editingBudget.id, formData);
    } else {
      await budgetApi.create(formData);
    }
    setShowForm(false);
    loadBudget();
  };

  const handleDelete = async (id) => {
    if (!confirm("ยืนยันการลบรายการนี้")) return;
    await budgetApi.delete(id);
    loadBudget();
  };
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">จัดการงบประมาณ</h2>
          <button
            onClick={openAddForm}
            className="bg-ledger text-white px-4 py-2 text-sm hover:bg-ledger-light transition-colors rounded-full"
          >
            + เพิ่มรายการ
          </button>
        </div>

        <div className="flex mb-5 justify-between items-center">
          <div className="flex gap-2 py-2  text-sm ">
            <div className="relative">
              <input
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                type="month"
                className="px-3 py-1 border border-paper-line focus:outline-none rounded-2xl hover:bg-ledger/10"
              />
              <p className="absolute -top-5 text-gray-400 text-[10px]">
                เดือนปี
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

        {loading && <p className="text-ink/50">กำลังโหลด...</p>}
        {error && <p className="text-expense">{error}</p>}
        {!loading && !error && (
          <BudgetTable
            budgets={budgets}
            onEdit={openEditForm}
            onDelete={handleDelete}
            onAdd={openAddForm}
          />
        )}
      </main>

      {showForm && (
        <Modal
          title={editingBudget ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
          onClose={() => setShowForm(false)}
        >
          <BudgetForm
            initialData={editingBudget}
            monthFilter={monthFilter}
            categories={categories}
            error={categoryError}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}
    </div>
  );
};
export default Budgets;
