import React, { useState, useEffect } from "react";
import { useSYNK, GoalType, Goal } from "../Store";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, Check, X, Target, Layout, Table, Columns, 
  Calendar, Clock, ExternalLink, Download, 
  ChevronRight, StickyNote, BarChart3, Timer,
  MoreVertical, Trash2
} from "lucide-react";
import { cn } from "../utils";

export default function GoalVault() {
  const { goals, addGoal, completeGoal, deleteGoal, bias } = useSYNK();
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<GoalType>("pulse");
  const [view, setView] = useState<"standard" | "table" | "board">("standard");
  const [activeTab, setActiveTab] = useState<"track" | "journal">("track");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addGoal(newTitle, newType);
    setNewTitle("");
  };

  const syncToNotion = () => {
    console.log("Exporting directives bundle to Notion encrypted vault...");
  };

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-14 pb-32 overflow-y-auto custom-scrollbar overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-10">
        
        {/* Notion-style Header */}
        <header className="flex flex-col gap-6">
          <div className="flex items-center gap-3 text-white/40">
            <Layout className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-mono">Workspace / Personal / Directives</span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl md:text-6xl font-serif italic text-white tracking-tight">Directives Dashboard</h1>
              <p className="text-sm text-white/30 font-serif italic">The central intelligence hub for your neural growth and atmospheric calibration.</p>
            </div>
            
            <div className="flex items-center gap-4">
               <button 
                 onClick={syncToNotion}
                 className="flex items-center gap-2 px-4 py-2 border border-white/10 hover:bg-white/5 text-[10px] text-white/60 uppercase tracking-widest transition-all"
               >
                 <ExternalLink className="w-3 h-3" />
                 SYNC TO NOTION
               </button>
               <button className="flex items-center justify-center w-10 h-10 border border-white/10 hover:bg-white/5 text-white/40">
                 <MoreVertical className="w-4 h-4" />
               </button>
            </div>
          </div>

          <div className="flex gap-8 border-b border-white/5 pb-2 mt-4">
             <button 
               onClick={() => setActiveTab('track')}
               className={cn(
                 "text-[10px] uppercase tracking-[0.3em] pb-2 px-1 transition-all",
                 activeTab === 'track' ? "text-white border-b border-white" : "text-white/20 hover:text-white/50"
               )}
             >
               DIRECTIVES TRACKER
             </button>
             <button 
               onClick={() => setActiveTab('journal')}
               className={cn(
                 "text-[10px] uppercase tracking-[0.3em] pb-2 px-1 transition-all",
                 activeTab === 'journal' ? "text-white border-b border-white" : "text-white/20 hover:text-white/50"
               )}
             >
               NEURAL JOURNAL
             </button>
          </div>
        </header>

        {activeTab === 'track' ? (
          <div className="flex flex-col gap-12">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div className="bg-white/[0.02] border border-white/5 p-6 flex flex-col gap-2">
                  <BarChart3 className="w-4 h-4 text-synk-lavender opacity-50" />
                  <span className="text-[9px] uppercase tracking-widest text-white/30">Total Protocols</span>
                  <span className="text-2xl font-serif italic text-white">{goals.length}</span>
               </div>
               <div className="bg-white/[0.02] border border-white/5 p-6 flex flex-col gap-2">
                  <Check className="w-4 h-4 text-green-400 opacity-50" />
                  <span className="text-[9px] uppercase tracking-widest text-white/30">Completed</span>
                  <span className="text-2xl font-serif italic text-white">{goals.filter(g => g.completed).length}</span>
               </div>
               <div className="bg-white/[0.02] border border-white/5 p-6 flex flex-col gap-2">
                  <Timer className="w-4 h-4 text-synk-pink opacity-50" />
                  <span className="text-[9px] uppercase tracking-widest text-white/30">Pending Focus</span>
                  <span className="text-2xl font-serif italic text-white">{goals.filter(g => !g.completed).length}</span>
               </div>
               <div className="bg-white/[0.02] border border-white/5 p-6 flex flex-col gap-2 relative group overflow-hidden">
                  <Clock className="w-4 h-4 text-synk-blue opacity-50" />
                  <span className="text-[9px] uppercase tracking-widest text-white/30">System Time</span>
                  <span className="text-2xl font-serif italic text-white">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <div className="absolute inset-0 bg-synk-blue/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
               </div>
            </div>

            {/* View Switcher & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white/[0.02] border border-white/5 p-4 rounded-lg">
               <div className="flex items-center gap-2">
                  {(["standard", "table", "board"] as const).map((v) => (
                    <button 
                      key={v}
                      onClick={() => setView(v)}
                      className={cn(
                        "px-4 py-2 text-[10px] uppercase tracking-widest rounded transition-all flex items-center gap-2",
                        view === v ? "bg-white text-black font-bold" : "text-white/40 hover:bg-white/5"
                      )}
                    >
                      {v === 'standard' && <StickyNote className="w-3 h-3" />}
                      {v === 'table' && <Table className="w-3 h-3" />}
                      {v === 'board' && <Columns className="w-3 h-3" />}
                      {v}
                    </button>
                  ))}
               </div>

               <form onSubmit={handleAdd} className="flex-1 flex gap-2 w-full md:max-w-md">
                 <input 
                   type="text" 
                   value={newTitle}
                   onChange={(e) => setNewTitle(e.target.value)}
                   placeholder="Add a new directive..."
                   className="flex-1 bg-black/40 border border-white/10 px-4 py-2 text-xs text-white focus:border-white/30 outline-none"
                 />
                 <button type="submit" className="bg-white text-black p-2 hover:bg-synk-lavender transition-all">
                   <Plus className="w-4 h-4" />
                 </button>
               </form>
            </div>

            {/* Conditional Views */}
            <AnimatePresence mode="wait">
              {view === "standard" && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {goals.map(goal => (
                    <DirectiveCard key={goal.id} goal={goal} onComplete={() => completeGoal(goal.id)} onDelete={() => deleteGoal(goal.id)} />
                  ))}
                  {goals.length === 0 && <EmptyVault />}
                </motion.div>
              )}

              {view === "table" && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-black/20 border border-white/10 rounded-lg overflow-hidden"
                >
                  <div className="grid grid-cols-[40px_1fr_120px_120px_100px_40px] gap-4 p-4 border-b border-white/10 text-[9px] uppercase tracking-widest text-white/30 font-mono">
                    <div></div>
                    <div>Name</div>
                    <div>Phase</div>
                    <div>Date Added</div>
                    <div>Status</div>
                    <div></div>
                  </div>
                  {goals.map(goal => (
                    <div key={goal.id} className="grid grid-cols-[40px_1fr_120px_120px_100px_40px] gap-4 p-4 border-b border-white/5 items-center hover:bg-white/5 transition-colors group">
                       <button onClick={() => completeGoal(goal.id)} className={cn("w-4 h-4 border transition-all", goal.completed ? "bg-white border-white" : "border-white/20")}>
                         {goal.completed && <Check className="w-3 h-3 text-black" />}
                       </button>
                       <div className={cn("text-sm text-white/80 group-hover:text-white truncate", goal.completed && "line-through text-white/30")}>{goal.title}</div>
                       <div className="text-[10px] text-white/40 font-mono uppercase tracking-tighter">{goal.type}</div>
                       <div className="text-[10px] text-white/40 font-mono italic">04.17.2026</div>
                       <div>
                          <span className={cn(
                            "text-[8px] px-2 py-0.5 rounded tracking-tighter font-bold uppercase",
                            goal.completed ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-500"
                          )}>
                             {goal.completed ? "SYNCHRONIZED" : "PENDING"}
                          </span>
                       </div>
                       <button onClick={() => deleteGoal(goal.id)} className="text-white/10 hover:text-synk-pink transition-colors">
                         <Trash2 className="w-3 h-3" />
                       </button>
                    </div>
                  ))}
                </motion.div>
              )}

              {view === "board" && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                  {(["pulse", "orbit", "galaxy"] as GoalType[]).map(type => (
                    <div key={type} className="flex flex-col gap-6">
                       <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60 flex items-center gap-3">
                            <span className={cn("w-1.5 h-1.5 rounded-full", type === 'pulse' ? 'bg-synk-pink' : type === 'orbit' ? 'bg-synk-blue' : 'bg-synk-lavender')} />
                            {type} MODE
                          </h4>
                          <span className="text-[9px] font-mono text-white/20">{goals.filter(g => g.type === type).length}</span>
                       </div>
                       <div className="flex flex-col gap-4">
                          {goals.filter(g => g.type === type).map(goal => (
                            <div key={goal.id} className="bg-white/[0.03] border border-white/10 p-4 hover:border-white/30 transition-all rounded-sm group relative">
                               <div className={cn("text-xs text-white/80 transition-all mb-4", goal.completed && "line-through text-white/30")}>
                                  {goal.title}
                               </div>
                               <div className="flex justify-between items-center">
                                  <button onClick={() => completeGoal(goal.id)} className="text-[9px] uppercase tracking-widest text-white/40 hover:text-white">
                                    {goal.completed ? "REVERT" : "EXECUTE"}
                                  </button>
                                  <button onClick={() => deleteGoal(goal.id)} className="text-white/5 group-hover:text-synk-pink transition-colors">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                               </div>
                            </div>
                          ))}
                          <button className="py-4 border border-dashed border-white/5 text-[9px] uppercase tracking-widest text-white/10 hover:text-white/30 transition-all">
                             + ADD NEW
                          </button>
                       </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center gap-10">
             <div className="flex flex-col items-center gap-4 text-center">
                <StickyNote className="w-12 h-12 text-white/10 mb-4" />
                <h2 className="text-3xl font-serif italic text-white/80">Neural Journaling</h2>
                <p className="max-w-md text-sm text-white/40 leading-relaxed font-serif italic">The journal is currently undergoing architectural restructuring to better support multidimensional thought archiving. Check back after the next system sync.</p>
             </div>
             <button className="bg-white text-black px-10 py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-synk-lavender transition-all">
                REQUEST DEV ACCESS
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DirectiveCard({ goal, onComplete, onDelete }: { goal: Goal, onComplete: () => void, onDelete: () => void }) {
  return (
    <div className={cn(
      "group relative flex flex-col gap-6 p-8 bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all duration-500 rounded-sm overflow-hidden",
      goal.completed && "opacity-40"
    )}>
       <div className="flex justify-between items-start">
          <div className={cn(
             "px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-sm",
             goal.type === 'pulse' ? "bg-synk-pink/10 text-synk-pink" : 
             goal.type === 'orbit' ? "bg-synk-blue/10 text-synk-blue" : 
             "bg-synk-lavender/10 text-synk-lavender"
          )}>
            PHASE {goal.type.toUpperCase()}
          </div>
          <button onClick={onDelete} className="text-white/5 group-hover:text-synk-pink transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
       </div>
       
       <h3 className={cn("text-xl font-serif italic text-white/90 leading-tight", goal.completed && "line-through")}>
          {goal.title}
       </h3>
       
       <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center text-[9px] font-mono tracking-tighter text-white/30">
          <span>CREATED: 04.17.26</span>
          <button 
            onClick={onComplete}
            className={cn(
              "flex items-center gap-2 px-3 py-1 border transition-all",
              goal.completed ? "bg-white text-black border-white" : "border-white/10 hover:border-white text-white/60"
            )}
          >
            {goal.completed ? "COMPLETED" : "MARK DONE"}
            <ChevronRight className="w-3 h-3" />
          </button>
       </div>
       
       {/* Background accent */}
       <div className={cn(
         "absolute -bottom-8 -right-8 w-24 h-24 blur-3xl rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-700",
         goal.type === 'pulse' ? 'bg-synk-pink' : goal.type === 'orbit' ? 'bg-synk-blue' : 'bg-synk-lavender'
       )} />
    </div>
  );
}

function EmptyVault() {
  return (
    <div className="col-span-full py-20 flex flex-col items-center gap-4 border border-dashed border-white/5 text-center">
       <Target className="w-10 h-10 text-white/5 mb-2" />
       <p className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-serif italic">The vault is silent... initialize your first protocol.</p>
    </div>
  );
}
