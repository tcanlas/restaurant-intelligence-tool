import React, { useState } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import PredictiveHeatMap from './Dashboard/PredictiveHeatMap';
import StatCard from '../components/ui/StatCard';
import { 
  formatCurrency, 
  formatPercent,
  calculateAverageCheck, 
  calculateLaborPercentage,
  calculatePercentageChange
} from '../utils/analytics';

const DashboardView = ({ 
  summary, 
  chartData, 
  isDark, 
  loading, 
  mockBaselines,
  hourlyHistoricalData
}) => {
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
    return <span className={visibleSeries[value] ? 'text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider' : 'text-slate-300 dark:text-slate-600 text-[10px] uppercase tracking-wider'}>{value}</span>;
  };

  const renderTrend = (current, previous, invertColor = false) => {
    const change = calculatePercentageChange(current, previous);
    if (change === 0) return null;
    
    const isPositive = change > 0;
    // For Labor %, "Positive" change is actually "Negative" performance
    const isGood = invertColor ? !isPositive : isPositive;
    
    const colorClass = isGood 
      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
      : "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20";

    return (
      <span className={`${colorClass} px-2 py-0.5 rounded-full border text-[10px] font-bold inline-flex items-center`}>
        {isPositive ? '↑' : '↓'} {formatPercent(Math.abs(change))}
      </span>
    );
  };

  const latest = chartData[chartData.length - 1];
  const prev = chartData[chartData.length - 2];

  const laborPct = calculateLaborPercentage(summary.total_labor, summary.total_sales);

  const statsConfiguration = [
    {
      title: "Net Sales",
      value: formatCurrency(summary.total_sales),
      color: "text-emerald-500",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
      subValue: renderTrend(latest?.net_sales, prev?.net_sales)
    },
    {
      title: "Avg. Check",
      value: formatCurrency(calculateAverageCheck(summary.total_sales, summary.total_orders)),
      color: "text-orange-500",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      subValue: renderTrend(calculateAverageCheck(latest?.net_sales, latest?.order_count), calculateAverageCheck(prev?.net_sales, prev?.order_count))
    },
    {
      title: "Labor Cost",
      value: formatCurrency(summary.total_labor),
      color: "text-indigo-500",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      subValue: renderTrend(latest?.labor_cost, prev?.labor_cost, true)
    },
    {
      title: "Labor Efficiency",
      value: formatPercent(laborPct),
      color: laborPct > 30 ? "text-red-500" : "text-orange-500",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      subValue: laborPct > 30 && (
        <p className="text-[10px] text-red-600 dark:text-red-500/80 font-black animate-pulse tracking-tighter uppercase">Critical Exposure</p>
      )
    }
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* Predictive Heat Map */}
      <PredictiveHeatMap baselines={mockBaselines} rawHistory={hourlyHistoricalData} />

      {loading ? (
        <div className="flex justify-center items-center h-32 text-gray-400 animate-pulse font-bold text-[10px] uppercase tracking-widest">
          Vault Sync in Progress...
        </div>
      ) : summary && !summary.error ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {statsConfiguration.map((stat, idx) => (
              <StatCard key={idx} {...stat} />
            ))}
          </div>

          {/* Trend Chart */}
          {chartData.length > 0 && (
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
          )}
        </div>
      ) : (
        <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 p-8 rounded-[2.5rem] border border-red-100 dark:border-red-500/20 text-center">
          <svg className="w-8 h-8 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-[10px] font-black uppercase tracking-widest mb-2">Data Integrity Error</p>
          <p className="text-sm opacity-80">Vault data stream interrupted. Verify <code>sales.csv</code> integrity.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardView;