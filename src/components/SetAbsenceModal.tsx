import React, { useState } from 'react';
import { X, Calendar, Check } from 'lucide-react';

interface SetAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxDay: number;
  onApply: (startDay: number, endDay: number, status: string) => void;
}

export const SetAbsenceModal: React.FC<SetAbsenceModalProps> = ({
  isOpen,
  onClose,
  maxDay,
  onApply
}) => {
  const [startDay, setStartDay] = useState(1);
  const [endDay, setEndDay] = useState(1);
  const [statusType, setStatusType] = useState('Cuti Tahunan');
  const [customText, setCustomText] = useState('');

  if (!isOpen) return null;

  const presetStatuses = [
    'Cuti Tahunan',
    'Cuti Sakit',
    'Cuti Melahirkan',
    'Dinas Luar (DL)',
    'Tugas Belajar',
    'Izin',
    'Sakit (Surat Dokter)',
    'Pelatihan / Bimtek',
    'WFH'
  ];

  const handleConfirm = () => {
    const finalStatus = statusType === 'LAINNYA' ? (customText.trim() || 'Keterangan') : statusType;
    onApply(Number(startDay), Number(endDay), finalStatus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              Atur Keterangan Khusus (Cuti / DL / Sakit)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Rentang Tanggal
            </label>
            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <span className="text-[11px] text-slate-500">Dari Tanggal:</span>
                <select
                  value={startDay}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setStartDay(val);
                    if (val > endDay) setEndDay(val);
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white mt-0.5"
                >
                  {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      Tanggal {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[11px] text-slate-500">Sampai Tanggal:</span>
                <select
                  value={endDay}
                  onChange={(e) => setEndDay(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white mt-0.5"
                >
                  {Array.from({ length: maxDay }, (_, i) => i + 1)
                    .filter((d) => d >= startDay)
                    .map((d) => (
                      <option key={d} value={d}>
                        Tanggal {d}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Jenis Keterangan
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {presetStatuses.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusType(st)}
                  className={`px-2.5 py-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                    statusType === st
                      ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{st}</span>
                  {statusType === st && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Atau Masukkan Teks Manual:
            </label>
            <input
              type="text"
              placeholder="Contoh: Mengikuti Rapat Koordinasi Dinkes"
              value={customText}
              onChange={(e) => {
                setCustomText(e.target.value);
                setStatusType('LAINNYA');
              }}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-xs"
          >
            Terapkan ke Lembar
          </button>
        </div>
      </div>
    </div>
  );
};
