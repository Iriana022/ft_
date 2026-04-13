type DateRangeFilterProps = {
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onClear: () => void;
};

export default function DateRangeFilter({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onClear,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-md border border-gray-200 bg-white px-4 py-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Date debut</label>
        <input
          type="date"
          value={fromDate}
          max={toDate || undefined}
          onChange={(e: any) => onFromDateChange(e.target.value)}
          className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:border-navy focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Date fin</label>
        <input
          type="date"
          value={toDate}
          min={fromDate || undefined}
          onChange={(e: any) => onToDateChange(e.target.value)}
          className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:border-navy focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={onClear}
        className="h-10 rounded-md border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-50"
      >
        Reinitialiser
      </button>
    </div>
  );
}
