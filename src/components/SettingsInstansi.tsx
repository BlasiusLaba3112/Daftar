import React, { useState, useEffect } from 'react';
import { AttendanceSettings, KopInstansi, PejabatPenandatangan } from '../types';
import { EmblemLogo } from './EmblemLogo';
import { Building2, UserCheck, Clock, Shield, Upload, RotateCcw, Plus, Trash2, Save, Check, CheckCircle } from 'lucide-react';
import { DEFAULT_KOP, DEFAULT_PEJABAT, DEFAULT_SETTINGS } from '../utils/storage';

interface SettingsInstansiProps {
  kop: KopInstansi;
  pejabat: PejabatPenandatangan;
  settings: AttendanceSettings;
  customHolidays: Record<string, string>;
  onSaveKop: (kop: KopInstansi) => void;
  onSavePejabat: (pejabat: PejabatPenandatangan) => void;
  onSaveSettings: (settings: AttendanceSettings) => void;
  onSaveHolidays: (holidays: Record<string, string>) => void;
}

export const SettingsInstansi: React.FC<SettingsInstansiProps> = ({
  kop,
  pejabat,
  settings,
  customHolidays,
  onSaveKop,
  onSavePejabat,
  onSaveSettings,
  onSaveHolidays
}) => {
  const [activeTab, setActiveTab] = useState<'KOP' | 'PEJABAT' | 'JAM_KERJA' | 'LIBUR'>('KOP');

  // Form states
  const [kopForm, setKopForm] = useState<KopInstansi>({ ...kop });
  const [pejabatForm, setPejabatForm] = useState<PejabatPenandatangan>({ ...pejabat });
  const [settingsForm, setSettingsForm] = useState<AttendanceSettings>({ ...settings });
  const [holidaysForm, setHolidaysForm] = useState<Record<string, string>>({ ...customHolidays });

  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [kopSaved, setKopSaved] = useState(false);
  const [pejabatSaved, setPejabatSaved] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    setKopForm(kop);
  }, [kop]);

  useEffect(() => {
    setPejabatForm(pejabat);
  }, [pejabat]);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  const showNotification = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveKop = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveKop(kopForm);
    setKopSaved(true);
    showNotification();
    setTimeout(() => setKopSaved(false), 3000);
  };

  const handleSavePejabat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSavePejabat(pejabatForm);
    setPejabatSaved(true);
    showNotification();
    setTimeout(() => setPejabatSaved(false), 3000);
  };

  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveSettings(settingsForm);
    setSettingsSaved(true);
    showNotification();
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        const result = uploadEvt.target?.result as string;
        setKopForm(prev => ({ ...prev, logoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddHoliday = () => {
    if (!newHolidayDate || !newHolidayName) return;
    const updated = { ...holidaysForm, [newHolidayDate]: newHolidayName };
    setHolidaysForm(updated);
    onSaveHolidays(updated);
    setNewHolidayDate('');
    setNewHolidayName('');
    showNotification();
  };

  const handleDeleteHoliday = (dateKey: string) => {
    const updated = { ...holidaysForm };
    delete updated[dateKey];
    setHolidaysForm(updated);
    onSaveHolidays(updated);
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 text-xs font-medium">
        <button
          onClick={() => setActiveTab('KOP')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-colors ${
            activeTab === 'KOP'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Kop Surat & Logo Instansi
        </button>

        <button
          onClick={() => setActiveTab('PEJABAT')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-colors ${
            activeTab === 'PEJABAT'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Pejabat Penandatangan
        </button>

        <button
          onClick={() => setActiveTab('JAM_KERJA')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-colors ${
            activeTab === 'JAM_KERJA'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          Aturan Jam Kerja & Variasi Otomatis
        </button>

        <button
          onClick={() => setActiveTab('LIBUR')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-colors ${
            activeTab === 'LIBUR'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          Hari Libur & Cuti
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2 rounded-lg flex items-center justify-between animate-in fade-in">
          <span>Pengaturan berhasil disimpan!</span>
          <span className="text-emerald-500 font-bold">✓</span>
        </div>
      )}

      {/* TAB 1: KOP SURAT */}
      {activeTab === 'KOP' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleSaveKop} className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
              <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <EmblemLogo customUrl={kopForm.logoUrl} size={64} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800">Logo Instansi pada Kop</h4>
                <p className="text-slate-500 text-[11px] mb-2">
                  Secara default menggunakan Lambang Resmi Kabupaten Sikka. Anda juga dapat mengunggah logo instansi atau puskesmas kustom (format PNG/JPG transparan).
                </p>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-medium">
                    <Upload className="w-3.5 h-3.5" />
                    Unggah Logo Kustom
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {kopForm.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setKopForm(prev => ({ ...prev, logoUrl: '' }))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Gunakan Logo Default Sikka
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pemerintah Daerah (Baris 1)
                </label>
                <input
                  type="text"
                  value={kopForm.pemerintah}
                  onChange={(e) => setKopForm({ ...kopForm, pemerintah: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dinas Terkait (Baris 2)
                </label>
                <input
                  type="text"
                  value={kopForm.dinas}
                  onChange={(e) => setKopForm({ ...kopForm, dinas: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Unit Kerja / Puskesmas (Baris 3 - Judul Utama)
              </label>
              <input
                type="text"
                value={kopForm.unitKerja}
                onChange={(e) => setKopForm({ ...kopForm, unitKerja: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Alamat Lengkap, Kode Pos, & No. Telepon
              </label>
              <input
                type="text"
                value={kopForm.alamat}
                onChange={(e) => setKopForm({ ...kopForm, alamat: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pos Elektronik / Email
                </label>
                <input
                  type="text"
                  value={kopForm.email}
                  onChange={(e) => setKopForm({ ...kopForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Website / Web
                </label>
                <input
                  type="text"
                  value={kopForm.web}
                  onChange={(e) => setKopForm({ ...kopForm, web: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center gap-3">
              <button
                type="button"
                onClick={() => setKopForm(DEFAULT_KOP)}
                className="text-slate-500 hover:text-slate-700 underline text-xs"
              >
                Reset ke Standar Puskesmas Boganatar
              </button>

              <button
                type="submit"
                onClick={(e) => handleSaveKop(e)}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer select-none active:scale-95 ${
                  kopSaved 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300 shadow-emerald-500/20' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md shadow-blue-500/20'
                }`}
              >
                {kopSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Kop Berhasil Disimpan!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Kop Surat
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: PEJABAT PENANDATANGAN */}
      {activeTab === 'PEJABAT' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleSavePejabat} className="space-y-4 text-xs">
            <p className="text-slate-500 text-xs mb-3">
              Data pimpinan atau kepala puskesmas yang mengesahkan daftar hadir pada bagian tanda tangan bawah (Mengetahui).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jabatan Penandatangan
                </label>
                <input
                  type="text"
                  value={pejabatForm.jabatan}
                  onChange={(e) => setPejabatForm({ ...pejabatForm, jabatan: e.target.value })}
                  placeholder="Contoh: Kepala UPT Puskesmas Boganatar"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap beserta Gelar
                </label>
                <input
                  type="text"
                  value={pejabatForm.nama}
                  onChange={(e) => setPejabatForm({ ...pejabatForm, nama: e.target.value })}
                  placeholder="Contoh: Christiana Lensi, S.KM"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pangkat / Golongan Ruang
                </label>
                <input
                  type="text"
                  value={pejabatForm.pangkatGolongan}
                  onChange={(e) => setPejabatForm({ ...pejabatForm, pangkatGolongan: e.target.value })}
                  placeholder="Contoh: Penata Tk I, III/d"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NIP (Nomor Induk Pegawai)
                </label>
                <input
                  type="text"
                  value={pejabatForm.nip}
                  onChange={(e) => setPejabatForm({ ...pejabatForm, nip: e.target.value })}
                  placeholder="Contoh: 19750403 200112 2 003"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center gap-3">
              <button
                type="button"
                onClick={() => setPejabatForm(DEFAULT_PEJABAT)}
                className="text-slate-500 hover:text-slate-700 underline text-xs"
              >
                Reset ke Default (Christiana Lensi, S.KM)
              </button>

              <button
                type="submit"
                onClick={(e) => handleSavePejabat(e)}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer select-none active:scale-95 ${
                  pejabatSaved 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300 shadow-emerald-500/20' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md shadow-blue-500/20'
                }`}
              >
                {pejabatSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Pejabat Berhasil Disimpan!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Pejabat Penandatangan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: ATURAN JAM KERJA & VARIASI OTOMATIS */}
      {activeTab === 'JAM_KERJA' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Pola Hari Kerja Mingguan
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <label className={`p-3 border rounded-xl flex items-center gap-3 cursor-pointer ${
                  settingsForm.polaKerja === '6_HARI' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200'
                }`}>
                  <input
                    type="radio"
                    name="polaKerja"
                    checked={settingsForm.polaKerja === '6_HARI'}
                    onChange={() => setSettingsForm({ ...settingsForm, polaKerja: '6_HARI' })}
                  />
                  <div>
                    <div className="font-semibold text-slate-800">6 Hari Kerja</div>
                    <div className="text-[11px] text-slate-500">Senin - Sabtu (Minggu Libur)</div>
                  </div>
                </label>

                <label className={`p-3 border rounded-xl flex items-center gap-3 cursor-pointer ${
                  settingsForm.polaKerja === '5_HARI' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200'
                }`}>
                  <input
                    type="radio"
                    name="polaKerja"
                    checked={settingsForm.polaKerja === '5_HARI'}
                    onChange={() => setSettingsForm({ ...settingsForm, polaKerja: '5_HARI' })}
                  />
                  <div>
                    <div className="font-semibold text-slate-800">5 Hari Kerja</div>
                    <div className="text-[11px] text-slate-500">Senin - Jumat (Sabtu & Minggu Libur)</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Standar Jam Kerja */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800">Jam Masuk & Pulang Standar</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Jam Masuk Standar</label>
                  <input
                    type="time"
                    value={settingsForm.jamMasukStandar}
                    onChange={(e) => setSettingsForm({ ...settingsForm, jamMasukStandar: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Jam Pulang Reguler</label>
                  <input
                    type="time"
                    value={settingsForm.jamKeluarStandar}
                    onChange={(e) => setSettingsForm({ ...settingsForm, jamKeluarStandar: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Jam Pulang Hari Jumat</label>
                  <input
                    type="time"
                    value={settingsForm.jamKeluarJumat}
                    onChange={(e) => setSettingsForm({ ...settingsForm, jamKeluarJumat: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Jam Pulang Hari Sabtu</label>
                  <input
                    type="time"
                    value={settingsForm.jamKeluarSabtu}
                    onChange={(e) => setSettingsForm({ ...settingsForm, jamKeluarSabtu: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Variasi Menit Alami / Smart Realism */}
            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-amber-900">Variasi Menit Acak Realistis (Anti-Robot)</h4>
                  <p className="text-amber-800 text-[11px]">
                    Jika diaktifkan, jam masuk dan pulang dibuat acak alami di sekitar jam dinas (contoh masuk: 07:18, 07:23, 07:27) sehingga terlihat seperti presensi nyata.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.gunakanVariasiMenit}
                    onChange={(e) => setSettingsForm({ ...settingsForm, gunakanVariasiMenit: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {settingsForm.gunakanVariasiMenit && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px]">
                  <div>
                    <label className="block text-slate-600">Masuk Terawal (-menit)</label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={settingsForm.rentangMenitMasukAwal}
                      onChange={(e) => setSettingsForm({ ...settingsForm, rentangMenitMasukAwal: Number(e.target.value) })}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                    />
                    <span className="text-[10px] text-slate-400">Contoh: 15 (07:15)</span>
                  </div>
                  <div>
                    <label className="block text-slate-600">Masuk Terakhir (-menit)</label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={settingsForm.rentangMenitMasukAkhir}
                      onChange={(e) => setSettingsForm({ ...settingsForm, rentangMenitMasukAkhir: Number(e.target.value) })}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                    />
                    <span className="text-[10px] text-slate-400">Contoh: 2 (07:28)</span>
                  </div>
                  <div>
                    <label className="block text-slate-600">Pulang Terawal (+menit)</label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={settingsForm.rentangMenitKeluarAwal}
                      onChange={(e) => setSettingsForm({ ...settingsForm, rentangMenitKeluarAwal: Number(e.target.value) })}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                    />
                    <span className="text-[10px] text-slate-400">Contoh: 2 (14:02)</span>
                  </div>
                  <div>
                    <label className="block text-slate-600">Pulang Terakhir (+menit)</label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={settingsForm.rentangMenitKeluarAkhir}
                      onChange={(e) => setSettingsForm({ ...settingsForm, rentangMenitKeluarAkhir: Number(e.target.value) })}
                      className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                    />
                    <span className="text-[10px] text-slate-400">Contoh: 15 (14:15)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mode Paraf & Keterangan Libur */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Format Kolom Paraf Otomatis
                </label>
                <select
                  value={settingsForm.modeParaf}
                  onChange={(e) => setSettingsForm({ ...settingsForm, modeParaf: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="KOSONG">Kosong (Tanda Tangan Pena Basah Manual)</option>
                  <option value="INISIAL">Inisial Pegawai Otomatis (Contoh: "KD")</option>
                  <option value="CEKLIS">Tanda Ceklis (✓)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Teks Keterangan Hari Libur / Minggu
                </label>
                <input
                  type="text"
                  value={settingsForm.teksLibur}
                  onChange={(e) => setSettingsForm({ ...settingsForm, teksLibur: e.target.value })}
                  placeholder="Contoh: LIBUR atau -"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center gap-3">
              <button
                type="button"
                onClick={() => setSettingsForm(DEFAULT_SETTINGS)}
                className="text-slate-500 hover:text-slate-700 underline text-xs"
              >
                Reset ke Default
              </button>

              <button
                type="submit"
                onClick={(e) => handleSaveSettings(e)}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer select-none active:scale-95 ${
                  settingsSaved 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300 shadow-emerald-500/20' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md shadow-blue-500/20'
                }`}
              >
                {settingsSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Aturan Berhasil Disimpan!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Aturan Jam Kerja
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: HARI LIBUR & CUTI */}
      {activeTab === 'LIBUR' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5 text-xs">
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">Daftar Hari Libur Khusus / Cuti Bersama</h4>
            <p className="text-slate-500 text-[11px]">
              Hari libur nasional standar (1 Januari, 17 Agustus, 25 Desember, dll) otomatis terdeteksi. Tambahkan tanggal libur khusus instansi atau cuti bersama di bawah ini:
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              value={newHolidayDate}
              onChange={(e) => setNewHolidayDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <input
              type="text"
              placeholder="Keterangan Libur (contoh: HUT Kabupaten Sikka / Cuti Bersama)"
              value={newHolidayName}
              onChange={(e) => setNewHolidayName(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              onClick={handleAddHoliday}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Tambah Libur
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Tanggal (YYYY-MM-DD)</th>
                  <th className="py-2.5 px-4">Keterangan Libur</th>
                  <th className="py-2.5 px-3 text-center w-20">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.keys(holidaysForm).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-400">
                      Belum ada hari libur khusus yang ditambahkan.
                    </td>
                  </tr>
                ) : (
                  Object.entries(holidaysForm).map(([date, name]) => (
                    <tr key={date} className="hover:bg-slate-50">
                      <td className="py-2 px-4 font-mono font-medium">{date}</td>
                      <td className="py-2 px-4">{name}</td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleDeleteHoliday(date)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Hapus libur"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
