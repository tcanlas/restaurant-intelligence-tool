import React from 'react';

/**
 * ErrorBoundary - Catches rendering errors in child components and displays
 * a professional "System Interruption" fallback UI.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Vault Runtime Exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] shadow-2xl border border-red-500/20 text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20 animate-pulse">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <div>
              <h1 className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] mb-2">Security Protocol Alpha</h1>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">System Interruption</h2>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                The Vault's rendering engine encountered a critical exception. Intelligence streams have been paused to protect data integrity.
              </p>
            </div>

            <div className="pt-4">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-black font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 text-[10px] uppercase tracking-[0.2em]"
              >
                Re-Initialize Vault
              </button>
              <p className="mt-4 text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                Error Reference: {this.state.error?.name || "Runtime_Exception"}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;