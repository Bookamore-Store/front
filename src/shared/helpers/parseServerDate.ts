export const parseServerDate = (dateStr: string): Date => {
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(dateStr);

  return new Date(hasTimezone ? dateStr : `${dateStr}Z`);
};
