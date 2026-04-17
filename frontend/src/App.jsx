import { useState, useEffect } from 'react';
import predictionData from './predictionData.json';
import hourlyHistoricalData from './hourlyHistoricalData.json';
import salesTrendData from './salesTrendData.json';
import summaryData from './summaryData.json';
import IngestionForm from './features/Ingestion/IngestionForm';
import DashboardView from "./features/DashboardView";
import Navigation from "./components/Navigation";
import { 
  calculateLaborPercentage, 
  formatCurrency 
} from './utils/analytics';

// --- Predictive Logic Component ---
const PredictiveHeatMap = ({ baselines = {}, eventHour = 19, rawHistory = [] }) => {
  const [weather, setWeather] = useState('Sunny');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [eventLevel, setEventLevel] = useState(0);
  const [activeCell, setActiveCell] = useState(null); // { hour, zone, val, x, y }
  const dayBaseline = baselines[selectedDay] || { res: Array(24).fill(0), walkIn: Array(24).fill(0) };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Prediction Engine
  const predictTraffic = (hour, avgRes, avgWalkIn, type) => {
    let res = avgRes;
    let walkIn = avgWalkIn;

    // Weather Logic: Walk-ins are highly sensitive, Reservations less so
    if (weather === 'Rainy') {
      walkIn = type === 'Patio' ? walkIn * 0.2 : walkIn * 0.7; // Patio walk-ins hit hard
      res *= 0.95; // 5% no-show factor for reservations
    }

    // Event Logic: Events primarily drive new walk-in traffic
    if (hour === eventHour - 1 || hour === eventHour - 2) {
      walkIn += (eventLevel * 5);
    }

    const totalCovers = res + walkIn;
    return Math.min(100, (totalCovers / predictionData.totalSeats) * 100);
  };

  // Logic to calculate peak heat for staffing advice
  const getPeakHeat = () => {
    const diningHeats = hours.map(h => predictTraffic(h, dayBaseline.res[h], dayBaseline.walkIn[h], 'Dining Room'));
    const patioHeats = hours.map(h => predictTraffic(h, dayBaseline.res[h], dayBaseline.walkIn[h], 'Patio'));
    return Math.max(...diningHeats, ...patioHeats);
  };
  const peak = getPeakHeat();
  
  // Get specific historical entries for the tooltip
  const getHistoricalInsights = (hour) => {
    return rawHistory
      .filter(d => d.day === selectedDay && d.hour === hour)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3); // Show last 3 weeks
  };

  const getColor = (val) => {
    if (val < 10) return 'bg-slate-100 dark:bg-black';
    if (val < 30) return 'bg-orange-100 dark:bg-orange-900/40';
    if (val < 50) return 'bg-orange-300 dark:bg-orange-600/60';
    if (val < 80) return 'bg-orange-500 dark:bg-orange-500/90';
    return 'bg-red-500 dark:bg-red-600';
  };

  return (
    <div className="bg-white dark:bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 space-y-8 relative overflow-hidden transition-all duration-500">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Predictive Engine</h3>
          <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Demand Forecast</p>
        </div>
        <select 
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-[10px] font-bold rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all cursor-pointer"
        >
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
          <option value="Saturday">Saturday</option>
          <option value="Sunday">Sunday</option>
        </select>
        <div className="flex bg-slate-200/50 dark:bg-black/40 p-1 rounded-xl border border-slate-300 dark:border-white/5">
          {['Sunny', 'Rainy'].map((w) => (
            <button
              key={w}
              onClick={() => setWeather(w)}
              className={`px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-300 ${weather === w ? 'bg-white dark:bg-white/10 text-orange-600 dark:text-orange-400 shadow-lg ring-1 ring-black/5 dark:ring-white/10' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 relative">
        {['Dining Room', 'Patio'].map((zone) => (
          <div key={zone}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">{zone}</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-600">24H Dynamics</span>
            </div>
            <div className="grid grid-cols-24 gap-1 h-8" onMouseLeave={() => setActiveCell(null)}>
              {hours.map((h) => {
                const val = predictTraffic(h, dayBaseline.res[h], dayBaseline.walkIn[h], zone);
                const displayHour = h === 0 ? '12am' : h === 12 ? '12pm' : h > 12 ? `${h - 12}pm` : `${h}am`;
                const isHovered = activeCell?.hour === h && activeCell?.zone === zone;

                return (
                  <div
                    key={h}
                    onMouseEnter={(e) => setActiveCell({ hour: h, zone, val, displayHour })}
                    onClick={() => setActiveCell({ hour: h, zone, val, displayHour })}
                    className={`h-full rounded-[3px] border border-black/5 dark:border-white/5 transition-all duration-700 cursor-crosshair ${getColor(val)} ${isHovered ? 'ring-2 ring-orange-500 dark:ring-white/50 scale-110 z-10 shadow-xl' : ''}`}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Custom Rich Tooltip */}
        {activeCell && (
          <div className="absolute z-50 -top-16 left-0 right-0 mx-auto w-52 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl text-slate-900 dark:text-white p-4 rounded-3xl border border-slate-200 dark:border-white/20 shadow-2xl pointer-events-none animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{activeCell.displayHour} • {activeCell.zone}</p>
                <p className="text-xl font-black text-orange-600 dark:text-orange-400">{activeCell.val.toFixed(0)}% <span className="text-[10px] text-slate-400 font-normal">capacity</span></p>
              </div>
            </div>
            
            <div className="space-y-1.5 border-t border-gray-800 pt-2">
              <p className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Past 3 {selectedDay}s (Covers)</p>
              <div className="flex justify-between items-center">
                {getHistoricalInsights(activeCell.hour).map((entry, i) => (
                  <div key={i} className="text-center border-x border-gray-800 px-2 first:border-l-0 last:border-r-0">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-orange-400">{entry.res_covers || 0}R</span>
                      <span className="text-[9px] font-bold text-blue-400">{entry.walk_in_covers || 0}W</span>
                    </div>
                    <p className="text-[7px] text-gray-500">{new Date(entry.date).toLocaleDateString('en-US', {month: 'numeric', day: 'numeric'})}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between px-1">
          <span className="text-[8px] text-slate-400 dark:text-slate-600 font-bold">12AM</span>
          <span className="text-[8px] text-slate-400 dark:text-slate-600 font-bold">06AM</span>
          <span className="text-[8px] text-slate-400 dark:text-slate-600 font-bold">12PM</span>
          <span className="text-[8px] text-slate-400 dark:text-slate-600 font-bold">06PM</span>
          <span className="text-[8px] text-slate-400 dark:text-slate-600 font-bold">11PM</span>
        </div>

        {/* Color Key Legend */}
        <div className="flex items-center justify-between pt-4 px-1 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-sm bg-slate-100 dark:bg-black"></div><span className="text-[8px] text-slate-400 dark:text-slate-500">0-10%</span></div>
          <div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-sm bg-orange-100 dark:bg-orange-900/40"></div><span className="text-[8px] text-slate-400 dark:text-slate-500">10-30%</span></div>
          <div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-sm bg-orange-300 dark:bg-orange-600/60"></div><span className="text-[8px] text-slate-400 dark:text-slate-500">30-50%</span></div>
          <div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-sm bg-orange-500 dark:bg-orange-500/90"></div><span className="text-[8px] text-slate-400 dark:text-slate-500">50-80%</span></div>
          <div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-sm bg-red-500"></div><span className="text-[8px] text-slate-400 dark:text-slate-500">80%+</span></div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
          Event Intensity: <span className="text-orange-400 ml-1">{eventLevel === 0 ? 'Baseline' : `Level ${eventLevel}`}</span>
        </label>
        <input 
          type="range" min="0" max="5" value={eventLevel} 
          onChange={(e) => setEventLevel(parseInt(e.target.value))}
          className="w-24 accent-orange-600"
        />
      </div>

      <div className={`mt-6 p-4 rounded-2xl text-[11px] font-medium border backdrop-blur-md transition-colors duration-500 ${peak > 80 ? 'bg-red-500/5 dark:bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-200' : 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-200'}`}>
        <span className="uppercase tracking-[0.2em] font-black block mb-2 opacity-50">Maestro's Directive</span>
        {peak > 80 
          ? "Critical volume anticipated. Deploy senior floor lead; initiate kitchen prep sequence by 17:00." 
          : "Flow stabilized. Optimal window for deep-sanitization protocols or specialized staff workshops."}
      </div>
    </div>
  );
};

function App() {
  const [status, setStatus] = useState('Connecting...');
  const [summary, setSummary] = useState(summaryData);
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState('intelligence'); // intelligence | ingestion

  const handleCommit = async (data) => {
    try {
      const response = await fetch('/api/vault', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: data.date,
          totalCovers: data.totalCovers,
          reservations: data.reservations,
          eventIntensity: data.eventIntensity,
          netSales: data.netSales,
          laborCost: data.laborCost
        }),
      });

      if (response.ok) {
        alert(`Operational data for ${data.date} committed successfully.`);
        fetchData();
        return true;
      } else {
        const err = await response.json();
        alert(`Vault Error: ${err.error || 'Failed to save entry.'}`);
        return false;
      }
    } catch (err) {
      console.error('Commit Failure:', err);
      alert('Network Error: Vault is unreachable.');
      return false;
    }
  };

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);
  
  // Initialize with local JSON data and calculate labor percentage immediately
  const [chartData, setChartData] = useState(salesTrendData.map(d => ({
    ...d,
    labor_pct: calculateLaborPercentage(d.labor_cost, d.net_sales)
  })));

  const [loading, setLoading] = useState(false);
  const [visibleSeries, setVisibleSeries] = useState({
    Sales: true,
    Labor: true,
    'Labor %': true
  });

  // --- Data Translation Logic ---
  // This function transforms raw cover counts into the 0-100 "Heat" scale
  const calculateBaselinesFromRaw = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const result = {};

    days.forEach(dayName => {
      const resAverages = Array(24).fill(0);
      const walkInAverages = Array(24).fill(0);
      
      for (let h = 0; h < 24; h++) {
        const entries = hourlyHistoricalData.filter(d => d.day === dayName && d.hour === h);
        if (entries.length > 0) {
          resAverages[h] = entries.reduce((acc, curr) => acc + (curr.res_covers || 0), 0) / entries.length;
          walkInAverages[h] = entries.reduce((acc, curr) => acc + (curr.walk_in_covers || 0), 0) / entries.length;
        }
      }
      result[dayName] = { res: resAverages, walkIn: walkInAverages };
    });

    return result;
  };

  // We combine the calculated baselines with any overrides from our static config
  const mockBaselines = {
    ...predictionData.baselines,
    ...calculateBaselinesFromRaw()
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Check backend health
      const healthRes = await fetch('/api/health');
      const healthData = await healthRes.json();
      setStatus(healthData.message);

      // Fetch summary
      const summaryRes = await fetch('/api/sales-summary');
      if (!summaryRes.ok) throw new Error('Data file missing');
      const summaryData = await summaryRes.json();
      setSummary(summaryData);

      // Fetch raw sales for the chart
      const salesRes = await fetch('/api/sales');
      const salesData = await salesRes.json();
      if (salesData && salesData.length > 0) {
        const processedData = salesData.map(d => ({
          ...d,
          labor_pct: calculateLaborPercentage(d.labor_cost, d.net_sales)
        }));
        setChartData(processedData);
      }
      
      setStatus('Connected & Synced');
    } catch (err) {
      console.error('Error fetching data:', err);
      setStatus('Sync Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLegendClick = (e) => {
    const { value } = e;
    setVisibleSeries(prev => ({ ...prev, [value]: !prev[value] }));
  };

  const renderLegendText = (value) => {
    return <span className={visibleSeries[value] ? 'text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider' : 'text-slate-300 dark:text-slate-600 text-[10px] uppercase tracking-wider'}>{value}</span>;
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
            visibleSeries={visibleSeries}
            handleLegendClick={handleLegendClick}
            renderLegendText={renderLegendText}
            PredictiveHeatMap={PredictiveHeatMap}
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