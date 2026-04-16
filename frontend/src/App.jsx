import { useState, useEffect } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import predictionData from './predictionData.json';
import hourlyHistoricalData from './hourlyHistoricalData.json';
import SalesOverview from './components/SalesOverview';
import salesTrendData from './salesTrendData.json';
import summaryData from './summaryData.json';

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
    if (val < 10) return 'bg-slate-200';
    if (val < 30) return 'bg-orange-200';
    if (val < 50) return 'bg-orange-400';
    if (val < 80) return 'bg-orange-600';
    return 'bg-red-600';                      // Warning peak
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6 relative">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Predictive Heat Map</h3>
          <p className="text-sm font-bold text-gray-700">Daily Demand Forecast</p>
        </div>
        <select 
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="bg-white border border-gray-200 text-[10px] font-bold rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
          <option value="Saturday">Saturday</option>
          <option value="Sunday">Sunday</option>
        </select>
        <div className="flex bg-gray-100 p-1 rounded-xl space-x-1">
          {['Sunny', 'Rainy'].map((w) => (
            <button
              key={w}
              onClick={() => setWeather(w)}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${weather === w ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}`}
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
              <span className="text-[9px] font-black uppercase text-gray-400">{zone}</span>
              <span className="text-[9px] text-gray-300">24H Timeline</span>
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
                    className={`h-full rounded-sm border border-white/40 transition-all duration-300 cursor-crosshair ${getColor(val)} ${isHovered ? 'ring-2 ring-black ring-inset scale-110 z-10' : ''}`}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Custom Rich Tooltip */}
        {activeCell && (
          <div className="absolute z-50 -top-12 left-0 right-0 mx-auto w-48 bg-gray-900 text-white p-3 rounded-2xl shadow-xl pointer-events-none animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{activeCell.displayHour} • {activeCell.zone}</p>
                <p className="text-xl font-black text-orange-400">{activeCell.val.toFixed(0)}% <span className="text-[10px] text-gray-400 font-normal">capacity</span></p>
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
          <span className="text-[8px] text-gray-300">12am</span>
          <span className="text-[8px] text-gray-300">6am</span>
          <span className="text-[8px] text-gray-300">12pm</span>
          <span className="text-[8px] text-gray-300">6pm</span>
          <span className="text-[8px] text-gray-300">11pm</span>
        </div>

        {/* Color Key Legend */}
        <div className="flex items-center justify-between pt-2 px-1 border-t border-gray-50">
          <div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-sm bg-slate-200"></div><span className="text-[8px] text-gray-400">0-10%</span></div>
          <div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-sm bg-orange-200"></div><span className="text-[8px] text-gray-400">10-30%</span></div>
          <div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-sm bg-orange-400"></div><span className="text-[8px] text-gray-400">30-50%</span></div>
          <div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-sm bg-orange-600"></div><span className="text-[8px] text-gray-400">50-80%</span></div>
          <div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-sm bg-red-600"></div><span className="text-[8px] text-gray-400">80%+</span></div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
        <label className="text-[10px] font-bold text-gray-400 uppercase">
          Local Event Impact: {eventLevel === 0 ? 'None' : `Lvl ${eventLevel}`}
        </label>
        <input 
          type="range" min="0" max="5" value={eventLevel} 
          onChange={(e) => setEventLevel(parseInt(e.target.value))}
          className="w-24 accent-orange-600"
        />
      </div>

      <div className={`mt-4 p-3 rounded-xl text-[11px] font-bold border ${peak > 80 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
        <span className="uppercase tracking-widest block mb-1">Manager's Action:</span>
        {peak > 80 
          ? "⚠️ High volume predicted. Schedule a floor lead and ensure the kitchen is prepped by 5pm." 
          : "✅ Standard volume. Great time for deep cleaning or staff training during gray blocks."}
      </div>
    </div>
  );
};

function App() {
  const [status, setStatus] = useState('Connecting...');
  const [summary, setSummary] = useState(summaryData);
  
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
    return <span className={visibleSeries[value] ? 'text-gray-700 font-medium' : 'text-gray-300'}>{value}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-4">
        <header className="py-6 px-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight">My Restaurant Dashboard</h1>
            <p className="text-gray-500 text-sm font-medium">CSV Data Source</p>
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="p-2 bg-white hover:bg-gray-50 rounded-full shadow-sm border border-gray-200 active:scale-95 transition-all group"
          >
            <svg className={`w-5 h-5 text-gray-500 group-hover:text-orange-600 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </header>

        {/* Predictive Heat Map (Moved outside summary check for visibility) */}
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
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Net Sales Trend</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
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
                    <Area 
                      yAxisId="left" 
                      type="monotone" 
                      name="Sales" 
                      dataKey="net_sales" 
                      stroke="#ea580c" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                      hide={!visibleSeries.Sales}
                    />
                    <Area 
                      yAxisId="left" 
                      type="monotone" 
                      name="Labor" 
                      dataKey="labor_cost" 
                      stroke="#6366f1" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorLabor)" 
                      hide={!visibleSeries.Labor}
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      name="Labor %" 
                      dataKey="labor_pct" 
                      stroke="#10b981" 
                      strokeWidth={2} 
                      dot={false} 
                      hide={!visibleSeries['Labor %']}
                    />
                    <Tooltip 
                      formatter={(value, name) => name === 'Labor %' ? `${parseFloat(value).toFixed(1)}%` : formatCurrency(value)}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm border border-red-100">
            <strong>Data Error:</strong> Make sure <code>backend/data/sales.csv</code> contains data.
          </div>
        )}

        {/* Bottom Status Bar */}
        <footer className="mt-12 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${status.toLowerCase().includes('running') ? 'bg-green-500' : 'bg-amber-500'}`}></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              System Status: {status}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
export default App;