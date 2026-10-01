export interface Pegawai {
  id: string;
  nama: string;
  nip: string;
  tipeNip?: 'NIP' | 'NRPK';
  jabatan: string;
  golongan?: string;
  status?: 'PNS' | 'PPPK' | 'PPPK Paruh Waktu' | 'NRPK' | 'Honorer' | 'PTT' | 'Magang' | string;
  parafText?: string;
  isActive: boolean;
}

export interface KopInstansi {
  pemerintah: string;
  dinas: string;
  unitKerja: string;
  alamat: string;
  kodePos: string;
  telepon: string;
  email: string;
  web: string;
  logoUrl?: string;
}

export interface PejabatPenandatangan {
  jabatan: string;
  nama: string;
  pangkatGolongan: string;
  nip: string;
  kotaTtd: string;
}

export interface DailyAttendance {
  tanggal: number; // 1 - 31
  hariNama: string; // Senin, Selasa, ...
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  jamMasuk: string;
  parafMasuk: boolean | string;
  jamKeluar: string;
  parafKeluar: boolean | string;
  keterangan: string;
}

export interface AttendanceSettings {
  polaKerja: '5_HARI' | '6_HARI'; // 5 hari (Senin-Jumat) atau 6 hari (Senin-Sabtu)
  jamMasukStandar: string; // "07:30"
  jamKeluarStandar: string; // "14:00"
  jamKeluarJumat: string; // "11:30"
  jamKeluarSabtu: string; // "12:30"
  gunakanVariasiMenit: boolean; // Menambah variasi menit acak agar realistis (misal 07:18 - 07:29)
  rentangMenitMasukAwal: number; // 15 menit sebelum
  rentangMenitMasukAkhir: number; // 2 menit sebelum
  rentangMenitKeluarAwal: number; // 2 menit setelah
  rentangMenitKeluarAkhir: number; // 18 menit setelah
  modeParaf: 'KOSONG' | 'INISIAL' | 'CEKLIS';
  teksLibur: string; // "LIBUR" atau "-"
}

export interface HolidayItem {
  tanggal: string; // YYYY-MM-DD
  nama: string;
}
