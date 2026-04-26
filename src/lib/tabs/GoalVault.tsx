import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, Check, X, Target, Calendar, Clock, 
  ChevronRight, Timer, Play, Square, AlertCircle, Archive
} from "lucide-react";
import { cn } from "../utils";

interface Directive {
  id: string;
  title: string;
  deadline: string | null;
  priority: "High" | "Medium" | "Low";
  status: "Active" | "Archived" | "Done";
  totalTime: number; 
}

export default function GoalVault() {
  const [directives, setDirectives] = useState<Directive[]>([]);
  const [filter, setFilter] = useState<"TODAY" | "UPCOMING" | "COMPLETED">("TODAY");

  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"High" | "Medium" | "Low">("Medium");

  // Timer State
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes pomodoro default
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  useEffect(() => {
    const localData = localStorage.getItem("synk_directives");
    if (localData) {
      try {
        setDirectives(JSON.parse(localData));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveDirectives = (data: Directive[]) => {
    setDirectives(data);
    localStorage.setItem("synk_directives", JSON.stringify(data));
  };

  // Timer Effects
  useEffect(() => {
    let interval: any;
    if (activeTimerId && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimerId, timeLeft]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newDirective: Directive = {
      id: crypto.randomUUID(),
      title: newTitle,
      priority: newPriority,
      deadline: new Date().toISOString().split('T')[0], // Default to today
      status: "Active",
      totalTime: 0
    };
    
    saveDirectives([...directives, newDirective]);
    setNewTitle("");
  };

  const handleCompleteTask = (id: string) => {
    const updated = directives.map(d => d.id === id ? { ...d, status: "Done" as const } : d);
    saveDirectives(updated);
  };

  const handleStartSession = (id: string) => {
    if (activeTimerId === id) return;
    setActiveTimerId(id);
    setTimeLeft(25 * 60); // 25 Min
    setSessionStartTime(Date.now());
  };

  const handleCompleteSession = () => {
    if (!activeTimerId || !sessionStartTime) return;
    
    const elapsedMinutes = Math.ceil((Date.now() - sessionStartTime) / 60000);
    
    const updated = directives.map(d => 
      d.id === activeTimerId ? { ...d, totalTime: d.totalTime + elapsedMinutes } : d
    );
    
    saveDirectives(updated);
    setActiveTimerId(null);
    setSessionStartTime(null);
  };

  const filteredDirectives = directives.filter(d => {
    if (filter === "COMPLETED") return d.status === "Done";
    if (d.status === "Done" || d.status === "Archived") return false;

    const todayStr = new Date().toISOString().split('T')[0];
    const isTodayOrPast = d.deadline ? d.deadline <= todayStr : false;

    if (filter === "TODAY") return isTodayOrPast || !d.deadline;
    if (filter === "UPCOMING") return !isTodayOrPast && d.deadline;
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-14 pb-32 overflow-y-auto custom-scrollbar overflow-x-hidden">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-10">
        
        {/* Header */}
        <header className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl md:text-5xl font-serif italic text-white tracking-tight">Directives</h1>
            </div>
          </div>
          
          <div className="flex gap-4 border-b border-white/5 pb-2">
            {(["TODAY", "UPCOMING", "COMPLETED"] as const).map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "text-[10px] uppercase tracking-[0.2em] pb-2 px-2 transition-all font-bold",
                  filter === f ? "text-white border-b-2 border-synk-lavender" : "text-white/30 hover:text-white/60"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        {/* Add Directive Input */}
        <form onSubmit={handleAdd} className="flex gap-3 bg-black/40 border border-white/10 p-2">
          <input 
            type="text" 
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="DEFINE NEW DIRECTIVE..."
            className="flex-1 bg-transparent px-4 py-2 text-sm text-white font-zh-serif focus:outline-none placeholder:text-white/20 uppercase tracking-widest"
          />
          <select 
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as any)}
            className="bg-white/5 text-white text-[10px] uppercase border border-white/10 px-3 outline-none cursor-pointer"
          >
            <option value="High">PRIORITY: HIGH</option>
            <option value="Medium">PRIORITY: MED</option>
            <option value="Low">PRIORITY: LOW</option>
          </select>
          <button type="submit" disabled={!newTitle.trim()} className="bg-synk-lavender text-black px-6 font-bold text-[10px] uppercase tracking-widest hover:brightness-125 transition-all disabled:opacity-50">
            DEPLOY
          </button>
        </form>

        {/* Task List */}
        <div className="flex flex-col gap-4 relative min-h-[300px]">
          {filteredDirectives.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-4 border border-dashed border-white/5 p-10">
              <Archive className="w-8 h-8 text-white/10" />
              <p className="text-[10px] font-mono tracking-widest text-white/30 uppercase">NO ACTIVE DIRECTIVES IN THIS VIEW</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredDirectives.map((directive) => {
                const isTimerActive = activeTimerId === directive.id;
                
                return (
                  <motion.div
                    key={directive.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="flex flex-col bg-white/[0.02] border border-white/10 p-5 group transition-colors hover:border-white/30"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <button 
                          onClick={() => handleCompleteTask(directive.id)}
                          className={cn(
                            "mt-1 w-5 h-5 border flex items-center justify-center transition-colors shrink-0",
                            directive.status === "Done" ? "bg-white border-white" : "border-white/30 hover:border-white"
                          )}
                        >
                          {directive.status === "Done" && <Check className="w-4 h-4 text-black" />}
                        </button>
                        <div className="flex flex-col gap-1">
                          <h3 className={cn(
                            "text-lg font-zh-serif text-white/90 leading-tight",
                            directive.status === "Done" && "line-through text-white/40"
                          )}>
                            {directive.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-[9px] font-mono uppercase tracking-widest text-white/40">
                            <span className={cn(
                              "px-2 py-0.5 border text-white",
                              directive.priority === 'High' ? "border-synk-pink bg-synk-pink/20" : 
                              directive.priority === 'Medium' ? "border-synk-blue bg-synk-blue/20" : 
                              "border-white/20 bg-white/5"
                            )}>
                              {directive.priority}
                            </span>
                            {directive.deadline && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {directive.deadline}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" /> {directive.totalTime}M LOGGED
                            </span>
                          </div>
                        </div>
                      </div>

                      {directive.status !== "Done" && (
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {isTimerActive ? (
                            <div className="flex items-center gap-3 bg-synk-blue/10 border border-synk-blue/30 px-3 py-1.5">
                              <span className="font-mono text-synk-blue font-bold tracking-widest text-xs">
                                {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                              </span>
                              <button onClick={handleCompleteSession} className="text-white hover:text-synk-pink transition-colors">
                                <Square className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleStartSession(directive.id)}
                              className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-white/50 hover:text-synk-lavender transition-colors border border-white/10 hover:border-synk-lavender/50 px-3 py-1.5"
                            >
                              <Play className="w-3 h-3" /> INITIATE FOCUS
                            </button>
                          )}
                          <button 
                            onClick={() => handleCompleteTask(directive.id)}
                            className="text-[9px] uppercase tracking-widest text-synk-lavender hover:text-white transition-colors"
                          >
                            EXECUTE
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
