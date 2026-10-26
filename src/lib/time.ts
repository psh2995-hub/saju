/** 한국 시간 기준 오늘 날짜 */
export function todayKST(now = new Date()) {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(now)
    .split("-")
    .map(Number);
  return { y, m, d, ymd: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` };
}
