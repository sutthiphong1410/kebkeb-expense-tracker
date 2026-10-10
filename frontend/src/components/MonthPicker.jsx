import { useEffect, useRef, useState } from "react";

const MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

const MonthPicker = ({ value, onChange, monthsWithData = [] }) => {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(Number(value.slice(0, 4)));
  const ref = useRef(null);

  // ปิดเมื่อคลิกนอกกล่อง
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ซิงก์ปีเมื่อ value เปลี่ยนจากข้างนอก
  useEffect(() => {
    setYear(Number(value.slice(0, 4)));
  }, [value]);

  const select = (m) => {
    onChange(`${year}-${String(m + 1).padStart(2, "0")}`);
    setOpen(false);
  };

  const label = `${MONTHS[Number(value.slice(5, 7)) - 1]} ${Number(value.slice(0, 4)) + 543}`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-1 border border-paper-line rounded-2xl hover:bg-ledger/10"
      >
        {label}
      </button>
      <p className="absolute -top-5 text-gray-400 text-[10px]">เดือนปี</p>

      {open && (
        <div className="absolute z-20 mt-2 w-64 bg-white border border-paper-line rounded-2xl shadow-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={() => setYear((y) => y - 1)} className="px-2 py-1 hover:bg-ledger/10 rounded-full">‹</button>
            <span className="text-sm font-medium">{year + 543}</span>
            <button type="button" onClick={() => setYear((y) => y + 1)} className="px-2 py-1 hover:bg-ledger/10 rounded-full">›</button>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((name, i) => {
              const key = `${year}-${String(i + 1).padStart(2, "0")}`;
              const hasData = monthsWithData.includes(key);
              const selected = key === value;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => select(i)}
                  className={`relative py-2 text-sm rounded-xl transition-colors ${
                    selected
                      ? "bg-ledger text-white"
                      : "hover:bg-ledger/10 text-ink/70"
                  }`}
                >
                  {name}
                  {hasData && (
                    <span
                      className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                        selected ? "bg-white" : "bg-ledger"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-ledger inline-block" /> มีข้อมูล
          </p>
        </div>
      )}
    </div>
  );
};
export default MonthPicker;