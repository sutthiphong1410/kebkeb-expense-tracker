import { useEffect, useState } from "react";
import Navbar from "./../components/Navbar";
import Modal from "./../components/Modal";
import { categoryApi } from "../api/categories";
import CategoryTable from "./CategoryTable";
import CategoryForm from "../components/CategoryForm";
import { toast } from "sonner";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchCategory, setSearchCategory] = useState("");

  const [income, setIncome] = useState([]);
  const [expense, setExpense] = useState([]);

  const loadCategory = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (searchCategory) params.category = searchCategory;
      const data = await categoryApi.getAll(params);
      setCategories(data);
      setIncome(data.filter((d) => d.type === "income"));
      setExpense(data.filter((d) => d.type === "expense"));
    } catch {
      setError("โหลดรายการไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategory();
  }, [searchCategory]);

  const openAddForm = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const openEditForm = (expense) => {
    setEditingCategory(expense);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingCategory) {
      await categoryApi.update(editingCategory.id, formData);
      toast.success("บันทึกรายการแล้ว");
    } else {
      await categoryApi.create(formData);
      toast.success("บันทึกรายการแล้ว");
    }
    setShowForm(false);
    loadCategory();
  };

  const handleDelete = async (id) => {
    if (!confirm("ยืนยันการลบรายการนี้")) return;
    await categoryApi.delete(id);
    loadCategory();
    toast.success("ลบรายการแล้ว");
  };
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">หมวดหมู่</h2>
          <button
            onClick={openAddForm}
            className="bg-ledger text-white px-4 py-2 text-sm hover:bg-ledger-light transition-colors rounded-full cursor-pointer"
          >
            + เพิ่มรายการ
          </button>
        </div>

        <div className="border border-gray-300 rounded-2xl py-1 px-2 w-53 flex items-center">
          <input
            type="text"
            className="focus:outline-none text-sm"
            placeholder="ค้นหารายการ"
            onChange={(e) => setSearchCategory(e.target.value)}
          />
          <i className="fa fa-magnifying-glass text-sm text-gray-500 cursor-pointer"></i>
        </div>

        {loading && <p className="text-ink/50">กำลังโหลด...</p>}
        {error && <p className="text-expense">{error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-8 py-4">
            <CategoryTable
              categories={expense}
              type={"expense"}
              onEdit={openEditForm}
              onDelete={handleDelete}
              onAdd={openAddForm}
            />
            <CategoryTable
              categories={income}
              type={"income"}
              onEdit={openEditForm}
              onDelete={handleDelete}
              onAdd={openAddForm}
            />
          </div>
        )}
      </main>

      {showForm && (
        <Modal
          title={editingCategory ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
          onClose={() => setShowForm(false)}
        >
          <CategoryForm
            initialData={editingCategory}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}
    </div>
  );
};
export default Categories;
