export const VN_TZ = "Asia/Ho_Chi_Minh";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function getVnYmd(date = new Date()): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: VN_TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const num = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { y: num("year"), m: num("month"), d: num("day") };
}

/** Start of a calendar day in Vietnam (UTC+7, no DST). */
export function vnDayStart(y: number, m: number, d: number): number {
  return Date.parse(`${y}-${pad(m)}-${pad(d)}T00:00:00+07:00`);
}

export function vnDayEnd(y: number, m: number, d: number): number {
  return Date.parse(`${y}-${pad(m)}-${pad(d)}T23:59:59.999+07:00`);
}

export function startOfVnToday(date = new Date()): number {
  const { y, m, d } = getVnYmd(date);
  return vnDayStart(y, m, d);
}

export function startOfVnWeek(date = new Date()): number {
  const { y, m, d } = getVnYmd(date);
  const noon = Date.parse(`${y}-${pad(m)}-${pad(d)}T12:00:00+07:00`);
  const weekday = new Date(noon).getUTCDay();
  const daysFromMonday = (weekday + 6) % 7;
  return vnDayStart(y, m, d) - daysFromMonday * 86_400_000;
}

export function startOfVnMonth(date = new Date()): number {
  const { y, m } = getVnYmd(date);
  return vnDayStart(y, m, 1);
}

export function startOfVnYear(date = new Date()): number {
  const { y } = getVnYmd(date);
  return vnDayStart(y, 1, 1);
}

export function lastDayOfVnMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function addVnDays(startMs: number, days: number): number {
  return startMs + days * 86_400_000;
}

export function formatDate(ts: number): string {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: VN_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(ts);
}

export function formatDateTime(ts: number): string {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: VN_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(ts);
}

export function formatWeekdayDate(ts: number): string {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: VN_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(ts);
}

export function toInputDate(ts: number): string {
  const { y, m, d } = getVnYmd(new Date(ts));
  return `${y}-${pad(m)}-${pad(d)}`;
}

export function fromInputDate(value: string, end = false): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return Date.now();
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  return end ? vnDayEnd(y, m, d) : vnDayStart(y, m, d);
}
