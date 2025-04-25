// --- Helper Functions (Simulating date-fns) ---
export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const endOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

export const startOfWeek = (date: Date): Date => {
  const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const diff = date.getDate() - dayOfWeek; // Calculate difference to get Sunday
  const newDate = new Date(date); // Create a new Date object to avoid modifying the original
  newDate.setDate(diff);
  newDate.setHours(0, 0, 0, 0); // Reset time to the beginning of the day
  return newDate;
};

export const endOfWeek = (date: Date): Date => {
  const dayOfWeek = date.getDay();
  const diff = date.getDate() + (6 - dayOfWeek); // Calculate difference to get Saturday
  const newDate = new Date(date);
  newDate.setDate(diff);
  newDate.setHours(23, 59, 59, 999); // Set time to the end of the day
  return newDate;
};

export const eachDayOfInterval = (start: Date, end: Date): Date[] => {
  const dates: Date[] = [];
  let currentDate = new Date(start);
  currentDate.setHours(0, 0, 0, 0);
  let finalDate = new Date(end);
  finalDate.setHours(0, 0, 0, 0);

  // Swap if start is after end
  if (currentDate > finalDate) {
    [currentDate, finalDate] = [finalDate, currentDate];
  }

  while (currentDate <= finalDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

export const addMonths = (date: Date, amount: number): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + amount);
  return newDate;
};

export const subMonths = (date: Date, amount: number): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() - amount);
  return newDate;
};

export const isSameDay = (date1: Date | null, date2: Date | null): boolean => {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const isSameMonth = (date1: Date, date2: Date): boolean =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth();

export const isWithinInterval = (
  date: Date,
  start: Date | null,
  end: Date | null
): boolean => {
  // Updated for potential nulls and correct order
  if (!start || !end) return false;
  const time = new Date(date).setHours(0, 0, 0, 0);
  let startTime = new Date(start).setHours(0, 0, 0, 0);
  let endTime = new Date(end).setHours(0, 0, 0, 0);

  // Ensure start <= end
  if (startTime > endTime) {
    [startTime, endTime] = [endTime, startTime];
  }
  return time >= startTime && time <= endTime;
};

// parseDateKey is needed now
export const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split("-").map(Number);
  // Return date object set to the beginning of the day UTC to avoid timezone issues?
  // Or assume local time is fine for this app's scope.
  // For now, local time:
  return new Date(year, month - 1, day);
};
