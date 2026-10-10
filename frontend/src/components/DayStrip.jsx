import dayjs from "dayjs";

const DayStrip = ({ month, value, onChange, daysWithData = [] }) => {
  const total = dayjs(`${month}-01`).daysInMonth();
  const days = Array.from({ length: total }, (_, i) => {
    const d = String(i + 1).padStart(2, "0");
    return { n: i + 1, key: `${month}-${d}` };
  });

  return (
    <div className="relative">
      <p className="absolute -top-5 text-gray-400 text-[10px]">วันที่</p>

      <p className="absolute -top-5 left-8 text-[10px] text-gray-400">
        (<span className="w-1.5 h-1.5 rounded-full bg-ledger inline-block" />{" "}
        มีข้อมูล)
      </p>
      <div className="flex gap-1 overflow-x-auto max-w-full pb-1">
        {days.map(({ n, key }) => {
          const selected = key === value;
          const hasData = daysWithData.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(selected ? "" : key)}
              className={`relative shrink-0 w-8 h-8 text-xs rounded-full transition-colors ${
                selected
                  ? "bg-ledger text-white"
                  : "hover:bg-ledger/10 text-ink/70"
              }`}
            >
              {n}
              {hasData && (
                <span
                  className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                    selected ? "bg-white" : "bg-ledger"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default DayStrip;
