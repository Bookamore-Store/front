import { parseServerDate } from '@/shared/helpers/parseServerDate';

export const formatMessageTime = (dateStr?: string | null): string => {
  if (!dateStr) return '';

  const date = parseServerDate(dateStr);

  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  return date.toLocaleDateString([], {
    day: '2-digit',
    month: '2-digit',
  });
};
