import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("SYNKIFY CRITICAL_ERROR:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white p-8 z-[9999]">
          <div className="text-synk-pink border border-synk-pink/30 p-6 bg-synk-pink/5 backdrop-blur-xl">
             <h1 className="vogue-title-section mb-4">RESONANCE_FAILURE</h1>
             <p className="font-mono text-[10px] tracking-widest opacity-70 mb-6">
                THE SYSTEM HAS ENCOUNTERED A CRITICAL DE-SYNC. PLEASE RE-INITIALIZE.
             </p>
             <button 
                onClick={() => window.location.reload()}
                className="w-full py-3 border border-synk-pink text-synk-pink text-[10px] tracking-[0.4em] uppercase hover:bg-synk-pink hover:text-black transition-all"
             >
                RE-INITIALIZE CHANNEL
             </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

console.log("SYNK_MAIN: Mounting app...");
const rootElement = document.getElementById('root');
const fallbackElement = document.getElementById('loading-fallback');
if (fallbackElement) {
  fallbackElement.style.display = 'none';
}

createRoot(rootElement!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
