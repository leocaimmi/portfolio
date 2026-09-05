import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Joins conditional class names and resolves Tailwind conflicts so the last
 * declaration wins. Without the merge step a caller could not override a
 * component's default padding or colour from the outside.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
