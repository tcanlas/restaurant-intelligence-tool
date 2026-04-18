import React, { useState } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency, formatPercent } from '../../utils/analytics';

const VelocityChart = ({ chartData, isDark }) => {
  const [visibleSeries, setVisibleSeries] = useState({
    Sales: true,
    Labor: true,
    'Labor %': true
  });

  const handleLegendClick = (e) => {
    const { value } = e;
    setVisibleSeries(prev => ({ ...prev, [value]: !prev[value] }));
  };

  const renderLegendText = (value) => {
    return (
      <span className={visibleSeries[value] 
        ? 'text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider' 
        : 'text-slate-300 dark:text-slate-600 text-[10px] uppercase tracking-wider'}>
        {value}
      </span>
    );
  };

  return (
    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10">
      <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Velocity Metrics</h3>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%" className="filter drop-shadow-lg">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLabor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#ffffff08" : "#00000008"} />
            <XAxis dataKey="date" hide={true} />
            <YAxis yAxisId="left" hide={true} />
            <YAxis yAxisId="right" orientation="right" hide={true} domain={[0, 100]} />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle" 
              height={36} 
              formatter={renderLegendText}
              onClick={handleLegendClick}
              wrapperStyle={{ cursor: 'pointer', userSelect: 'none' }}
            />
            <Area yAxisId="left" type="monotone" name="Sales" dataKey="net_sales" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" hide={!visibleSeries.Sales} />
            <Area yAxisId="left" type="monotone" name="Labor" dataKey="labor_cost" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorLabor)" hide={!visibleSeries.Labor} />
            <Line yAxisId="right" type="monotone" name="Labor %" dataKey="labor_pct" stroke="#10b981" strokeWidth={2} dot={false} hide={!visibleSeries['Labor %']} />
            <Tooltip 
              formatter={(value, name) => name === 'Labor %' ? formatPercent(value) : formatCurrency(value)}
              contentStyle={{ 
                backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                borderRadius: '20px', 
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)', 
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VelocityChart;