import React from 'react';

const SalesOverview = ({ summary }) => {
  if (!summary) return null;

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const laborPercentage = summary.total_sales > 0
    ? (summary.total_labor / summary.total_sales) * 100
    : 0;

  const avgOrderValue = summary.total_orders > 0
    ? summary.total_sales / summary.total_orders
    : 0;

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 transition-all hover:scale-[1.02] group">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Net Sales</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{formatCurrency(summary.total_sales)}</p>
          <div className="mt-2 flex items-center text-[10px] font-bold text-emerald-400/80">
            <span className="bg-emerald-500/10 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">↑ 12% LW</span>
          </div>
        </div>
        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 transition-all hover:scale-[1.02] group">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Avg Order</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{formatCurrency(avgOrderValue)}</p>
          <div className="mt-2 flex items-center text-[10px] font-bold text-slate-400 dark:text-slate-500">
            <span className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/10">AOV Index</span>
          </div>
        </div>
      </div>

      <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 flex justify-between items-center transition-all hover:scale-[1.01]">
        <div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Labor Cost</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{formatCurrency(summary.total_labor)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Labor %</p>
          <p className={`text-2xl font-black mt-1 tracking-tight ${laborPercentage > 30 ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
            {laborPercentage.toFixed(1)}%
          </p>
          {laborPercentage > 30 && <p className="text-[10px] text-red-600 dark:text-red-500/80 font-black animate-pulse tracking-tighter">CRITICAL EXPOSURE</p>}
        </div>
      </div>
    </div>
  );
};

export default SalesOverview;