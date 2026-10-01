import React, { useState, useEffect, useRef } from 'react';
import { 
  Pegawai, 
  KopInstansi, 
  PejabatPenandatangan, 
  DailyAttendance, 
  AttendanceSettings 
} from './types';
import { 
  loadKop, 
  saveKop, 
  loadPejabat, 
  savePejabat, 
  loadSettings, 
  saveSettings, 
  loadPegawai, 
  savePegawai, 
  loadCustomHolidays, 
  saveCustomHolidays 
} from './utils/storage';
import { NAMA_BULAN, getDaysInMonth } from './utils/dateUtils';
import { generateMonthlyAttendance } from './utils/attendanceGenerator';
import { exportAttendanceToExcel } from './utils/excelExport';
import { downloadSheetAsPdf, printSheetDirectly } from './utils/pdfExport';
import { Navbar } from './components/Navbar';
import { AttendanceSheet } from './components/AttendanceSheet';
import { MasterPegawai } from './components/MasterPegawai';
import { SettingsInstansi } from './components/SettingsInstansi';
import { BulkPrintModal } from './components/BulkPrintModal';
import { SetAbsenceModal } from './components/SetAbsenceModal';

import { 
  Printer, 
  Download, 
  Sparkles, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  Info,
  CalendarDays,
  FileSpreadsheet,
  ArrowLeft,
  X,
  Loader2
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'SHEET' | 'PEGAWAI' | 'SETTINGS'>('SHEET');

  // Master Data & Config States
  const [kop, setKop] = useState<KopInstansi>(loadKop);
  const [pejabat, setPejabat] = useState<PejabatPenandatangan>(loadPejabat);
  const [settings, setSettings] = useState<AttendanceSettings>(loadSettings);
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>(loadPegawai);
  const [customHolidays, setCustomHolidays] = useState<Record<string, string>>(loadCustomHolidays);

  // Sheet Controls - Default Oktober 2026 based on the user's reference photo!
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // 9 = Oktober (0-indexed)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedPegawaiId, setSelectedPegawaiId] = useState<string>(() => {
    return pegawaiList[0]?.id || '';
  });

  // Table Data State
  const [currentRecords, setCurrentRecords] = useState<DailyAttendance[]>([]);
  const [show31RowsFixed, setShow31RowsFixed] = useState(true);
  const [sheetMode, setSheetMode] = useState<'AUTO_FILL' | 'BLANK'>('AUTO_FILL');

  // Modals
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  // Current selected employee object
  const currentPegawai = pegawaiList.find(p => p.id === selectedPegawaiId) || pegawaiList[0] || {
    id: 'unknown',
    nama: 'Pegawai',
    nip: '',
    jabatan: 'Staff',
    isActive: true
  };

  // Generate / Regenerate table data when employee, month, or year changes
  const regenerateRecords = (mode: 'AUTO_FILL' | 'BLANK' = sheetMode) => {
    if (!currentPegawai) return;
    const generated = generateMonthlyAttendance(
      selectedYear,
      selectedMonth,
      currentPegawai,
      settings,
      mode,
      customHolidays
    );
    setCurrentRecords(generated);
  };

  useEffect(() => {
    regenerateRecords(sheetMode);
  }, [selectedPegawaiId, selectedMonth, selectedYear, settings.polaKerja, settings.jamMasukStandar, settings.jamKeluarStandar, sheetMode]);

  // Handlers for persistence
  const handleSaveKop = (newKop: KopInstansi) => {
    setKop(newKop);
    saveKop(newKop);
  };

  const handleSavePejabat = (newPejabat: PejabatPenandatangan) => {
    setPejabat(newPejabat);
    savePejabat(newPejabat);
  };

  const handleSaveSettings = (newSettings: AttendanceSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleSavePegawaiList = (newList: Pegawai[]) => {
    setPegawaiList(newList);
    savePegawai(newList);
    if (!newList.some(p => p.id === selectedPegawaiId) && newList.length > 0) {
      setSelectedPegawaiId(newList[0].id);
    }
  };

  const handleSaveHolidays = (newHolidays: Record<string, string>) => {
    setCustomHolidays(newHolidays);
    saveCustomHolidays(newHolidays);
    regenerateRecords('AUTO_FILL');
  };

  // Update specific cell in table
  const handleUpdateRecord = (index: number, field: keyof DailyAttendance, value: any) => {
    setCurrentRecords(prev => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], [field]: value };
      }
      return copy;
    });
  };

  // Apply absence / leave for date range
  const handleApplyAbsence = (startDay: number, endDay: number, statusText: string) => {
    setCurrentRecords(prev => {
      return prev.map(rec => {
        if (rec.tanggal >= startDay && rec.tanggal <= endDay) {
          return {
            ...rec,
            jamMasuk: '-',
            jamKeluar: '-',
            parafMasuk: '-',
            parafKeluar: '-',
            keterangan: statusText
          };
        }
        return rec;
      });
    });
  };

  // Quick navigation through staff
  const currentPegawaiIndex = pegawaiList.findIndex(p => p.id === selectedPegawaiId);
  const handlePrevPegawai = () => {
    if (currentPegawaiIndex > 0) {
      setSelectedPegawaiId(pegawaiList[currentPegawaiIndex - 1].id);
    }
  };
  const handleNextPegawai = () => {
    if (currentPegawaiIndex < pegawaiList.length - 1) {
      setSelectedPegawaiId(pegawaiList[currentPegawaiIndex + 1].id);
    }
  };

  const handlePrintCurrent = () => {
    setIsPrintPreviewOpen(true);
    setTimeout(() => {
      try {
        window.print();
      } catch (err) {
        console.error(err);
      }
    }, 350);
  };

  const printSheetRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState(false);

  // Unduh dokumen langsung sebagai file PDF ke komputer
  const handleDownloadPdf = async () => {
    const targetEl = (printSheetRef.current?.querySelector('.attendance-paper') as HTMLElement)
      || (printSheetRef.current as HTMLElement)
      || (document.querySelector('.attendance-paper') as HTMLElement);

    if (!targetEl || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const cleanName = currentPegawai.nama.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `Daftar_Hadir_${cleanName}_${NAMA_BULAN[selectedMonth]}_${selectedYear}.pdf`;
      await downloadSheetAsPdf(targetEl, fileName);
      setPdfSuccessMessage(true);
      setTimeout(() => setPdfSuccessMessage(false), 4500);
    } catch (err) {
      console.error('Gagal membuat file PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const [isPrinting, setIsPrinting] = useState(false);
  const [printSuccessMessage, setPrintSuccessMessage] = useState(false);

  // Cetak lembar presensi langsung ke printer
  const handlePrintDirect = async () => {
    const targetEl = (printSheetRef.current?.querySelector('.attendance-paper') as HTMLElement)
      || (printSheetRef.current as HTMLElement)
      || (document.querySelector('.attendance-paper') as HTMLElement);

    setIsPrinting(true);
    try {
      const docTitle = `Daftar_Hadir_${currentPegawai.nama.replace(/[^a-zA-Z0-9]/g, '_')}_${NAMA_BULAN[selectedMonth]}_${selectedYear}`;
      if (targetEl) {
        await printSheetDirectly(targetEl, docTitle);
      } else {
        window.print();
      }
      setPrintSuccessMessage(true);
      setTimeout(() => setPrintSuccessMessage(false), 5000);
    } catch (err) {
      console.error('Gagal memicu pencetakan:', err);
      window.print();
    } finally {
      setIsPrinting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPrintPreviewOpen) {
        setIsPrintPreviewOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPrintPreviewOpen]);

  const handleExportExcel = () => {
    exportAttendanceToExcel(
      currentRecords,
      currentPegawai,
      kop,
      pejabat,
      NAMA_BULAN[selectedMonth],
      selectedYear
    );
  };

  // Statistics calculation for the current sheet
  const totalDays = getDaysInMonth(selectedYear, selectedMonth);
  const totalOffDays = currentRecords.filter(r => r.isWeekend || r.isHoliday).length;
  const effectiveWorkDays = totalDays - totalOffDays;
  const leavesCount = currentRecords.filter(r => !r.isWeekend && !r.isHoliday && r.keterangan && r.keterangan !== settings.teksLibur).length;
  const hadirCount = currentRecords.filter(r => !r.isWeekend && !r.isHoliday && r.jamMasuk && r.jamMasuk !== '-').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenBulkPrint={() => setIsBulkPrintOpen(true)}
        unitKerja={kop.unitKerja}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* TAB 1: LEMBAR DAFTAR HADIR */}
        {activeTab === 'SHEET' && (
          <div className="space-y-6">
            {/* Control Bar: Filter Pegawai, Bulan, Tahun, and Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 print:hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Employee Selector & Nav Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePrevPegawai}
                      disabled={currentPegawaiIndex <= 0}
                      className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                      title="Pegawai Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="relative min-w-[240px] sm:min-w-[280px]">
                      <select
                        value={selectedPegawaiId}
                        onChange={(e) => setSelectedPegawaiId(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                      >
                        {pegawaiList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nama} ({p.jabatan})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleNextPegawai}
                      disabled={currentPegawaiIndex >= pegawaiList.length - 1}
                      className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                      title="Pegawai Selanjutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Month & Year Selectors */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {NAMA_BULAN.map((bulan, idx) => (
                        <option key={bulan} value={idx}>
                          {bulan}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                    >
                      {[2024, 2025, 2026, 2027, 2028].map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setSheetMode('AUTO_FILL');
                      regenerateRecords('AUTO_FILL');
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer shadow-xs active:scale-95 ${
                      sheetMode === 'AUTO_FILL'
                        ? 'border-blue-600 bg-blue-600 text-white ring-2 ring-blue-300 shadow-blue-500/20'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                    title="Generate ulang jam masuk dan keluar secara otomatis"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Isi Jam Otomatis
                  </button>

                  <button
                    onClick={() => {
                      setSheetMode('BLANK');
                      regenerateRecords('BLANK');
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer shadow-xs active:scale-95 ${
                      sheetMode === 'BLANK'
                        ? 'border-indigo-600 bg-indigo-600 text-white ring-2 ring-indigo-300 shadow-indigo-500/20'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                    title="Format blanko bersih tanpa tulisan jam dan tanpa isian dari keterangan"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Format Blanko
                  </button>

                  <button
                    onClick={() => setIsAbsenceModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
                    title="Atur Cuti, Sakit, Izin, atau Dinas Luar"
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
                    Set Cuti / DL
                  </button>

                  <button
                    onClick={handleExportExcel}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                    title="Unduh file Microsoft Excel (.xlsx)"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    Excel (.xlsx)
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintCurrent}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm shadow-blue-500/20 active:scale-95 cursor-pointer select-none"
                    title="Cetak lembar ini langsung ke printer atau simpan sebagai PDF"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Cetak Lembar Ini
                  </button>
                </div>
              </div>

              {/* Quick Info & Quick Settings Sub-bar */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <b className="text-slate-700">{currentPegawai.nama}</b>
                    <span className="text-slate-400">({currentPegawai.jabatan})</span>
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Pola: <span className="font-semibold text-slate-700">{settings.polaKerja === '6_HARI' ? '6 Hari Kerja' : '5 Hari Kerja'}</span>
                  </span>

                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Hari Kerja: <b className="text-slate-700">{effectiveWorkDays} hari</b>
                  </span>

                  {leavesCount > 0 && (
                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                      Cuti/Izin: {leavesCount} hari
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={show31RowsFixed}
                      onChange={(e) => setShow31RowsFixed(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Tetap 31 Baris (Format Standar Foto)</span>
                  </label>
                  <span className="text-slate-300">|</span>
                  <span className="text-[11px] text-slate-400 italic">
                    Tip: Sel tabel dapat diedit langsung sebelum dicetak!
                  </span>
                </div>
              </div>
            </div>

            {/* LIVE PAPER PREVIEW CONTAINER */}
            <div className="py-2">
              <AttendanceSheet
                kop={kop}
                pejabat={pejabat}
                pegawai={currentPegawai}
                records={currentRecords}
                bulanNama={NAMA_BULAN[selectedMonth]}
                tahun={selectedYear}
                isEditable={true}
                onUpdateRecord={handleUpdateRecord}
                show31RowsFixed={show31RowsFixed}
                isBlankMode={sheetMode === 'BLANK'}
              />
            </div>
          </div>
        )}

        {/* TAB 2: MASTER DATA PEGAWAI */}
        {activeTab === 'PEGAWAI' && (
          <MasterPegawai
            pegawaiList={pegawaiList}
            onSaveList={handleSavePegawaiList}
            onSelectPegawaiForSheet={(p) => {
              setSelectedPegawaiId(p.id);
              setActiveTab('SHEET');
            }}
            onOpenBulkPrint={() => setIsBulkPrintOpen(true)}
          />
        )}

        {/* TAB 3: PENGATURAN KOP & JAM KERJA */}
        {activeTab === 'SETTINGS' && (
          <SettingsInstansi
            kop={kop}
            pejabat={pejabat}
            settings={settings}
            customHolidays={customHolidays}
            onSaveKop={handleSaveKop}
            onSavePejabat={handleSavePejabat}
            onSaveSettings={handleSaveSettings}
            onSaveHolidays={handleSaveHolidays}
          />
        )}
      </main>

      {/* Modal: Cetak Massal Seluruh Pegawai */}
      <BulkPrintModal
        isOpen={isBulkPrintOpen}
        onClose={() => setIsBulkPrintOpen(false)}
        pegawaiList={pegawaiList}
        kop={kop}
        pejabat={pejabat}
        settings={settings}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        bulanNama={NAMA_BULAN[selectedMonth]}
        customHolidays={customHolidays}
      />

      {/* Modal: Set Cuti / Dinas Luar / Izin */}
      <SetAbsenceModal
        isOpen={isAbsenceModalOpen}
        onClose={() => setIsAbsenceModalOpen(false)}
        maxDay={totalDays}
        onApply={handleApplyAbsence}
      />

      {/* Tampilan Siap Print (Mode Fullscreen Print-Ready Preview) */}
      {isPrintPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md overflow-y-auto flex flex-col items-center print:bg-white print:static print:inset-auto print:overflow-visible print:z-auto print:block animate-in fade-in">
          {/* Top Sticky Floating Action Bar (Disembunyikan saat dicetak kertas/PDF) */}
          <div className="sticky top-0 z-50 w-full bg-slate-900/95 border-b border-slate-700/80 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-white print:hidden shadow-xl">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPrintPreviewOpen(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer select-none"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Editor
              </button>
              <div className="h-5 w-[1px] bg-slate-700 hidden sm:block" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-wide">Tampilan Siap Print</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    A4 Portrait • Margin Normal (20mm)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {currentPegawai.nama} • {NAMA_BULAN[selectedMonth]} {selectedYear}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Tombol 1: Cetak Langsung ke Printer */}
              <button
                type="button"
                onClick={handlePrintDirect}
                disabled={isPrinting}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer select-none disabled:opacity-60 ${
                  printSuccessMessage
                    ? 'bg-blue-700 shadow-blue-700/40 ring-2 ring-blue-300'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30'
                }`}
                title="Cetak langsung ke mesin printer yang terhubung (Buka dialog cetak)"
              >
                {isPrinting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Menghubungkan Printer...
                  </>
                ) : printSuccessMessage ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    Dialog Cetak Aktif!
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    Cetak ke Printer
                  </>
                )}
              </button>

              {/* Tombol 2: Unduh & Simpan Dokumen PDF */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer select-none disabled:opacity-60 ${
                  pdfSuccessMessage
                    ? 'bg-emerald-500 shadow-emerald-500/40 ring-2 ring-emerald-300'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                }`}
                title="Simpan dan unduh langsung file PDF (.pdf) resmi ke komputer"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Menyimpan PDF...
                  </>
                ) : pdfSuccessMessage ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                    PDF Berhasil Diunduh!
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-white" />
                    Unduh / Simpan PDF
                  </>
                )}
              </button>

              {/* Tombol 3: Tutup Pratinjau */}
              <button
                type="button"
                onClick={() => setIsPrintPreviewOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer select-none"
                title="Tutup Pratinjau (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Toast Notification when Print Dialog is triggered */}
          {printSuccessMessage && (
            <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white border border-blue-500/50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-medium animate-in fade-in slide-in-from-top-2 print:hidden">
              <Printer className="w-5 h-5 text-blue-400 shrink-0" />
              <span>
                Jendela cetak printer telah aktif. Pastikan printer Anda terhubung lalu pilih <b>Cetak / Print</b>.
              </span>
            </div>
          )}

          {/* Toast Notification when PDF is downloaded */}
          {pdfSuccessMessage && (
            <div className="fixed top-18 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-2 print:hidden">
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              <span>File PDF berhasil diunduh ke komputer Anda!</span>
            </div>
          )}

          {/* Paper Canvas in Preview */}
          <div className="p-4 sm:p-8 w-full flex justify-center print:p-0 print:m-0">
            <div ref={printSheetRef} className="print:w-full">
              <AttendanceSheet
                kop={kop}
                pegawai={currentPegawai}
                records={currentRecords}
                pejabat={pejabat}
                bulanNama={NAMA_BULAN[selectedMonth]}
                tahun={selectedYear}
                isEditable={false}
                show31RowsFixed={show31RowsFixed}
                isBlankMode={sheetMode === 'BLANK'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
