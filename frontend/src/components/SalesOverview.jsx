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
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Net Sales</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(summary.total_sales)}</p>
          <div className="mt-2 flex items-center text-[10px] font-bold text-green-500">
            <span>↑ 12% vs LW</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Order (AOV)</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(avgOrderValue)}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Labor Cost</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(summary.total_labor)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Labor %</p>
          <p className={`text-2xl font-black mt-1 ${laborPercentage > 30 ? 'text-red-600' : 'text-orange-600'}`}>
            {laborPercentage.toFixed(1)}%
          </p>
          {laborPercentage > 30 && <p className="text-[10px] text-red-500 font-bold animate-pulse">OVER TARGET</p>}
        </div>
      </div>
    </div>
  );
};

export default SalesOverview;