import React, { useState, useRef } from 'react';
import { Pegawai } from '../types';
import { exportPegawaiToExcel, parsePegawaiFile } from '../utils/excelExport';
import { generateInitials } from '../utils/attendanceGenerator';
import { 
  Users, 
  UserPlus, 
  Search, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Printer, 
  Sparkles,
  FileText
} from 'lucide-react';

interface MasterPegawaiProps {
  pegawaiList: Pegawai[];
  onSaveList: (list: Pegawai[]) => void;
  onSelectPegawaiForSheet: (pegawai: Pegawai) => void;
  onOpenBulkPrint: () => void;
}

export const MasterPegawai: React.FC<MasterPegawaiProps> = ({
  pegawaiList,
  onSaveList,
  onSelectPegawaiForSheet,
  onOpenBulkPrint
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPegawai, setEditingPegawai] = useState<Pegawai | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Pegawai | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formError, setFormError] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState<Partial<Pegawai>>({
    nama: '',
    nip: '',
    tipeNip: 'NIP',
    jabatan: '',
    golongan: '',
    status: 'PNS',
    parafText: '',
    isActive: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredList = pegawaiList.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.jabatan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openAddModal = () => {
    setEditingPegawai(null);
    setFormError('');
    setFormData({
      nama: '',
      nip: '',
      tipeNip: 'NIP',
      jabatan: '',
      golongan: '',
      status: 'PNS',
      parafText: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Pegawai) => {
    setEditingPegawai(p);
    setFormError('');
    setFormData({
      ...p,
      tipeNip: p.tipeNip || (p.status === 'NRPK' ? 'NRPK' : 'NIP')
    });
    setIsModalOpen(true);
  };

  const handleDelete = (p: Pegawai) => {
    setDeleteCandidate(p);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama?.trim()) {
      setFormError('Nama pegawai wajib diisi!');
      return;
    }

    const parafAuto = formData.parafText || generateInitials(formData.nama || '');

    if (editingPegawai) {
      // Edit
      const updated = pegawaiList.map(p => 
        p.id === editingPegawai.id 
          ? { 
              ...(formData as Pegawai), 
              id: p.id, 
              parafText: parafAuto,
              tipeNip: formData.tipeNip || (formData.status === 'NRPK' ? 'NRPK' : 'NIP')
            }
          : p
      );
      onSaveList(updated);
      setFeedbackMessage({ type: 'success', text: `Data pegawai "${formData.nama}" berhasil diperbarui.` });
    } else {
      // Add
      const newPegawai: Pegawai = {
        id: `peg-${Date.now()}`,
        nama: formData.nama.trim(),
        nip: formData.nip?.trim() || '',
        tipeNip: formData.tipeNip || (formData.status === 'NRPK' ? 'NRPK' : 'NIP'),
        jabatan: formData.jabatan?.trim() || 'Staff',
        golongan: formData.golongan?.trim() || '',
        status: (formData.status as any) || 'PNS',
        parafText: parafAuto,
        isActive: formData.isActive !== false
      };
      onSaveList([...pegawaiList, newPegawai]);
      setFeedbackMessage({ type: 'success', text: `Pegawai "${formData.nama}" berhasil ditambahkan.` });
    }
    setTimeout(() => setFeedbackMessage(null), 3000);
    setIsModalOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parsePegawaiFile(file);
      if (parsed.length === 0) {
        setFeedbackMessage({ type: 'error', text: 'Tidak ada data pegawai yang valid ditemukan di dalam file.' });
        setTimeout(() => setFeedbackMessage(null), 3500);
        return;
      }
      onSaveList([...pegawaiList, ...parsed]);
      setFeedbackMessage({ type: 'success', text: `Berhasil menambahkan ${parsed.length} pegawai dari file Excel.` });
      setTimeout(() => setFeedbackMessage(null), 3500);
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: `Gagal membaca file: ${err?.message || 'Format tidak didukung'}` });
      setTimeout(() => setFeedbackMessage(null), 3500);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    exportPegawaiToExcel(pegawaiList);
  };

  return (
    <div className="space-y-6">
      {feedbackMessage && (
        <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between animate-in fade-in ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span>{feedbackMessage.text}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Master Data Pegawai</h2>
              <p className="text-xs text-slate-500">
                Kelola daftar pegawai, NIP, jabatan, dan inisial paraf untuk pembuatan daftar hadir otomatis.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-xs"
            title="Import data pegawai dari file Excel (.xlsx / .csv)"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            Import Excel
          </button>
          
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-xs"
            title="Unduh seluruh data pegawai ke format Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Excel
          </button>

          <button
            onClick={onOpenBulkPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Massal Semua
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Tambah Pegawai
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, NIP, atau jabatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">Semua Status ({pegawaiList.length})</option>
            <option value="PNS">PNS</option>
            <option value="PPPK">PPPK</option>
            <option value="PPPK Paruh Waktu">PPPK Paruh Waktu</option>
            <option value="NRPK">NRPK</option>
            <option value="Honorer">Honorer</option>
            <option value="PTT">PTT</option>
            <option value="Magang">Magang</option>
          </select>

          <span className="text-xs text-slate-400 ml-auto sm:ml-2">
            Menampilkan: <b>{filteredList.length}</b> pegawai
          </span>
        </div>
      </div>

      {/* Table Pegawai */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Lengkap & NIP</th>
                <th className="py-3 px-4">Jabatan</th>
                <th className="py-3 px-4">Pangkat / Golongan</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Paraf</th>
                <th className="py-3 px-4 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada pegawai yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredList.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{p.nama}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {p.nip ? `${p.tipeNip === 'NRPK' || p.status === 'NRPK' ? 'NRPK' : 'NIP'}. ${p.nip}` : <span className="italic text-slate-400">Tidak ada NIP/NRPK</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {p.jabatan}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.golongan || '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.status === 'PNS' ? 'bg-blue-100 text-blue-800' :
                        p.status === 'PPPK' ? 'bg-purple-100 text-purple-800' :
                        p.status === 'PPPK Paruh Waktu' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                        p.status === 'NRPK' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status || 'PNS'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-serif italic font-bold text-slate-800 px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                        {p.parafText || generateInitials(p.nama)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectPegawaiForSheet(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                          title="Buka dan cetak lembar daftar hadir pegawai ini"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Buka Lembar
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit data pegawai"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Hapus pegawai"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Pegawai */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingPegawai ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
                  {formError}
                </div>
              )}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap beserta Gelar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kornelia P.K. Daro,A.Md.Keb"
                  value={formData.nama || ''}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-semibold text-slate-700">
                    Nomor Identitas ({formData.tipeNip || 'NIP'})
                  </label>
                  <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tipeNip: 'NIP' })}
                      className={`px-2.5 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                        (formData.tipeNip || 'NIP') === 'NIP'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      NIP
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tipeNip: 'NRPK' })}
                      className={`px-2.5 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                        formData.tipeNip === 'NRPK'
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      NRPK
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <select
                    value={formData.tipeNip || 'NIP'}
                    onChange={(e) => setFormData({ ...formData, tipeNip: e.target.value as 'NIP' | 'NRPK' })}
                    className="w-24 px-2.5 py-2 border border-slate-300 rounded-lg bg-slate-50 font-bold text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    title="Pilih jenis nomor identitas"
                  >
                    <option value="NIP">NIP</option>
                    <option value="NRPK">NRPK</option>
                  </select>
                  <input
                    type="text"
                    placeholder={(formData.tipeNip || 'NIP') === 'NIP' ? 'Contoh: 19890326 201705 2 004' : 'Contoh: 14.1.002.12345 (NRPK)'}
                    value={formData.nip || ''}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-sm"
                  />
                </div>
                <p className="text-[10.5px] text-slate-500 mt-1">
                  Pilih <b>NIP</b> untuk PNS/PPPK atau <b>NRPK</b> untuk Tenaga Kontrak / Pegawai Daerah.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jabatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bidan / Perawat"
                    value={formData.jabatan || ''}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pangkat / Golongan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pengatur, II/c"
                    value={formData.golongan || ''}
                    onChange={(e) => setFormData({ ...formData, golongan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status Kepegawaian
                  </label>
                  <select
                    value={formData.status || 'PNS'}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setFormData({ 
                        ...formData, 
                        status: newStatus as any,
                        tipeNip: newStatus === 'NRPK' ? 'NRPK' : (newStatus === 'PNS' || newStatus === 'PPPK' ? 'NIP' : formData.tipeNip || 'NIP')
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                    <option value="PPPK Paruh Waktu">PPPK Paruh Waktu</option>
                    <option value="NRPK">NRPK</option>
                    <option value="Honorer">Honorer</option>
                    <option value="PTT">PTT</option>
                    <option value="Magang">Magang</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Inisial Paraf
                  </label>
                  <input
                    type="text"
                    placeholder="Otomatis dari nama (cth: KD)"
                    value={formData.parafText || ''}
                    onChange={(e) => setFormData({ ...formData, parafText: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Pegawai (Ya dan Tidak) */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden p-6 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Hapus Data Pegawai?
            </h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus data pegawai <b className="text-slate-900">{deleteCandidate.nama}</b> ({deleteCandidate.jabatan}) dari Master Data?
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer select-none active:scale-95"
              >
                Tidak
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = pegawaiList.filter(p => p.id !== deleteCandidate.id);
                  onSaveList(updated);
                  const deletedName = deleteCandidate.nama;
                  setDeleteCandidate(null);
                  setFeedbackMessage({ type: 'success', text: `Pegawai "${deletedName}" berhasil dihapus dari Master Data.` });
                  setTimeout(() => setFeedbackMessage(null), 3000);
                }}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors shadow-xs active:scale-95 cursor-pointer select-none"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
