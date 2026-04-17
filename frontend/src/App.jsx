import { useState, useEffect } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import predictionData from './predictionData.json';
import hourlyHistoricalData from './hourlyHistoricalData.json';
import SalesOverview from './components/SalesOverview';
import salesTrendData from './salesTrendData.json';
import summaryData from './summaryData.json';
import IngestionForm from './features/Ingestion/IngestionForm';
import { calculateWalkins } from './utils/analytics';

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
  const [activeView, setActiveView] = useState('intelligence'); // intelligence | ingestion
  
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
      alert('Network Error: Could not connect to the backend.');
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
    labor_pct: d.net_sales > 0 ? (d.labor_cost / d.net_sales) * 100 : 0
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
          labor_pct: d.net_sales > 0 ? (d.labor_cost / d.net_sales) * 100 : 0
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

  const formatCurrency = (val) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const laborPercentage = summary && summary.total_sales > 0 
    ? (summary.total_labor / summary.total_sales) * 100 
    : 0;

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
        <header className="py-6 px-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">THE VAULT</h1>
            <p className="text-orange-500/80 text-[10px] font-bold uppercase tracking-[0.3em]">Operational Intelligence</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-3 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 active:scale-95 transition-all group backdrop-blur-md flex items-center justify-center"
            >
              <div className="flex items-center space-x-1.5 text-slate-400">
                <svg className={`w-4 h-4 ${!isDark ? 'text-orange-500' : 'opacity-40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
                <span className="text-[10px] font-bold opacity-20">/</span>
                <svg className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'opacity-40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              </div>
            </button>
            <button 
              onClick={fetchData}
              disabled={loading}
              className="p-3 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 active:scale-95 transition-all group backdrop-blur-md"
            >
              <svg className={`w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </header>

        {/* View Switcher Navigation */}
        <div className="flex bg-white/50 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 mb-6 backdrop-blur-md">
          <button 
            onClick={() => setActiveView('intelligence')}
            className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all duration-300 ${activeView === 'intelligence' ? 'bg-white dark:bg-white/10 text-orange-600 dark:text-orange-400 shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            INTELLIGENCE
          </button>
          <button 
            onClick={() => setActiveView('ingestion')}
            className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all duration-300 ${activeView === 'ingestion' ? 'bg-white dark:bg-white/10 text-orange-600 dark:text-orange-400 shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            INGESTION
          </button>
        </div>

        {activeView === 'intelligence' ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Predictive Heat Map */}
            <PredictiveHeatMap baselines={mockBaselines} rawHistory={hourlyHistoricalData} />

            {loading ? (
              <div className="flex justify-center items-center h-32 text-gray-400 animate-pulse">
                Loading metrics...
              </div>
            ) : summary && !summary.error ? (
              <div className="space-y-4">
                <SalesOverview summary={summary} />

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
                            formatter={(value, name) => name === 'Labor %' ? `${parseFloat(value).toFixed(1)}%` : formatCurrency(value)}
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
              <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 p-4 rounded-2xl text-sm border border-red-100 dark:border-red-500/20">
                <strong>Data Error:</strong> Make sure <code>backend/data/sales.csv</code> contains data.
              </div>
            )}
          </div>
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