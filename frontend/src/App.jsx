import { useState, useEffect } from 'react';
import predictionData from './predictionData.json';
import hourlyHistoricalData from './hourlyHistoricalData.json';
import IngestionForm from './features/Ingestion/IngestionForm';
import DashboardView from "./features/DashboardView";
import Navigation from "./components/Navigation";
import useVaultData from './hooks/useVaultData';
import { calculateBaselinesFromRaw } from './utils/analytics';


function App() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState('intelligence'); // intelligence | ingestion

  const { 
    summary, 
    chartData, 
    loading, 
    status, 
    fetchData, 
    handleCommit 
  } = useVaultData();

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);
   
  // We combine the calculated baselines with any overrides from our static config
  const mockBaselines = {
    ...predictionData.baselines,
    ...calculateBaselinesFromRaw(hourlyHistoricalData)
  };


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-slate-200 p-6 pb-24 font-sans selection:bg-orange-500/30 transition-all duration-700">
      <div className="max-w-md mx-auto space-y-4">
        <Navigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isDark={isDark} 
          setIsDark={setIsDark} 
          onRefresh={fetchData}
          loading={loading}
        />


        {activeTab === 'intelligence' ? (
          <DashboardView 
            summary={summary}
            chartData={chartData}
            isDark={isDark}
            loading={loading}
            mockBaselines={mockBaselines}
            hourlyHistoricalData={hourlyHistoricalData}
          />
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <IngestionForm onCommit={handleCommit} />
          </div>
        )}

        {/* Bottom Status Bar */}
        <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-white/5">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${status.toLowerCase().includes('running') ? 'bg-green-500' : 'bg-amber-500'}`}></div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">
              System Status: {status}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
export default App;