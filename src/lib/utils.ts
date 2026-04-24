import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number with thousand separators (Indonesian style)
 * Example: 45000 -> "45.000"
 */
export function formatNumber(num: number | string): string {
  if (num === null || num === undefined) return '0';
  const n = typeof num === 'string' ? parseFloat(num.replace(/\./g, '')) : num;
  if (isNaN(n)) return '0';
  return n.toLocaleString('id-ID');
}

/**
 * Parse a formatted string back to number
 * Example: "45.000" -> 45000
 */
export function parseFormattedNumber(str: string | number | null | undefined): number {
  if (typeof str === 'number') return str;
  if (str === null || str === undefined) return 0;
  const cleaned = str.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Validate if input is a valid number and within range (optional)
 */
export function validateNumber(value: string, min?: number, max?: number): { valid: boolean; error?: string } {
  const num = parseFormattedNumber(value);
  if (isNaN(num)) {
    return { valid: false, error: 'Harus berupa angka' };
  }
  if (min !== undefined && num < min) {
    return { valid: false, error: `Tidak boleh kurang dari ${min}` };
  }
  if (max !== undefined && num > max) {
    return { valid: false, error: `Tidak boleh lebih dari ${max}` };
  }
  return { valid: true };
}
