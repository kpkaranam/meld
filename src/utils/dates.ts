import { format, formatDistanceToNow, isBefore, startOfDay } from 'date-fns';

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatRelativeDate(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(date: Date | string): boolean {
  return isBefore(new Date(date), startOfDay(new Date()));
}
