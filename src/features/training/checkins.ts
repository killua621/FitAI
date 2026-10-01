export const weekdayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;

export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getCurrentWeekCheckins(checkinDates: string[], now = new Date()) {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const mondayOffset = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - mondayOffset);
  const days = weekdayLabels.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const key = localDateKey(date);
    return { label, key, checkedIn: checkinDates.includes(key), isToday: key === localDateKey(now) };
  });
  return { days, count: days.filter((day) => day.checkedIn).length };
}

