import React from 'react';
import { DailyAttendance, KopInstansi, PejabatPenandatangan, Pegawai } from '../types';
import { EmblemLogo } from './EmblemLogo';

interface AttendanceSheetProps {
  kop: KopInstansi;
  pejabat: PejabatPenandatangan;
  pegawai: Pegawai;
  records: DailyAttendance[];
  bulanNama: string;
  tahun: number;
  isEditable?: boolean;
  onUpdateRecord?: (index: number, field: keyof DailyAttendance, value: any) => void;
  show31RowsFixed?: boolean;
  compactPrint?: boolean;
  isBlankMode?: boolean;
}

export const AttendanceSheet: React.FC<AttendanceSheetProps> = ({
  kop,
  pejabat,
  pegawai,
  records,
  bulanNama,
  tahun,
  isEditable = true,
  onUpdateRecord,
  show31RowsFixed = true,
  compactPrint = false,
  isBlankMode = false
}) => {
  // If show31RowsFixed is true, make sure 31 rows exist even if the month has 28/30 days
  const displayRows: (DailyAttendance | null)[] = [...records];
  if (show31RowsFixed && displayRows.length < 31) {
    for (let i = displayRows.length + 1; i <= 31; i++) {
      displayRows.push(null);
    }
  }

  // Rekapitulasi ketidakhadiran dari records
  const countSakit = records.filter(r => r && r.keterangan && /sakit/i.test(r.keterangan)).length;
  const countIzin = records.filter(r => r && r.keterangan && /izin/i.test(r.keterangan)).length;
  const countTanpaBerita = records.filter(r => r && r.keterangan && /(tanpa berita|alpa|alpha|\btk\b)/i.test(r.keterangan)).length;
  const countCuti = records.filter(r => r && r.keterangan && /cuti/i.test(r.keterangan)).length;
  const countTugasKeluar = records.filter(r => r && r.keterangan && /(tugas keluar|dinas luar|\bdl\b)/i.test(r.keterangan)).length;

  return (
    <div className="attendance-paper bg-white text-black p-[20mm] w-full max-w-[210mm] min-h-[297mm] mx-auto shadow-xl rounded-xs border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:max-w-none print:min-h-0 font-serif leading-tight box-border">
      {/* KOP SURAT */}
      <div className="relative flex items-center justify-between pb-1.5 pt-1">
        <div className="w-24 shrink-0 flex items-center justify-center">
          <EmblemLogo customUrl={kop.logoUrl} size={82} />
        </div>
        <div className="text-center flex-1 px-2">
          <h2 className="text-base font-bold tracking-wide uppercase leading-tight font-serif">
            {kop.pemerintah}
          </h2>
          <h1 className="text-base font-bold tracking-wide uppercase leading-tight font-serif">
            {kop.dinas}
          </h1>
          <h1 className="text-lg font-bold tracking-wider uppercase leading-tight font-serif mt-0.5">
            {kop.unitKerja}
          </h1>
          <p className="text-[11px] leading-tight mt-1 text-slate-800 font-sans">
            {kop.alamat}
          </p>
          <p className="text-[10.5px] leading-tight text-slate-800 font-sans">
            Pos Elektronik: <span className="underline">{kop.email}</span>, Web: {kop.web}
          </p>
        </div>
        <div className="w-12 shrink-0"></div>
      </div>

      {/* DOUBLE LINE KOP SURAT (Tebal di atas, tipis di bawah) */}
      <div className="border-b-[3px] border-black my-1" />
      <div className="border-b-[1px] border-black mb-3 -mt-0.5" />

      {/* JUDUL DOKUMEN */}
      <div className="text-center my-3">
        <h3 className="text-sm font-bold tracking-widest uppercase underline underline-offset-2">
          DAFTAR HADIR
        </h3>
        <p className="text-xs font-bold tracking-wider uppercase mt-1">
          BULAN {bulanNama} TAHUN {tahun}
        </p>
      </div>

      {/* IDENTITAS PEGAWAI */}
      <div className="text-xs font-sans mb-3 text-slate-900 grid grid-cols-1 gap-0.5 pl-1">
        <div className="flex">
          <span className="w-24 font-bold tracking-wide uppercase">NAMA</span>
          <span className="mr-2">:</span>
          <span className="font-semibold">{pegawai.nama}</span>
        </div>
        <div className="flex">
          <span className="w-24 font-bold tracking-wide uppercase">
            {pegawai.tipeNip === 'NRPK' || pegawai.status === 'NRPK' ? 'NRPK' : 'NIP'}
          </span>
          <span className="mr-2">:</span>
          <span>{pegawai.nip || '-'}</span>
        </div>
        <div className="flex">
          <span className="w-24 font-bold tracking-wide uppercase">JABATAN</span>
          <span className="mr-2">:</span>
          <span>{pegawai.jabatan}</span>
        </div>
      </div>

      {/* TABEL PRESENSI */}
      <table className="w-full border-collapse border border-black text-center text-[10.5px] font-sans table-fixed">
        <thead>
          <tr className="bg-slate-50 font-bold border-b border-black text-slate-900 h-[26px]">
            <th className="border border-black py-1 px-0.5 w-[7%] text-center">TGL</th>
            <th className="border border-black py-1 px-1 w-[19%] text-center">JAM MASUK</th>
            <th className="border border-black py-1 px-1 w-[14%] text-center">PARAF</th>
            <th className="border border-black py-1 px-1 w-[19%] text-center">JAM KELUAR</th>
            <th className="border border-black py-1 px-1 w-[14%] text-center">PARAF</th>
            <th className="border border-black py-1 px-1 w-[27%] text-center">KETERANGAN</th>
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, idx) => {
            const tanggalNum = idx + 1;
            if (!row) {
              // Dummy blank row for month with < 31 days
              return (
                <tr key={`blank-${tanggalNum}`} className="h-[20px] print:h-[18px] border-b border-black text-slate-400">
                  <td className="border border-black py-0.5">{tanggalNum}</td>
                  <td className="border border-black py-0.5">{isBlankMode ? '' : '-'}</td>
                  <td className="border border-black py-0.5">{isBlankMode ? '' : '-'}</td>
                  <td className="border border-black py-0.5">{isBlankMode ? '' : '-'}</td>
                  <td className="border border-black py-0.5">{isBlankMode ? '' : '-'}</td>
                  <td className="border border-black py-0.5">{isBlankMode ? '' : '-'}</td>
                </tr>
              );
            }

            const isOff = !isBlankMode && (row.isWeekend || row.isHoliday);
            const rowBg = isOff ? 'bg-slate-50/70' : '';

            return (
              <tr
                key={`day-${row.tanggal}`}
                className={`h-[20px] print:h-[18px] border-b border-black text-black ${rowBg} hover:bg-amber-50/40 transition-colors`}
              >
                {/* Tanggal */}
                <td className="border border-black py-0.5 font-medium">
                  {row.tanggal}
                </td>

                {/* Jam Masuk */}
                <td className="border border-black py-0.5 px-1">
                  {isEditable && !isOff ? (
                    <input
                      type="text"
                      value={row.jamMasuk}
                      onChange={(e) => onUpdateRecord?.(idx, 'jamMasuk', e.target.value)}
                      className="w-full text-center bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded py-0.5 font-sans"
                      placeholder=""
                    />
                  ) : (
                    <span>{row.jamMasuk || (isOff && !isBlankMode ? '-' : '')}</span>
                  )}
                </td>

                {/* Paraf Masuk */}
                <td className="border border-black py-0.5 px-1">
                  {isEditable && !isOff ? (
                    <input
                      type="text"
                      value={typeof row.parafMasuk === 'string' ? row.parafMasuk : ''}
                      onChange={(e) => onUpdateRecord?.(idx, 'parafMasuk', e.target.value)}
                      className="w-full text-center bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded py-0.5 font-serif italic"
                      placeholder=""
                    />
                  ) : (
                    <span className="font-serif italic font-semibold">
                      {typeof row.parafMasuk === 'string' ? row.parafMasuk : (row.parafMasuk ? '✓' : (isOff && !isBlankMode ? '-' : ''))}
                    </span>
                  )}
                </td>

                {/* Jam Keluar */}
                <td className="border border-black py-0.5 px-1">
                  {isEditable && !isOff ? (
                    <input
                      type="text"
                      value={row.jamKeluar}
                      onChange={(e) => onUpdateRecord?.(idx, 'jamKeluar', e.target.value)}
                      className="w-full text-center bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded py-0.5 font-sans"
                      placeholder=""
                    />
                  ) : (
                    <span>{row.jamKeluar || (isOff && !isBlankMode ? '-' : '')}</span>
                  )}
                </td>

                {/* Paraf Keluar */}
                <td className="border border-black py-0.5 px-1">
                  {isEditable && !isOff ? (
                    <input
                      type="text"
                      value={typeof row.parafKeluar === 'string' ? row.parafKeluar : ''}
                      onChange={(e) => onUpdateRecord?.(idx, 'parafKeluar', e.target.value)}
                      className="w-full text-center bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded py-0.5 font-serif italic"
                      placeholder=""
                    />
                  ) : (
                    <span className="font-serif italic font-semibold">
                      {typeof row.parafKeluar === 'string' ? row.parafKeluar : (row.parafKeluar ? '✓' : (isOff && !isBlankMode ? '-' : ''))}
                    </span>
                  )}
                </td>

                {/* Keterangan */}
                <td className="border border-black py-0.5 px-1 text-left truncate">
                  {isEditable ? (
                    <input
                      type="text"
                      value={row.keterangan}
                      onChange={(e) => onUpdateRecord?.(idx, 'keterangan', e.target.value)}
                      className="w-full text-left bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded py-0.5 text-[10.5px] truncate"
                      placeholder=""
                    />
                  ) : (
                    <span className={`block truncate ${isOff && !isBlankMode ? 'text-slate-700 italic' : ''}`}>
                      {row.keterangan}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* FOOTER: KETERANGAN & PENGESAHAN */}
      <div className="mt-4 print:mt-3 flex justify-between items-start font-serif text-xs break-inside-avoid">
        {/* KOTAK KETERANGAN KETIDAKHADIRAN */}
        <div className="w-64 text-left text-slate-900">
          <p className="font-serif font-bold text-xs uppercase tracking-wide mb-1 underline underline-offset-2">
            Keterangan :
          </p>
          <div className="text-[11px] leading-relaxed space-y-0.5 font-sans pl-0.5 text-slate-800">
            <div className="flex items-center">
              <span className="w-28 font-medium">1. Sakit</span>
              <span className="mr-2">:</span>
              <span className="font-sans">
                {isBlankMode ? '........' : (countSakit > 0 ? countSakit : '......')} hari
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-28 font-medium">2. Izin</span>
              <span className="mr-2">:</span>
              <span className="font-sans">
                {isBlankMode ? '........' : (countIzin > 0 ? countIzin : '......')} hari
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-28 font-medium">3. Tanpa Berita</span>
              <span className="mr-2">:</span>
              <span className="font-sans">
                {isBlankMode ? '........' : (countTanpaBerita > 0 ? countTanpaBerita : '......')} hari
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-28 font-medium">4. Cuti</span>
              <span className="mr-2">:</span>
              <span className="font-sans">
                {isBlankMode ? '........' : (countCuti > 0 ? countCuti : '......')} hari
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-28 font-medium">5. Tugas Keluar</span>
              <span className="mr-2">:</span>
              <span className="font-sans">
                {isBlankMode ? '........' : (countTugasKeluar > 0 ? countTugasKeluar : '......')} hari
              </span>
            </div>
          </div>
        </div>

        {/* PENGESAHAN / MENGETAHUI */}
        <div className="w-72 text-center text-slate-900">
          <p className="leading-tight">Mengetahui,</p>
          <p className="leading-tight font-medium">{pejabat.jabatan}</p>

          {/* Spasi Tanda Tangan Fisik & Cap Dinas */}
          <div className="h-14 print:h-12 flex items-center justify-center">
            {/* Opsional area cap dinas atau ttd */}
          </div>

          <p className="font-bold underline underline-offset-2 leading-tight">
            {pejabat.nama}
          </p>
          <p className="leading-tight text-[11px] font-sans mt-0.5">
            {pejabat.pangkatGolongan}
          </p>
          <p className="leading-tight text-[11px] font-sans">
            NIP. {pejabat.nip || '-'}
          </p>
        </div>
      </div>
    </div>
  );
};
