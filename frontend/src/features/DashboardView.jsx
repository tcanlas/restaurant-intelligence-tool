import React from 'react';
import { TrendingUp, DollarSign, Users, Activity } from 'lucide-react';
import PredictiveHeatMap from './Dashboard/PredictiveHeatMap';
import VelocityChart from './Dashboard/VelocityChart';
import StatCard from '../components/ui/StatCard';
import { 
  formatCurrency, 
  formatPercent,
  calculateAverageCheck, 
  calculateLaborPercentage,
  calculatePercentageChange,
  formatTrend
} from '../utils/analytics';
import { OPERATIONAL_CONFIG } from '../config/constants';

/**
 * DashboardView - The primary visual intelligence layer of the application.
 * Orchestrates the Predictive Engine, Stats Grid, and Velocity Charts.
 * 
 * @param {Object} props
 * @param {Object} props.summary - Aggregated summary object (total_sales, total_labor, etc).
 * @param {Array<Object>} props.chartData - Array of daily sales records for the chart.
 * @param {boolean} props.isDark - Global theme state.
 * @param {boolean} props.loading - Data synchronization state.
 * @param {Array<Object>} props.hourlyHistoricalData - Raw historical cover records.
 */
const DashboardView = ({ 
  summary, 
  chartData, 
  isDark, 
  loading, 
  hourlyHistoricalData
}) => {
  const latest = chartData[chartData.length - 1];
  const prev = chartData[chartData.length - 2];

  const laborPct = calculateLaborPercentage(summary.total_labor, summary.total_sales);

  const statsConfig = [
    {
      label: "Net Sales",
      value: formatCurrency(summary.total_sales),
      color: "text-emerald-500",
      icon: <TrendingUp className="w-4 h-4" />,
      trend: formatTrend(latest?.net_sales, prev?.net_sales)
    },
    {
      label: "Avg. Check",
      value: formatCurrency(calculateAverageCheck(summary.total_sales, summary.total_orders)),
      color: "text-orange-500",
      icon: <DollarSign className="w-4 h-4" />,
      trend: formatTrend(calculateAverageCheck(latest?.net_sales, latest?.order_count), calculateAverageCheck(prev?.net_sales, prev?.order_count))
    },
    {
      label: "Labor Cost",
      value: formatCurrency(summary.total_labor),
      color: "text-indigo-500",
      icon: <Users className="w-4 h-4" />,
      trend: formatTrend(latest?.labor_cost, prev?.labor_cost)
    },
    {
      label: "Labor Efficiency",
      value: formatPercent(laborPct),
      color: laborPct > OPERATIONAL_CONFIG.LABOR_THRESHOLD_PCT ? "text-red-500" : "text-orange-500",
      icon: <Activity className="w-4 h-4" />,
      trend: formatTrend(latest?.labor_pct, prev?.labor_pct),
      subValue: laborPct > OPERATIONAL_CONFIG.LABOR_THRESHOLD_PCT && (
        <p className="text-[10px] text-red-600 dark:text-red-500/80 font-black animate-pulse tracking-tighter uppercase">Critical Exposure</p>
      )
    }
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* Predictive Heat Map */}
      <PredictiveHeatMap history={hourlyHistoricalData} currentConditions={{}} />

      {summary && !summary.error ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {statsConfig.map((stat, idx) => (
              <StatCard 
                key={idx} 
                title={stat.label}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                trend={stat.trend}
                subValue={stat.subValue}
                loading={loading} 
              />
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