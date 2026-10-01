export const NAMA_BULAN = [
  'JANUARI',
  'FEBRUARI',
  'MARET',
  'APRIL',
  'MEI',
  'JUNI',
  'JULI',
  'AGUSTUS',
  'SEPTEMBER',
  'OKTOBER',
  'NOVEMBER',
  'DESEMBER'
];

export const NAMA_HARI = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu'
];

// Standar Hari Libur Nasional Indonesia (perkiraan berulang)
export const LIBUR_NASIONAL_DEFAULT: Record<string, string> = {
  '01-01': 'Tahun Baru Masehi',
  '05-01': 'Hari Buruh Internasional',
  '06-01': 'Hari Lahir Pancasila',
  '08-17': 'Hari Kemerdekaan RI',
  '10-01': 'Hari Kesaktian Pancasila',
  '10-28': 'Hari Sumpah Pemuda',
  '11-10': 'Hari Pahlawan',
  '12-25': 'Hari Raya Natal',
};

export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function getDayName(year: number, monthIndex: number, day: number): string {
  const date = new Date(year, monthIndex, day);
  return NAMA_HARI[date.getDay()];
}

export function isWeekendDay(year: number, monthIndex: number, day: number, polaKerja: '5_HARI' | '6_HARI'): boolean {
  const date = new Date(year, monthIndex, day);
  const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
  if (polaKerja === '5_HARI') {
    return dayOfWeek === 0 || dayOfWeek === 6; // Minggu & Sabtu libur
  } else {
    return dayOfWeek === 0; // Hanya Minggu libur
  }
}

export function checkHoliday(year: number, monthIndex: number, day: number, customHolidays?: Record<string, string>): { isHoliday: boolean; name?: string } {
  const monthStr = String(monthIndex + 1).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  const keyMD = `${monthStr}-${dayStr}`;
  const keyYMD = `${year}-${monthStr}-${dayStr}`;

  if (customHolidays && customHolidays[keyYMD]) {
    return { isHoliday: true, name: customHolidays[keyYMD] };
  }
  if (LIBUR_NASIONAL_DEFAULT[keyMD]) {
    return { isHoliday: true, name: LIBUR_NASIONAL_DEFAULT[keyMD] };
  }
  return { isHoliday: false };
}
