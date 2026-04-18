import React from 'react';
import PredictiveHeatMap from './Dashboard/PredictiveHeatMap';
import VelocityChart from './Dashboard/VelocityChart';
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
  const getTrend = (curr, prev) => {
    const change = calculatePercentageChange(curr, prev);
    if (!change) return null;
    return `${change > 0 ? '+' : ''}${formatPercent(change)}`;
  };

  const latest = chartData[chartData.length - 1];
  const prev = chartData[chartData.length - 2];

  const laborPct = calculateLaborPercentage(summary.total_labor, summary.total_sales);

  const statsConfig = [
    {
      title: "Net Sales",
      value: formatCurrency(summary.total_sales),
      color: "text-emerald-500",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
      trend: getTrend(latest?.net_sales, prev?.net_sales)
    },
    {
      title: "Avg. Check",
      value: formatCurrency(calculateAverageCheck(summary.total_sales, summary.total_orders)),
      color: "text-orange-500",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      trend: getTrend(calculateAverageCheck(latest?.net_sales, latest?.order_count), calculateAverageCheck(prev?.net_sales, prev?.order_count))
    },
    {
      title: "Labor Cost",
      value: formatCurrency(summary.total_labor),
      color: "text-indigo-500",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      trend: getTrend(latest?.labor_cost, prev?.labor_cost)
    },
    {
      title: "Labor Efficiency",
      value: formatPercent(laborPct),
      color: laborPct > 30 ? "text-red-500" : "text-orange-500",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      trend: getTrend(latest?.labor_pct, prev?.labor_pct),
      subValue: laborPct > 30 && (
        <p className="text-[10px] text-red-600 dark:text-red-500/80 font-black animate-pulse tracking-tighter uppercase">Critical Exposure</p>
      )
    }
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* Predictive Heat Map */}
      <PredictiveHeatMap baselines={mockBaselines} rawHistory={hourlyHistoricalData} />

      {summary && !summary.error ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {statsConfig.map((stat, idx) => (
              <StatCard key={idx} {...stat} loading={loading} />
            ))}
          </div>

          {/* Trend Chart */}
          {chartData.length > 0 && <VelocityChart chartData={chartData} isDark={isDark} />}
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