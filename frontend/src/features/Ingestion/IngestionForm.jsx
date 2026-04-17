import React, { useState, useRef } from 'react';
import { 
  calculateWalkins, 
  calculateSPLH, 
  calculateAverageCheck,
  formatCurrency
} from '../../utils/analytics';

const IngestionForm = ({ onCommit }) => {
  const dateInputRef = useRef(null);

  const [entryData, setEntryData] = useState({
    date: new Date().toISOString().split('T')[0],
    netSales: '',
    laborCost: '',
    laborHours: '',
    compsVoids: '',
    totalCovers: '',
    reservations: '',
    eventIntensity: '1',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEntryData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const success = await onCommit(entryData);
    if (success) {
      setEntryData({
        date: new Date().toISOString().split('T')[0],
        netSales: '',
        laborCost: '',
        laborHours: '',
        compsVoids: '',
        totalCovers: '',
        reservations: '',
        eventIntensity: '1',
      });
    }
  };

  return (
    <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
      <div className="px-8 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Data Ingestion</h3>
            <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Daily Record Entry</p>
          </div>
          <div className="bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Secure Channel</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="col-span-2 group relative">
            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1 tracking-[0.2em] mb-2 block">Reporting Period</label>
            <div className="relative">
              <button 
                type="button"
                onClick={() => dateInputRef.current?.showPicker()}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 z-10 transition-transform hover:scale-110 active:scale-90"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <input 
                ref={dateInputRef}
                type="date" 
                name="date" 
                value={entryData.date} 
                onChange={handleInputChange} 
                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500/20 transition-all dark:text-white cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden" 
              />
            </div>
          </div>

          {/* Column 1: Financials */}
          <div className="space-y-5">
            <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-1">Financials</p>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Net Sales ($)</label>
              <input type="number" name="netSales" value={entryData.netSales} onChange={handleInputChange} placeholder="0.00" className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-orange-500/50 transition-all dark:text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Total Covers</label>
              <input type="number" name="totalCovers" value={entryData.totalCovers} onChange={handleInputChange} placeholder="0" className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-orange-500/50 transition-all dark:text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Avg Check (Derived)</label>
              <div className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-400 dark:text-slate-500 font-bold">
                {formatCurrency(calculateAverageCheck(entryData.netSales, entryData.totalCovers))}
              </div>
            </div>
          </div>

          {/* Column 2: Operations */}
          <div className="space-y-5">
            <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-1">Operations</p>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Labor Cost ($)</label>
              <input type="number" name="laborCost" value={entryData.laborCost} onChange={handleInputChange} placeholder="0.00" className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-orange-500/50 transition-all dark:text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Labor Hours</label>
              <input type="number" name="laborHours" value={entryData.laborHours} onChange={handleInputChange} placeholder="0.0" className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-orange-500/50 transition-all dark:text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Event Intensity (1-5)</label>
              <input type="number" name="eventIntensity" min="1" max="5" value={entryData.eventIntensity} onChange={handleInputChange} className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-orange-500/50 transition-all dark:text-white" />
            </div>
          </div>

          {/* Span 2: Capacity Volume */}
          <div className="col-span-2 space-y-5">
            <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-1">Capacity Volume</p>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Reservations</label>
                <input type="number" name="reservations" value={entryData.reservations} onChange={handleInputChange} placeholder="0" className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-orange-500/50 transition-all dark:text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Walk-ins</label>
                <div className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-400 dark:text-slate-500 font-bold">
                  {calculateWalkins(entryData.totalCovers, entryData.reservations)}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Efficiency (SPLH)</label>
                <div className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-400 dark:text-slate-500 font-bold">
                  {formatCurrency(calculateSPLH(entryData.netSales, entryData.laborHours))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <button onClick={handleSubmit} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-600/20 transition-all active:scale-[0.98] text-[10px] uppercase tracking-[0.3em]">
          Commit Data to Vault
        </button>
      </div>
    </div>
  );
};

export default IngestionForm;