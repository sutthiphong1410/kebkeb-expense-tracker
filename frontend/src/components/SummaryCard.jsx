const formatMoney = (n) => Number(n).toLocaleString('th-TH', {minimumFractionDigits: 2 })

const SummaryCard = ({summary}) => {
    const cards = [
    { label: 'รายรับรวม', value: summary.totalIncome, color: 'text-income' },
    { label: 'รายจ่ายรวม', value: summary.totalExpense, color: 'text-expense' },
    { label: 'คงเหลือ', value: summary.balance, color: summary.balance >= 0 ? 'text-ledger' : 'text-expense' },
   
    ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-paper-line border border-paper-line mb-8">
        {cards.map((card) => (
            <div key={card.label} className="bg-paper p-5">
                <p className="text-sm text-ink/50 mb-1">{card.label}</p>
                <p className={`font-display text-2xl tabular ${card.color}`}>
                    ฿{formatMoney(card.value)}
                </p>
            </div>
        ))}
    </div>
  )
}
export default SummaryCard