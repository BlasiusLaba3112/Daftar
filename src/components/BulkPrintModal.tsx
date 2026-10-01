import React, { useState, useRef } from 'react';
import { AttendanceSettings, KopInstansi, PejabatPenandatangan, Pegawai } from '../types';
import { AttendanceSheet } from './AttendanceSheet';
import { generateMonthlyAttendance } from '../utils/attendanceGenerator';
import { downloadBulkSheetAsPdf, printBulkDirectly } from '../utils/pdfExport';
import { 
  Printer, 
  CheckSquare, 
  Square, 
  X, 
  Sparkles, 
  FileText, 
  Download, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react';

interface BulkPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  pegawaiList: Pegawai[];
  kop: KopInstansi;
  pejabat: PejabatPenandatangan;
  settings: AttendanceSettings;
  selectedMonth: number;
  selectedYear: number;
  bulanNama: string;
  customHolidays: Record<string, string>;
}

export const BulkPrintModal: React.FC<BulkPrintModalProps> = ({
  isOpen,
  onClose,
  pegawaiList,
  kop,
  pejabat,
  settings,
  selectedMonth,
  selectedYear,
  bulanNama,
  customHolidays
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    pegawaiList.filter(p => p.isActive).map(p => p.id)
  );
  const [fillMode, setFillMode] = useState<'AUTO_FILL' | 'BLANK'>('AUTO_FILL');

  const bulkPrintContainerRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);

  if (!isOpen) return null;

  const toggleSelectAll = () => {
    if (selectedIds.length === pegawaiList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pegawaiList.map(p => p.id));
    }
  };

  const toggleId = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const activeSelectedPegawai = pegawaiList.filter(p => selectedIds.includes(p.id));

  // Cetak langsung ke printer DAN unduh file PDF sekaligus
  const handlePrintAndDownload = async () => {
    if (!bulkPrintContainerRef.current || isProcessing || activeSelectedPegawai.length === 0) return;
    setIsProcessing(true);
    setProgressText('Menyiapkan file PDF...');

    try {
      const fileName = `Daftar_Hadir_Massal_${activeSelectedPegawai.length}_Pegawai_${bulanNama}_${selectedYear}.pdf`;
      
      // 1. Unduh file PDF lengkap semua lembar pegawai
      await downloadBulkSheetAsPdf(
        bulkPrintContainerRef.current,
        fileName,
        (current, total) => {
          setProgressText(`Menyimpan lembar ${current} dari ${total}...`);
        }
      );

      // 2. Buka dialog cetak printer
      await printBulkDirectly(bulkPrintContainerRef.current, `Daftar Hadir Massal - ${bulanNama} ${selectedYear}`);

      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 5000);
    } catch (err) {
      console.error('Gagal cetak dan unduh massal:', err);
      window.print();
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  // Unduh dokumen PDF saja
  const handleDownloadOnly = async () => {
    if (!bulkPrintContainerRef.current || isProcessing || activeSelectedPegawai.length === 0) return;
    setIsProcessing(true);
    try {
      const fileName = `Daftar_Hadir_Massal_${activeSelectedPegawai.length}_Pegawai_${bulanNama}_${selectedYear}.pdf`;
      await downloadBulkSheetAsPdf(
        bulkPrintContainerRef.current,
        fileName,
        (current, total) => {
          setProgressText(`Menyimpan lembar ${current} dari ${total}...`);
        }
      );
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 4500);
    } catch (err) {
      console.error('Gagal unduh PDF massal:', err);
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Non-Printable Configuration Dialog */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden print:hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Cetak Massal Daftar Hadir</h3>
              <p className="text-xs text-slate-300">
                Bulan {bulanNama} {selectedYear} • {kop.unitKerja}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Mode Selection */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <label className="block font-semibold text-slate-800">
              Format Pengisian Lembar Hadir:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2.5 ${
                fillMode === 'AUTO_FILL' ? 'bg-blue-50/70 border-blue-500 text-blue-900' : 'bg-white border-slate-200'
              }`}>
                <input
                  type="radio"
                  name="bulkFillMode"
                  checked={fillMode === 'AUTO_FILL'}
                  onChange={() => setFillMode('AUTO_FILL')}
                />
                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Otomatis Terisi
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Jam masuk & jam pulang dibuat otomatis realistis
                  </div>
                </div>
              </label>

              <label className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2.5 ${
                fillMode === 'BLANK' ? 'bg-blue-50/70 border-blue-500 text-blue-900' : 'bg-white border-slate-200'
              }`}>
                <input
                  type="radio"
                  name="bulkFillMode"
                  checked={fillMode === 'BLANK'}
                  onChange={() => setFillMode('BLANK')}
                />
                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    Format Blanko Kosong
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Kolom jam & paraf kosong untuk ditandatangani manual
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Pegawai List Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-700">
                Pilih Pegawai yang Ingin Dicetak ({selectedIds.length} dari {pegawaiList.length} terpilih):
              </span>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-blue-600 hover:text-blue-700 font-medium text-xs flex items-center gap-1"
              >
                {selectedIds.length === pegawaiList.length ? 'Batal Pilih Semua' : 'Pilih Semua Pegawai'}
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
              {pegawaiList.map((p) => {
                const isChecked = selectedIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleId(p.id)}
                    className="p-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <div>
                        <div className="font-semibold text-slate-800">{p.nama}</div>
                        <div className="text-[11px] text-slate-500">
                          {p.jabatan} • {p.nip ? `NIP. ${p.nip}` : 'Non NIP'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {p.status || 'PNS'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Akan menghasilkan <b>{activeSelectedPegawai.length} halaman</b> siap cetak / simpan ke PDF.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium cursor-pointer disabled:opacity-50"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrintAndDownload}
              disabled={activeSelectedPegawai.length === 0 || isProcessing}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-bold text-xs shadow-md active:scale-95 cursor-pointer disabled:opacity-50 transition-all ${
                successMessage
                  ? 'bg-emerald-600 shadow-emerald-600/40 ring-2 ring-emerald-300'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30'
              }`}
              title="Cetak langsung ke printer sekaligus simpan file PDF dokumen ke komputer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  {progressText || 'Memproses Lembar...'}
                </>
              ) : successMessage ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  PDF Berhasil Disimpan & Dicetak!
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <Download className="w-3.5 h-3.5" />
                  Cetak Sekarang Sekalian Unduh ({activeSelectedPegawai.length} Lembar)
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownloadOnly}
              disabled={activeSelectedPegawai.length === 0 || isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-sm"
              title="Unduh file dokumen PDF massal tanpa membuka printer"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              Unduh PDF Saja
            </button>
          </div>
        </div>
      </div>

      {/* Printable container: positioned off-screen during modal view so html-to-image can render it, and visible during print */}
      <div 
        ref={bulkPrintContainerRef}
        className="fixed -left-[99999px] top-0 pointer-events-none opacity-0 print:opacity-100 print:static print:left-auto print:block print:pointer-events-auto bg-white"
      >
        {activeSelectedPegawai.map((pegawai, index) => {
          const records = generateMonthlyAttendance(
            selectedYear,
            selectedMonth,
            pegawai,
            settings,
            fillMode,
            customHolidays
          );
          return (
            <div
              key={pegawai.id}
              className="print-page-break w-full min-h-[297mm] p-0 m-0 bg-white"
              style={{ pageBreakAfter: index === activeSelectedPegawai.length - 1 ? 'auto' : 'always' }}
            >
              <AttendanceSheet
                kop={kop}
                pejabat={pejabat}
                pegawai={pegawai}
                records={records}
                bulanNama={bulanNama}
                tahun={selectedYear}
                isEditable={false}
                isBlankMode={fillMode === 'BLANK'}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
