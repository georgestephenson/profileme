// Currency preference, stored once in the profile and used on every screen
// that shows money. Only formatting — the app never converts amounts.

import { getProfile, update } from './store.js';

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD — US dollar ($)' },
  { code: 'GBP', symbol: '£', label: 'GBP — British pound (£)' },
  { code: 'EUR', symbol: '€', label: 'EUR — Euro (€)' },
  { code: 'JPY', symbol: '¥', label: 'JPY — Japanese yen (¥)' },
  { code: 'CNY', symbol: '¥', label: 'CNY — Chinese yuan (¥)' },
  { code: 'INR', symbol: '₹', label: 'INR — Indian rupee (₹)' },
  { code: 'AUD', symbol: 'A$', label: 'AUD — Australian dollar (A$)' },
  { code: 'CAD', symbol: 'C$', label: 'CAD — Canadian dollar (C$)' },
  { code: 'CHF', symbol: 'CHF ', label: 'CHF — Swiss franc' },
  { code: 'BRL', symbol: 'R$', label: 'BRL — Brazilian real (R$)' },
  { code: 'MXN', symbol: 'MX$', label: 'MXN — Mexican peso (MX$)' },
  { code: 'ZAR', symbol: 'R', label: 'ZAR — South African rand (R)' },
  { code: 'KRW', symbol: '₩', label: 'KRW — South Korean won (₩)' },
  { code: 'SEK', symbol: 'kr ', label: 'SEK — Swedish krona (kr)' },
  { code: 'NGN', symbol: '₦', label: 'NGN — Nigerian naira (₦)' },
  { code: 'none', symbol: '', label: 'No symbol' },
];

export function getCurrency() {
  const code = getProfile().settings?.currency || 'USD';
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
}

export function setCurrency(code) {
  update('settings', { ...(getProfile().settings || {}), currency: code });
}

export function money(n) {
  return `${getCurrency().symbol}${Math.round(n).toLocaleString()}`;
}
