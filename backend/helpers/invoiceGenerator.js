export function generateInvoiceNumber(prefix) {
  const year = new Date().getFullYear().toString().slice(-2); // 25 for 2025
  const rand = Math.floor(10000 + Math.random() * 90000);     // 5-digit code
  return `${prefix}-${year}-${rand}`; // Example → ORD-25-83452
}
