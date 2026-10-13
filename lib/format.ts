export function toISO(d: Date): string {
   const m = String(d.getMonth() + 1).padStart(2, "0");
   const day = String(d.getDate()).padStart(2, "0");
   return `${d.getFullYear()}-${m}-${day}`;
}

export function parseISO(s: string): Date {
   const [y, m, d] = s.split("-").map(Number);
   return new Date(y, m - 1, d);
}

export function todayISO(): string {
   return toISO(new Date());
}

export function shiftDays(n: number): string {
   const d = new Date();
   d.setDate(d.getDate() + n);
   return toISO(d);
}

export function formatDate(s: string): string {
   return parseISO(s).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
   });
}

export function isValidISO(s: string): boolean {
   if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
   return toISO(parseISO(s)) === s;
}
