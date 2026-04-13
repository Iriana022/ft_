export const isWithinDateRange = (
  value: Date | string,
  fromDate: string,
  toDate: string,
): boolean => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  if (fromDate) {
    const from = new Date(fromDate + 'T00:00:00');
    if (date < from) return false;
  }

  if (toDate) {
    const to = new Date(toDate + 'T23:59:59.999');
    if (date > to) return false;
  }

  return true;
};
