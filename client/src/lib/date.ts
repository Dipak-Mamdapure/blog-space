import { format, formatDistanceToNow as originalFormatDistanceToNow } from 'date-fns';

// Format a date into a readable string (e.g., "2 hours ago")
export function formatDistanceToNow(date: Date): string {
  return originalFormatDistanceToNow(date, { addSuffix: true });
}

// Format a date to a specific pattern
export function formatDate(date: Date, pattern: string = 'PP'): string {
  return format(date, pattern);
}