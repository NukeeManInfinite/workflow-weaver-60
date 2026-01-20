import { format, parseISO, isValid } from 'date-fns';

/**
 * Check if a date string is valid and not a placeholder date from backend
 * Backend often returns '0001-01-01' for null/empty dates
 */
export const isValidDate = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;
  
  // Filter out placeholder dates from backend
  if (dateString.startsWith('0001-01-01') || dateString.startsWith('1957-01-')) {
    return false;
  }
  
  try {
    const date = parseISO(dateString);
    return isValid(date) && date.getFullYear() > 1970;
  } catch {
    return false;
  }
};

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString: string, formatStr: string = 'MMM dd, yyyy'): string => {
  if (!isValidDate(dateString)) return '';
  
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch {
    return '';
  }
};

/**
 * Format a date string to a readable format with time
 */
export const formatDateTime = (dateString: string): string => {
  return formatDate(dateString, 'MMM dd, yyyy HH:mm');
};

/**
 * Format a date string to relative time (e.g., "2 hours ago")
 */
export const formatRelativeDate = (dateString: string): string => {
  if (!isValidDate(dateString)) return '';
  
  try {
    const date = parseISO(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatDate(dateString);
  } catch {
    return '';
  }
};
