import { AttendanceSettings, DailyAttendance, Pegawai } from '../types';
import { checkHoliday, getDayName, getDaysInMonth, isWeekendDay } from './dateUtils';

function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

// Menghasilkan jam acak realistis di sekitar target
function getRandomTime(targetHour: number, targetMinute: number, minOffset: number, maxOffset: number): string {
  const totalTargetMinutes = targetHour * 60 + targetMinute;
  const offset = Math.floor(Math.random() * (maxOffset - minOffset + 1)) + minOffset;
  const resultMinutes = totalTargetMinutes + offset;
  const hour = Math.floor(resultMinutes / 60);
  const minute = resultMinutes % 60;
  return `${padZero(hour)}:${padZero(minute)}`;
}

// Inisial paraf dari nama pegawai (cth: "Kornelia P.K. Daro,A.Md.Keb" -> "KD")
export function generateInitials(nama: string): string {
  if (!nama) return '';
  // buang gelar belakang setelah koma
  const cleanNama = nama.split(',')[0].trim();
  const parts = cleanNama.split(/\s+/).filter(p => !p.includes('.'));
  if (parts.length === 0) return cleanNama.substring(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function generateMonthlyAttendance(
  year: number,
  monthIndex: number,
  pegawai: Pegawai,
  settings: AttendanceSettings,
  mode: 'AUTO_FILL' | 'BLANK' = 'AUTO_FILL',
  customHolidays?: Record<string, string>
): DailyAttendance[] {
  const totalDays = getDaysInMonth(year, monthIndex);
  const records: DailyAttendance[] = [];

  const [inHour, inMin] = settings.jamMasukStandar.split(':').map(Number);
  const [outHour, outMin] = settings.jamKeluarStandar.split(':').map(Number);
  const [outFriHour, outFriMin] = settings.jamKeluarJumat.split(':').map(Number);
  const [outSatHour, outSatMin] = settings.jamKeluarSabtu.split(':').map(Number);

  const initials = pegawai.parafText || generateInitials(pegawai.nama);

  for (let day = 1; day <= 31; day++) {
    if (day > totalDays) {
      // Untuk hari di luar batas bulan (cth tgl 31 di bulan 30 hari), tetap bisa ditampilkan abu/disable atau di-skip
      continue;
    }

    const hariNama = getDayName(year, monthIndex, day);
    const isWeekend = isWeekendDay(year, monthIndex, day, settings.polaKerja);
    const holidayInfo = checkHoliday(year, monthIndex, day, customHolidays);

    if (mode === 'BLANK') {
      records.push({
        tanggal: day,
        hariNama,
        isWeekend: false,
        isHoliday: false,
        holidayName: '',
        jamMasuk: '',
        parafMasuk: '',
        jamKeluar: '',
        parafKeluar: '',
        keterangan: '' // Format blanko murni tanpa jam dan tanpa isian keterangan
      });
      continue;
    }

    // Mode AUTO_FILL
    if (isWeekend) {
      records.push({
        tanggal: day,
        hariNama,
        isWeekend: true,
        isHoliday: false,
        jamMasuk: '-',
        parafMasuk: '-',
        jamKeluar: '-',
        parafKeluar: '-',
        keterangan: settings.teksLibur
      });
    } else if (holidayInfo.isHoliday) {
      records.push({
        tanggal: day,
        hariNama,
        isWeekend: false,
        isHoliday: true,
        holidayName: holidayInfo.name,
        jamMasuk: '-',
        parafMasuk: '-',
        jamKeluar: '-',
        parafKeluar: '-',
        keterangan: holidayInfo.name || settings.teksLibur
      });
    } else {
      // Hari kerja biasa
      let jamMasuk = settings.jamMasukStandar;
      let jamKeluar = settings.jamKeluarStandar;

      if (hariNama === 'Jumat') {
        jamKeluar = settings.jamKeluarJumat;
      } else if (hariNama === 'Sabtu') {
        jamKeluar = settings.jamKeluarSabtu;
      }

      if (settings.gunakanVariasiMenit) {
        // Masuk sedikit sebelum jam mulai (cth -15 menit s/d -2 menit)
        jamMasuk = getRandomTime(inHour, inMin, -settings.rentangMenitMasukAwal, -settings.rentangMenitMasukAkhir);

        // Keluar sedikit setelah jam selesai (cth +2 menit s/d +15 menit)
        if (hariNama === 'Jumat') {
          jamKeluar = getRandomTime(outFriHour, outFriMin, settings.rentangMenitKeluarAwal, settings.rentangMenitKeluarAkhir);
        } else if (hariNama === 'Sabtu') {
          jamKeluar = getRandomTime(outSatHour, outSatMin, settings.rentangMenitKeluarAwal, settings.rentangMenitKeluarAkhir);
        } else {
          jamKeluar = getRandomTime(outHour, outMin, settings.rentangMenitKeluarAwal, settings.rentangMenitKeluarAkhir);
        }
      }

      let parafValue = '';
      if (settings.modeParaf === 'INISIAL') {
        parafValue = initials;
      } else if (settings.modeParaf === 'CEKLIS') {
        parafValue = '✓';
      }

      records.push({
        tanggal: day,
        hariNama,
        isWeekend: false,
        isHoliday: false,
        jamMasuk,
        parafMasuk: parafValue,
        jamKeluar,
        parafKeluar: parafValue,
        keterangan: ''
      });
    }
  }

  return records;
}
