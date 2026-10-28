export function phoneDigits(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('880') && digits.length >= 12) return `0${digits.slice(3)}`;
  if (digits.length === 10 && digits.startsWith('1')) return `0${digits}`;
  return digits;
}

export function phonesMatch(a: string | null | undefined, b: string | null | undefined) {
  if (!a || !b) return false;
  const left = phoneDigits(a);
  const right = phoneDigits(b);
  return left.length >= 10 && left === right;
}

export function phoneLookupValues(phone: string) {
  const digits = phoneDigits(phone);
  const values = new Set<string>([phone.trim(), digits]);
  if (digits.startsWith('0') && digits.length === 11) {
    values.add(`+880${digits.slice(1)}`);
    values.add(`880${digits.slice(1)}`);
    values.add(digits.slice(1));
  }
  return [...values].filter(Boolean);
}
