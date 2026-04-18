/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SYNKProvider, useSYNK } from "./lib/Store";
import WelcomeScreen from "./lib/WelcomeScreen";
import AppLayout from "./lib/AppLayout";
import ThreeBackground from "./lib/ThreeBackground";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("SYNK_CRITICAL_ERROR:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black text-white p-8 font-mono flex flex-col justify-center overflow-auto z-[9999]">
          <h1 className="text-red-500 text-2xl mb-4 uppercase tracking-[0.2em]">System Resonance Failure</h1>
          <p className="text-white/60 mb-8 border-l border-white/20 pl-4">{this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-fit px-8 py-3 bg-white text-black text-xs font-bold tracking-widest hover:invert transition-all self-center"
          >
            FORCE SYNC RECOVERY
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function Root() {
  const { user, loading, hasProfile, completionRate } = useSYNK();
  const [showIntro, setShowIntro] = useState(true);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <motion.div 
          animate={{ opacity: [0.4, 1, 0.4] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white text-[10px] tracking-[0.5em] uppercase"
        >
          Connecting to SYNK...
        </motion.div>
      </div>
    );
  }

  // If user is not logged in OR is still within the intro sequence
  if (!user || (!hasProfile && showIntro)) {
    return (
      <div className="relative w-full h-screen bg-black">
        <ThreeBackground completionRate={completionRate} />
        <WelcomeScreen onComplete={() => setShowIntro(false)} />
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black">
      <ThreeBackground completionRate={completionRate} showCore={false} />
      <AppLayout />
    </div>
  );
}

export default function App() {
  console.log("SYNK_PORTAL: Initializing...");
  return (
    <ErrorBoundary>
      <SYNKProvider>
        <Root />
      </SYNKProvider>
    </ErrorBoundary>
  );
}

