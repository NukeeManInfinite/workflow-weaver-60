import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isValid, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a notification date, handling invalid dates (like 0001-01-01)
 */
export function formatNotificationDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = parseISO(dateString);
    
    // Check for invalid/placeholder dates (year < 1900 or invalid)
    if (!isValid(date) || date.getFullYear() < 1900) {
      return '';
    }
    
    return format(date, 'MMM dd, yyyy • HH:mm');
  } catch {
    return '';
  }
}
