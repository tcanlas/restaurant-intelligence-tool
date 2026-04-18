import React from 'react';

const Navigation = ({ activeTab, setActiveTab, isDark, setIsDark, onRefresh, loading }) => {
  return (
    <nav className="space-y-4">
      {/* Top Header Bar */}
      <header className="py-6 px-4 flex justify-between items-center bg-white/50 dark:bg-transparent rounded-[2rem] border border-slate-100 dark:border-none">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">THE VAULT</h1>
          <div className="flex items-center space-x-2">
            <p className="text-orange-500/80 text-[10px] font-bold uppercase tracking-[0.3em]">Operational Intelligence</p>
            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <button className="text-[10px] font-bold text-slate-400 hover:text-orange-500 transition-colors uppercase tracking-widest">Support</button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-3 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 active:scale-95 transition-all group backdrop-blur-md flex items-center justify-center"
          >
            <div className="flex items-center space-x-1.5 text-slate-400">
              <svg className="w-4 h-4 text-orange-500 dark:text-slate-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
              <span className="text-[10px] font-bold opacity-20">/</span>
              <svg className="w-4 h-4 text-slate-400/40 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            </div>
          </button>
          
          <button 
            onClick={onRefresh}
            disabled={loading}
            className="p-3 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 active:scale-95 transition-all group backdrop-blur-md"
          >
            <svg className={`w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 mx-1" />

          <button className="p-3 bg-red-500/5 hover:bg-red-500/10 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-2xl border border-red-500/20 transition-all active:scale-95 group">
            <svg className="w-5 h-5 text-red-500 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Segmented View Control */}
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setActiveTab('intelligence')}
          className={`flex-1 py-3 text-[10px] font-black rounded-2xl transition-all duration-500 tracking-[0.1em] ${
            activeTab === 'intelligence' 
              ? 'bg-white dark:bg-white/10 text-orange-600 dark:text-orange-400 shadow-2xl ring-1 ring-black/5 dark:ring-white/5' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          INTELLIGENCE
        </button>
        <button 
          onClick={() => setActiveTab('ingestion')}
          className={`flex-1 py-3 text-[10px] font-black rounded-2xl transition-all duration-500 tracking-[0.1em] ${
            activeTab === 'ingestion' 
              ? 'bg-white dark:bg-white/10 text-orange-600 dark:text-orange-400 shadow-2xl ring-1 ring-black/5 dark:ring-white/5' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          INGESTION
        </button>
      </div>
    </nav>
  );
};

export default Navigation;