import { useMemo, useState } from "react"

const ExpenseForm = ({ initialData, categories = [], error, onSubmit,onCancel  }) => {
    const [type, setType] = useState(initialData?.type || 'expense')
    const [amount, setAmount] = useState(initialData?.amount || '')
    const [description, setDescription] = useState(initialData?.description || '')
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().slice(0,10))
    const [submitting, setSubmitting] = useState(false)
    

    const typeCategories = useMemo(
        () =>
            categories.filter(
                (c) =>
                    c.type === type &&
                    (c.is_active || c.id === initialData?.category_id)
            ),
        [categories, type, initialData?.category_id]
    )

    const [categoryId, setCategoryId] = useState(
        initialData?.category_id ?? typeCategories[0]?.id ?? ''
    )


    const handleTypeChange = (newType) => {
        setType(newType)
        const first = categories.find((c) => c.type === newType && c.is_active)
        setCategoryId(first?.id ?? '')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!categoryId) return
        setSubmitting(true)
        try {
            await onSubmit({
                type,
                amount: Number(amount),
                category_id: Number(categoryId),
                description,
                date,
            })
        } finally {
            setSubmitting(false)
        }
    }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
            {['expense','income'].map((t) => (
                <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`flex-1 py-2 text-sm border transition-colors rounded-2xl cursor-pointer ${
                    type === t
                    ? t === 'expense'
                        ? 'bg-expense text-white border-expense'
                        : 'bg-income text-white border-income'
                    : 'border-paper-line text-ink/60 hover:scale-105 transition-transform duration-500 hover:text-black'
                }`}>
                     {t === 'expense' ? 'รายจ่าย' : 'รายรับ'}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="block text-sm mb-1 text-ink/70">จำนวนเงิน (บาท)</label>
                <input 
                type="number"
                required
                min={"0.01"}
                step={"0.01"}
                value={amount}
                onChange={(e)=> setAmount(e.target.value)}
                className="w-full border border-paper-line bg-white px-3 py-2 outline-none focus:border-ledger rounded-2xl"
                />
            </div>

            <div>
                <label className="block text-sm mb-1 text-ink/70">วันที่</label>
                <input 
                type="date"
                required
                value={date}
                onChange={(e)=> setDate(e.target.value)}
                className="w-full border border-paper-line bg-white px-3 py-2 outline-none focus:border-ledger rounded-2xl"
                />
            </div>
        </div>

        <div>
            <label className="block text-sm mb-1 text-ink/70">หมวดหมู่</label>
            {error && <p className="text-expense text-sm">{error}</p>}
            <select 
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full border border-paper-line bg-white px-3 py-2 outline-none focus:border-ledger rounded-2xl"
            >
                {typeCategories.map((c) =>(
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                ))}
            </select>
        </div>

         <div>
                <label className="block text-sm mb-1 text-ink/70">รายละเอียด (ไม่บังคับ)</label>
                <input 
                type="text"
                value={description}
                onChange={(e)=> setDescription(e.target.value)}
                className="w-full border border-paper-line bg-white px-3 py-2 outline-none focus:border-ledger rounded-2xl"
                />
        </div>

        <div className="flex gap-2 pt-2">
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-ledger text-white py-2.5 hover:bg-ledger-light transition-colors disabled:opacity-50 rounded-2xl"
                >
                    {submitting? 'กำลังบันทึก...' : initialData ? 'บันทึกการแก้ไข': 'เพิ่มรายการ'}
                </button>
                 {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2.5 border border-paper-line text-ink/70 hover:bg-paper-line/30 rounded-2xl"
                    >
                        ยกเลิก
                    </button>
                )}
        </div>


    </form>
  )
}
export default ExpenseForm