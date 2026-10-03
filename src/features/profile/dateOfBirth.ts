export function calculateAge(dateOfBirth: string | null | undefined, today = new Date()) {
  if (!dateOfBirth) return null;
  const birth = new Date(`${dateOfBirth.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(birth.getTime()) || birth > today) return null;
  let age = today.getFullYear() - birth.getFullYear();
  const birthdayHasPassed = today.getMonth() > birth.getMonth()
    || (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!birthdayHasPassed) age -= 1;
  return age;
}

export function parseBrazilianDate(value: string) {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), 12);
  if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day) || date > new Date()) return null;
  return `${year}-${month}-${day}`;
}

export function formatBrazilianDate(value: string | null | undefined) {
  if (!value) return '';
  const [year, month, day] = value.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}
