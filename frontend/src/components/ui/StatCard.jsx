import React from 'react';

const StatCard = ({ title, value, icon, color, subValue }) => {
  return (
    <div className="bg-white dark:bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] group h-full flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{title}</p>
        <div className={`p-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 ${color}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
        {subValue && (
          <div className="mt-2">
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;