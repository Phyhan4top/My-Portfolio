const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Months since year 0, from an ISO month such as "2025-04". */
export function monthIndex(isoMonth: string): number {
  const [year, month] = isoMonth.split("-").map(Number);
  return year * 12 + (month - 1);
}

export function currentMonthIndex(now = new Date()): number {
  return now.getFullYear() * 12 + now.getMonth();
}

export function formatMonth(isoMonth: string): string {
  const [year, month] = isoMonth.split("-").map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

/** Duration as a person would say it, counting both the first and last month. */
export function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(`${years} yr`);
  if (rest || !years) parts.push(`${rest} mo`);
  return parts.join(" ");
}
