import React from 'react';

const StatCard = ({ title, value, icon, color, trend, subValue, loading }) => {
  // Logic to determine trend intent
  const isPositive = typeof trend === 'number' ? trend > 0 : trend?.startsWith('+');
  const isNegative = typeof trend === 'number' ? trend < 0 : trend?.startsWith('-');
  
  const trendColor = isPositive 
    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
    : isNegative 
      ? "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20"
      : "text-slate-500 bg-slate-500/10 border-slate-500/20";

  return (
    <div className="bg-white dark:bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] group h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{title}</p>
        <div className={`p-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 ${color}`}>
          {icon}
        </div>
      </div>
      <div className="text-left">
        {loading ? (
          <div className="space-y-3">
            <div className="h-8 w-32 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
            <div className="h-4 w-20 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
          </div>
        ) : (
          <>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
            <div className="mt-2 flex items-center gap-2">
              {trend && (
                <span className={`${trendColor} px-2 py-0.5 rounded-full border text-[10px] font-bold inline-flex items-center`}>
                  {trend}
                </span>
              )}
              {subValue && (
                <div className="text-slate-400 dark:text-slate-500">
                  {subValue}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StatCard;