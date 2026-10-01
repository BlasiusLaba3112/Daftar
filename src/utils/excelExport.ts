import * as XLSX from 'xlsx';
import { DailyAttendance, KopInstansi, PejabatPenandatangan, Pegawai } from '../types';

export function exportAttendanceToExcel(
  records: DailyAttendance[],
  pegawai: Pegawai,
  kop: KopInstansi,
  pejabat: PejabatPenandatangan,
  bulanStr: string,
  tahun: number
) {
  const wsData: (string | number)[][] = [
    [kop.pemerintah],
    [kop.dinas],
    [kop.unitKerja],
    [kop.alamat],
    [`Pos Elektronik: ${kop.email} | Web: ${kop.web}`],
    [],
    ['DAFTAR HADIR'],
    [`BULAN ${bulanStr} TAHUN ${tahun}`],
    [],
    ['NAMA', ':', pegawai.nama],
    [pegawai.tipeNip === 'NRPK' || pegawai.status === 'NRPK' ? 'NRPK' : 'NIP', ':', pegawai.nip ? `'${pegawai.nip}` : '-'],
    ['JABATAN', ':', pegawai.jabatan],
    [],
    ['TGL', 'HARI', 'JAM MASUK', 'PARAF', 'JAM KELUAR', 'PARAF', 'KETERANGAN']
  ];

  records.forEach((row) => {
    wsData.push([
      row.tanggal,
      row.hariNama,
      row.jamMasuk,
      typeof row.parafMasuk === 'string' ? row.parafMasuk : (row.parafMasuk ? '✓' : ''),
      row.jamKeluar,
      typeof row.parafKeluar === 'string' ? row.parafKeluar : (row.parafKeluar ? '✓' : ''),
      row.keterangan
    ]);
  });

  const countSakit = records.filter(r => r && r.keterangan && /sakit/i.test(r.keterangan)).length;
  const countIzin = records.filter(r => r && r.keterangan && /izin/i.test(r.keterangan)).length;
  const countTanpaBerita = records.filter(r => r && r.keterangan && /(tanpa berita|alpa|alpha|\btk\b)/i.test(r.keterangan)).length;
  const countCuti = records.filter(r => r && r.keterangan && /cuti/i.test(r.keterangan)).length;
  const countTugasKeluar = records.filter(r => r && r.keterangan && /(tugas keluar|dinas luar|\bdl\b)/i.test(r.keterangan)).length;

  wsData.push([]);
  wsData.push(['Keterangan :', '', '', '', 'Mengetahui,']);
  wsData.push([`1. Sakit : ${countSakit > 0 ? countSakit : 0} hari`, '', '', '', pejabat.jabatan]);
  wsData.push([`2. Izin : ${countIzin > 0 ? countIzin : 0} hari`, '', '', '', '']);
  wsData.push([`3. Tanpa Berita : ${countTanpaBerita > 0 ? countTanpaBerita : 0} hari`, '', '', '', '']);
  wsData.push([`4. Cuti : ${countCuti > 0 ? countCuti : 0} hari`, '', '', '', pejabat.nama]);
  wsData.push([`5. Tugas Keluar : ${countTugasKeluar > 0 ? countTugasKeluar : 0} hari`, '', '', '', pejabat.pangkatGolongan]);
  wsData.push(['', '', '', '', pejabat.nip ? `NIP. ${pejabat.nip}` : '']);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },  // TGL
    { wch: 10 }, // HARI
    { wch: 12 }, // JAM MASUK
    { wch: 10 }, // PARAF
    { wch: 12 }, // JAM KELUAR
    { wch: 10 }, // PARAF
    { wch: 22 }  // KETERANGAN
  ];

  XLSX.utils.book_append_sheet(wb, ws, `Daftar Hadir ${pegawai.nama.slice(0, 15)}`);
  const fileName = `Daftar_Hadir_${pegawai.nama.replace(/[^a-zA-Z0-9]/g, '_')}_${bulanStr}_${tahun}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportPegawaiToExcel(list: Pegawai[]) {
  const wsData: (string | number)[][] = [
    ['No', 'Nama Lengkap & Gelar', 'NIP', 'Jabatan', 'Pangkat / Golongan', 'Status', 'Inisial Paraf', 'Aktif']
  ];

  list.forEach((p, idx) => {
    wsData.push([
      idx + 1,
      p.nama,
      p.nip ? `'${p.nip}` : '',
      p.jabatan,
      p.golongan || '',
      p.status || 'PNS',
      p.parafText || '',
      p.isActive ? 'Ya' : 'Tidak'
    ]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 5 },
    { wch: 32 },
    { wch: 24 },
    { wch: 24 },
    { wch: 20 },
    { wch: 12 },
    { wch: 14 },
    { wch: 8 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Master Pegawai');
  XLSX.writeFile(wb, 'Master_Data_Pegawai.xlsx');
}

export async function parsePegawaiFile(file: File): Promise<Pegawai[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json<(string | number)[]>(worksheet, { header: 1 });

        if (jsonRows.length <= 1) {
          resolve([]);
          return;
        }

        // Find header row or assume row 0
        const headerRow = (jsonRows[0] || []).map(h => String(h).toLowerCase().trim());
        let nameIdx = headerRow.findIndex(h => h.includes('nama'));
        let nipIdx = headerRow.findIndex(h => h.includes('nip') || h.includes('nrpk') || h.includes('identitas'));
        let jabatanIdx = headerRow.findIndex(h => h.includes('jabatan'));
        let golIdx = headerRow.findIndex(h => h.includes('gol') || h.includes('pangkat'));
        let statusIdx = headerRow.findIndex(h => h.includes('status'));

        // Fallback index defaults
        if (nameIdx === -1) nameIdx = 1;
        if (nipIdx === -1) nipIdx = 2;
        if (jabatanIdx === -1) jabatanIdx = 3;
        if (golIdx === -1) golIdx = 4;

        const result: Pegawai[] = [];

        for (let i = 1; i < jsonRows.length; i++) {
          const row = jsonRows[i];
          if (!row || row.length === 0) continue;
          const nama = String(row[nameIdx] || '').trim();
          if (!nama) continue;

          let rawNip = String(row[nipIdx] || '').replace(/^'+/, '').trim();
          const jabatan = String(row[jabatanIdx] || '').trim() || 'Staff';
          const golongan = golIdx !== -1 && row[golIdx] ? String(row[golIdx]).trim() : '';
          const status = statusIdx !== -1 && row[statusIdx] ? String(row[statusIdx]).trim() as any : 'PNS';
          const isNRPK = status === 'NRPK' || (nipIdx !== -1 && headerRow[nipIdx]?.includes('nrpk'));

          result.push({
            id: `peg-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
            nama,
            nip: rawNip,
            tipeNip: isNRPK ? 'NRPK' : 'NIP',
            jabatan,
            golongan,
            status: ['PNS', 'PPPK', 'PPPK Paruh Waktu', 'NRPK', 'Honorer', 'PTT', 'Magang'].includes(status) ? status : 'PNS',
            isActive: true
          });
        }

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
