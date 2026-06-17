/**
 * Calculate number of nights between two dates
 */
export const calculateNights = (checkIn: Date, checkOut: Date): number => {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate total price
 */
export const calculateTotalPrice = (pricePerNight: number, nights: number): number => {
  return Math.round(pricePerNight * nights * 100) / 100;
};

/**
 * Check if date is in the past
 */
export const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Check if dates overlap with existing bookings
 */
export const checkDateOverlap = (
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean => {
  return start1 < end2 && start2 < end1;
};

/**
 * Format date to YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Add days to a date
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Get date range (for queries)
 */
export const getDateRange = (startDate: Date, endDate: Date): { start: Date; end: Date } => {
  return {
    start: new Date(startDate),
    end: new Date(endDate),
  };
};
