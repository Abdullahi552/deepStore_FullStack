// All monetary values in DeepStore are stored and exchanged as INTEGERS
// in the smallest currency unit (kobo for NGN, cents for USD, etc.).
//
// Example: ₦2,500.00 is stored as 250000.
//
// The backend NEVER stores or returns decimal money. The frontend is
// responsible for formatting 250000 into "₦2,500.00" for display.

export const CURRENCY = 'NGN';

export const CURRENCY_MINOR_UNIT = 'kobo';

// 1 NGN = 100 kobo
export const MINOR_UNITS_PER_MAJOR = 100;

// Default shipping fee for MVP, in kobo (₦1,500.00)
export const DEFAULT_SHIPPING_FEE = 150000;

// Free shipping threshold, in kobo (₦50,000.00)
export const FREE_SHIPPING_THRESHOLD = 5000000;