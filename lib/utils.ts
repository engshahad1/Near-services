// تنسيقات الوقت والتاريخ
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// تنسيق العملة
export function formatPrice(amount: number, currency = 'SAR'): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency,
  }).format(amount);
}

// مولد ID عشوائي
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 10)}`;
}

// Sleep Helper (تأخير برمجي)
export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));
