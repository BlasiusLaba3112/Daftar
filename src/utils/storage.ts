import { AttendanceSettings, KopInstansi, PejabatPenandatangan, Pegawai } from '../types';

export const DEFAULT_KOP: KopInstansi = {
  pemerintah: 'PEMERINTAH KABUPATEN SIKKA',
  dinas: 'DINAS KESEHATAN',
  unitKerja: 'UPT PUSKESMAS BOGANATAR',
  alamat: 'Jalan Raya Maumere - Larantuka KM. 65, Kode Pos 86183, Tlp : 082341777140',
  kodePos: '86183',
  telepon: '082341777140',
  email: 'boganatarpkm@gmail.com',
  web: '-',
  logoUrl: '' // Will use built-in SVG emblem if empty
};

export const DEFAULT_PEJABAT: PejabatPenandatangan = {
  jabatan: 'Kepala UPT Puskesmas Boganatar',
  nama: 'Christiana Lensi, S.KM',
  pangkatGolongan: 'Penata Tk I, III/d',
  nip: '19750403 200112 2 003',
  kotaTtd: 'Boganatar'
};

export const DEFAULT_SETTINGS: AttendanceSettings = {
  polaKerja: '6_HARI', // Puskesmas umumnya 6 hari kerja (Senin-Sabtu)
  jamMasukStandar: '07:30',
  jamKeluarStandar: '14:00',
  jamKeluarJumat: '11:30',
  jamKeluarSabtu: '12:30',
  gunakanVariasiMenit: true,
  rentangMenitMasukAwal: 15, // 07:15 - 07:28
  rentangMenitMasukAkhir: 2,
  rentangMenitKeluarAwal: 2,  // 14:02 - 14:15
  rentangMenitKeluarAkhir: 15,
  modeParaf: 'KOSONG', // default kosong untuk tanda tangan basah, bisa diaktifkan inisial/ceklis
  teksLibur: 'LIBUR'
};

export const DEFAULT_PEGAWAI: Pegawai[] = [
  {
    id: 'peg-1',
    nama: 'Kornelia P.K. Daro,A.Md.Keb',
    nip: '19890326 201705 2 004',
    jabatan: 'Bidan',
    golongan: 'Pengatur, II/c',
    status: 'PNS',
    parafText: 'KD',
    isActive: true
  },
  {
    id: 'peg-2',
    nama: 'dr. Maria Fransiska Nong, S.Ked',
    nip: '19910514 202012 2 001',
    jabatan: 'Dokter Umum',
    golongan: 'Penata Muda Tk. I, III/b',
    status: 'PNS',
    parafText: 'FN',
    isActive: true
  },
  {
    id: 'peg-3',
    nama: 'drg. Antonius Yoseph Da Silva',
    nip: '19880820 201903 1 005',
    jabatan: 'Dokter Gigi',
    golongan: 'Penata Muda Tk. I, III/b',
    status: 'PNS',
    parafText: 'AS',
    isActive: true
  },
  {
    id: 'peg-4',
    nama: 'Yohanes Paulus Baga, S.Kep., Ns',
    nip: '19850612 201001 1 012',
    jabatan: 'Perawat Pertama',
    golongan: 'Penata, III/c',
    status: 'PNS',
    parafText: 'YB',
    isActive: true
  },
  {
    id: 'peg-5',
    nama: 'Maria Goreti Ose, A.Md.Kep',
    nip: '19920215 201503 2 003',
    jabatan: 'Perawat Terampil',
    golongan: 'Pengatur Tk. I, II/d',
    status: 'PNS',
    parafText: 'MO',
    isActive: true
  },
  {
    id: 'peg-6',
    nama: 'Fransiskus Xaverius Seda, S.Farm., Apt',
    nip: '19901103 201801 1 002',
    jabatan: 'Apoteker',
    golongan: 'Penata Muda Tk. I, III/b',
    status: 'PNS',
    parafText: 'FS',
    isActive: true
  },
  {
    id: 'peg-7',
    nama: 'Theresia Avila Meo, A.Md.AK',
    nip: '19930722 201904 2 007',
    jabatan: 'Pranata Labkes',
    golongan: 'Pengatur, II/c',
    status: 'PNS',
    parafText: 'TM',
    isActive: true
  },
  {
    id: 'peg-8',
    nama: 'Bernadeta Eda, S.Gz',
    nip: '19940410 202201 2 004',
    jabatan: 'Nutrisionis',
    golongan: 'Penata Muda, III/a',
    status: 'PNS',
    parafText: 'BE',
    isActive: true
  },
  {
    id: 'peg-9',
    nama: 'Petrus Kanisius Moat, S.Tr.Kes',
    nip: '19871201 201402 1 003',
    jabatan: 'Sanitarian',
    golongan: 'Penata, III/c',
    status: 'PNS',
    parafText: 'PM',
    isActive: true
  },
  {
    id: 'peg-10',
    nama: 'Elisabeth Sero, S.AP',
    nip: '19820317 200801 2 015',
    jabatan: 'Pengadministrasi Umum',
    golongan: 'Penata, III/c',
    status: 'PNS',
    parafText: 'ES',
    isActive: true
  }
];

const STORAGE_KEYS = {
  KOP: 'hadir_kop_instansi_v1',
  PEJABAT: 'hadir_pejabat_v1',
  SETTINGS: 'hadir_settings_v1',
  PEGAWAI: 'hadir_pegawai_v1',
  HOLIDAYS: 'hadir_custom_holidays_v1'
};

export function loadKop(): KopInstansi {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.KOP);
    return data ? JSON.parse(data) : DEFAULT_KOP;
  } catch {
    return DEFAULT_KOP;
  }
}

export function saveKop(kop: KopInstansi): void {
  localStorage.setItem(STORAGE_KEYS.KOP, JSON.stringify(kop));
}

export function loadPejabat(): PejabatPenandatangan {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PEJABAT);
    return data ? JSON.parse(data) : DEFAULT_PEJABAT;
  } catch {
    return DEFAULT_PEJABAT;
  }
}

export function savePejabat(pejabat: PejabatPenandatangan): void {
  localStorage.setItem(STORAGE_KEYS.PEJABAT, JSON.stringify(pejabat));
}

export function loadSettings(): AttendanceSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AttendanceSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function loadPegawai(): Pegawai[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PEGAWAI);
    return data ? JSON.parse(data) : DEFAULT_PEGAWAI;
  } catch {
    return DEFAULT_PEGAWAI;
  }
}

export function savePegawai(list: Pegawai[]): void {
  localStorage.setItem(STORAGE_KEYS.PEGAWAI, JSON.stringify(list));
}

export function loadCustomHolidays(): Record<string, string> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HOLIDAYS);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveCustomHolidays(holidays: Record<string, string>): void {
  localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(holidays));
}
