/**
 * Jalali calendar conversion (based on jalaali-js algorithm).
 * Storage/API dates remain ISO Gregorian (YYYY-MM-DD).
 */

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export const JALALI_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

const breaks = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192,
  2262, 2324, 2394, 2456, 2528,
];

function jalCal(jy: number) {
  const bl = breaks.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jm = 0;
  let jump = 0;

  for (let i = 1; i < bl; i += 1) {
    const jmBreak = breaks[i];
    jump = jmBreak - jp;
    if (jy < jmBreak) break;
    leapJ += Math.floor(jump / 33) * 8 + Math.floor((jump % 33) / 4);
    jp = jmBreak;
    jm = i;
  }

  const n = jy - jp;
  leapJ += Math.floor(n / 33) * 8 + Math.floor(((n % 33) + 3) / 4);
  if (jump % 33 === 4 && jump - n === 4) leapJ += 1;

  const leapG = Math.floor(gy / 4) - Math.floor((Math.floor(gy / 100) + 1) * 3 / 4) - 150;
  const march = 20 + leapJ - leapG;

  if (jump - n < 6) n = n - jump + Math.floor((jump + 4) / 33) * 33;
  let leap = Math.floor(((n + 1) % 33) - 1) / 4;
  if (leap === -1) leap = 4;

  return { leap, gy, march };
}

export function toJalaali(gy: number, gm: number, gd: number) {
  const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    gdm[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

export function toGregorian(jy: number, jm: number, jd: number) {
  const { gy, march } = jalCal(jy);
  let days =
    (jm - 1) * 31 -
    Math.floor(jm / 7) * (jm - 7) +
    jd -
    1 +
    march;
  let gm = 1;
  let gd = 1;
  if (days <= 185) {
    gm = 1 + Math.floor(days / 31);
    gd = (days % 31) + 1;
  } else {
    days -= 186;
    gm = 7 + Math.floor(days / 30);
    gd = (days % 30) + 1;
  }
  return { gy, gm, gd };
}

export function jalaaliMonthLength(jy: number, jm: number) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return jalCal(jy).leap === 0 ? 30 : 29;
}

export function isValidJalaaliDate(jy: number, jm: number, jd: number) {
  return (
    jy >= 1 &&
    jy <= 9378 &&
    jm >= 1 &&
    jm <= 12 &&
    jd >= 1 &&
    jd <= jalaaliMonthLength(jy, jm)
  );
}

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

export function toEnglishDigits(value: string): string {
  return value.replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)));
}

export function isoToJalaliParts(isoDate: string): { jy: number; jm: number; jd: number } | null {
  if (!isoDate) return null;
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const gy = Number(match[1]);
  const gm = Number(match[2]);
  const gd = Number(match[3]);
  if (gm < 1 || gm > 12 || gd < 1 || gd > 31) return null;
  return toJalaali(gy, gm, gd);
}

export function jalaliPartsToIso(jy: number, jm: number, jd: number): string | null {
  if (!isValidJalaaliDate(jy, jm, jd)) return null;
  const { gy, gm, gd } = toGregorian(jy, jm, jd);
  return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
}

export function isoToJalaliInput(isoDate: string): string {
  const parts = isoToJalaliParts(isoDate);
  if (!parts) return '';
  const { jy, jm, jd } = parts;
  return toPersianDigits(
    `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`,
  );
}

export function jalaliInputToIso(input: string): string | null {
  const normalized = toEnglishDigits(input.trim()).replace(/[.\-]/g, '/');
  const segments = normalized.split('/').filter(Boolean);
  if (segments.length !== 3) return null;
  const [jy, jm, jd] = segments.map(Number);
  if (!Number.isFinite(jy) || !Number.isFinite(jm) || !Number.isFinite(jd)) return null;
  return jalaliPartsToIso(jy, jm, jd);
}
