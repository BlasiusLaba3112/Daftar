import React from 'react';
import { FileText, Users, Settings, Printer, Sparkles, Building2 } from 'lucide-react';

interface NavbarProps {
  activeTab: 'SHEET' | 'PEGAWAI' | 'SETTINGS';
  onSelectTab: (tab: 'SHEET' | 'PEGAWAI' | 'SETTINGS') => void;
  onOpenBulkPrint: () => void;
  unitKerja: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenBulkPrint,
  unitKerja
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 print:hidden shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  Daftar Hadir Otomatis
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span className="truncate max-w-[240px] sm:max-w-sm">{unitKerja}</span>
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onSelectTab('SHEET')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'SHEET'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Lembar Presensi</span>
              <span className="sm:hidden">Lembar</span>
            </button>

            <button
              onClick={() => onSelectTab('PEGAWAI')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'PEGAWAI'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Master Pegawai</span>
              <span className="sm:hidden">Pegawai</span>
            </button>

            <button
              onClick={() => onSelectTab('SETTINGS')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'SETTINGS'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Kop & Pengaturan</span>
              <span className="sm:hidden">Kop</span>
            </button>
          </nav>

          {/* Quick Bulk Print Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenBulkPrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-sm shadow-emerald-500/20 active:scale-98 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Cetak Massal</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
