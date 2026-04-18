import React, { useState } from "react";
import { useSYNK } from "../Store";
import ThreeBackground from "../ThreeBackground";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../utils";
import { Layout, Notebook, Users, Activity, ExternalLink, Image as ImageIcon, Plus, Trash2, Box } from "lucide-react";

export default function RitualDashboard() {
  const { 
    stats, completionRate, goals, bias, setBias, roomAtmosphere,
    decorations, addDecoration, removeDecoration 
  } = useSYNK();
  const [showDesigner, setShowDesigner] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          addDecoration(compressedDataUrl, 'image');
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const getLoreQuote = () => {
    switch(bias) {
      case 'Karina': return "無限同步已經開始。請接入您的 P.O.S。";
      case 'Winter': return "磨礪您的裝備。Flat 正呼喚著您的意志。";
      case 'Giselle': return "偵測到 Lingua 信號。透過行動解碼您的命運。";
      case 'Ningning': return "正在侵入現實日誌。您的潛力無限。";
      default: return "星辰間的寧靜是真正成長引起共鳴的地方。";
    }
  };

  const getMemberTitle = () => {
    switch(bias) {
      case 'Karina': return "資深成員";
      case 'Winter': return "重裝武器";
      case 'Giselle': return "語言模組";
      case 'Ningning': return "E.D. 駭客";
      default: return "初級隨從";
    }
  };

  const activeGoals = goals.filter(g => !g.completed).slice(0, 5);

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-14 pb-32 overflow-y-auto custom-scrollbar overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-12 md:gap-16">
        {/* Editorial Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-synk-border pb-8 md:pb-12">
          <div className="flex flex-col gap-1">
            <h1 className="vogue-title-page">PORTAL SYNC</h1>
            <p className="text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.5em] text-synk-lavender font-light uppercase ml-0.5 md:ml-1">
              虛擬同步中心 <span className="opacity-20 ml-2">ACCESS LEVEL O1</span>
            </p>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
              <div className="flex flex-col items-start md:items-end">
                 <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/30">RESONANCE</span>
                 <span className="font-serif italic text-xl md:text-2xl">{Math.round(completionRate * 100)}%</span>
              </div>
              <div className="w-[1px] h-8 bg-synk-border" />
              <div className="flex flex-col items-start md:items-end">
                 <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/30">AURA RATING</span>
                 <span className="font-serif italic text-xl md:text-2xl">ELITE</span>
              </div>
            </div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[8px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.3em] text-synk-pink bg-synk-pink/10 px-3 py-1 rounded w-fit md:ml-auto"
            >
              STATUS: CALIBRATED / 已校準
            </motion.div>
          </div>
        </header>

      {/* Hero Room View */}
      <section className="bg-synk-glass border border-synk-border rounded-[24px] md:rounded-[40px] p-6 md:p-12 relative flex flex-col items-center justify-center min-h-[400px] md:min-h-[480px] overflow-hidden group shadow-[0_40px_100px_rgba(0,0,0,0.3)]">
        <div className={cn(
          "absolute inset-0 transition-all duration-1000",
          roomAtmosphere === 'Void' ? 'bg-black/80' : 'bg-transparent'
        )} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-synk-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        {/* Dynamic Spatial Grid */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 overflow-hidden">
           <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px', transform: 'perspective(1000px) rotateX(60deg) translateY(0px)' }} />
        </div>

        {/* Local Decoration Artifacts Layer */}
        <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden select-none">
           <AnimatePresence>
              {decorations.map((dec) => (
                 <motion.div
                   key={dec.id}
                   initial={{ opacity: 0, scale: 0, rotate: -20, filter: "blur(20px)" }}
                   animate={{ 
                     opacity: roomAtmosphere === 'Void' ? 0.4 : 0.9, 
                     scale: dec.scale, 
                     rotate: 0,
                     filter: roomAtmosphere === 'Void' ? "blur(2px) grayscale(0.5)" : "blur(0px)",
                     y: [0, -30, 0],
                     x: [0, 15, 0]
                   }}
                   exit={{ opacity: 0, scale: 1.5, filter: "blur(30px)", transition: { duration: 0.3 } }}
                   transition={{
                     opacity: { duration: 0.8 },
                     scale: { duration: 0.6, ease: "backOut" },
                     y: { duration: 5 + Math.random() * 3, repeat: Infinity, ease: "easeInOut" },
                     x: { duration: 6 + Math.random() * 3, repeat: Infinity, ease: "easeInOut" },
                     filter: { duration: 1 }
                   }}
                   style={{ 
                     left: `${dec.x}%`, 
                     top: `${dec.y}%`,
                     position: 'absolute'
                   }}
                   className="group pointer-events-auto"
                 >
                    {dec.type === 'image' ? (
                      <div className={cn(
                        "relative p-1 md:p-1.5 rounded-xl md:rounded-2xl bg-synk-glass border border-white/30 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.5)] origin-center group-hover:scale-110 group-hover:border-synk-lavender/50 transition-all cursor-grab active:cursor-grabbing",
                        roomAtmosphere === 'Void' && "border-white/10"
                      )}>
                         <div className="absolute inset-[-15px] bg-synk-lavender/20 blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity rounded-full z-[-1]" />
                         <img 
                           src={dec.image} 
                           alt="shard" 
                           referrerPolicy="no-referrer"
                           className="w-24 md:w-32 h-auto max-h-32 md:max-h-48 rounded-xl grayscale-[0.1] contrast-[1.1] shadow-inner" 
                         />
                         <div className="absolute inset-0 bg-gradient-to-tr from-synk-lavender/30 via-transparent to-synk-blue/30 mix-blend-overlay pointer-events-none rounded-xl" />
                      </div>
                    ) : (
                      <div className="relative w-12 md:w-16 h-12 md:h-16 flex items-center justify-center group-hover:scale-125 transition-transform cursor-pointer">
                         <div className={cn(
                            "absolute inset-[-15px] md:inset-[-25px] bg-synk-blue/40 blur-[20px] md:blur-[25px] opacity-30 group-hover:opacity-60 rounded-full transition-opacity",
                            roomAtmosphere === 'Void' && "opacity-10"
                         )} />
                         <Box className="w-6 md:w-8 h-6 md:h-8 text-synk-blue/80 drop-shadow-[0_0_15px_rgba(96,165,250,0.9)] animate-spin-slow" />
                         <div className="absolute w-1.5 md:w-2 h-1.5 md:h-2 bg-white blur-[2px] rounded-full opacity-60" />
                      </div>
                    )}
                 </motion.div>
              ))}
           </AnimatePresence>
        </div>

        <div className="absolute inset-0 z-0 overflow-hidden rounded-[24px] md:rounded-[40px]">
            <ThreeBackground completionRate={completionRate} />
        </div>
        
         {/* Floating Quote Block */}
        <div className="absolute top-6 left-6 md:top-12 md:left-12 z-20 flex flex-col pointer-events-none">
          <span className="hidden md:block text-[9px] uppercase tracking-[0.4em] text-white/30 mb-4 vertical-text h-32 origin-top-left">UNIVERSE WHISPER</span>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] md:text-[14px] uppercase tracking-[0.2em] font-serif italic text-synk-lavender">THE SOUL SPEAKS</span>
            <span className="text-xl md:text-2xl font-serif max-w-[200px] md:max-w-sm leading-tight text-white/90 drop-shadow-md">
              「{getLoreQuote()}」
            </span>
          </div>
        </div>
        
         <div className="mt-auto mb-6 md:mb-12 text-center flex flex-col items-center gap-2 z-10 w-full px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between w-full items-center md:items-end gap-6 md:gap-0">
            <div className="flex flex-col items-center md:items-start order-2 md:order-1">
               <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-white/40">CONFIG</span>
               <span className="text-xl md:text-2xl font-serif italic uppercase tracking-widest leading-none">{roomAtmosphere === 'Standard' ? 'NORMAL' : roomAtmosphere === 'Void' ? 'VOID' : roomAtmosphere}</span>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDesigner(true)}
              className="px-6 md:px-8 py-2 md:py-3 bg-white text-black text-[9px] md:text-[11px] font-bold uppercase tracking-[0.3em] rounded-sm shadow-xl order-1 md:order-2"
            >
              ACCESS DESIGNER <span className="hidden xs:inline">/ 空間配置</span>
            </motion.button>

            <div className="flex flex-col items-center md:items-end order-3">
               <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-white/40">MEMBER CODE</span>
               <span className="text-xl md:text-2xl font-serif italic uppercase tracking-widest leading-none">{bias === 'None' ? 'UNASSIGNED' : bias}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Notion-style Page Layout Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 pb-12">
         {/* Identity Card Mini */}
         <div className="flex flex-col gap-6 p-6 rounded-2xl bg-white/2 border border-white/5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
               <h4 className="vogue-title-section text-lg md:text-xl">IDENTITY / 身份</h4>
               <span className="text-[10px] font-mono text-white/20">RANK:O1</span>
            </div>
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-full border border-white/10 bg-black/40 overflow-hidden shadow-inner group transition-transform hover:scale-105 shrink-0">
                  <img src={`https://picsum.photos/seed/${bias === 'None' ? 'all' : bias}/100/100`} alt="Pass" referrerPolicy="no-referrer" className="w-full h-full object-cover grayscale opacity-80" />
               </div>
               <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-lg font-serif uppercase tracking-widest italic text-white leading-none truncate">Agent MY</span>
                  <span className="text-[9px] flex items-center gap-1.5 uppercase tracking-[0.2em] text-synk-lavender font-light">
                    {getMemberTitle()}
                  </span>
               </div>
            </div>
         </div>

         {/* Today's Mission Log */}
         <div className="flex flex-col gap-6 p-6 rounded-2xl bg-white/2 border border-white/5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
               <h4 className="vogue-title-section text-lg md:text-xl">DIRECTIVES / 任務</h4>
               <span className="text-[10px] font-mono text-white/20">{activeGoals.length} ACTIVE</span>
            </div>
            <div className="flex flex-col gap-3">
               {activeGoals.slice(0, 3).map(g => (
                  <div key={g.id} className="flex items-center justify-between border-b border-white/5 pb-2 hover:border-synk-pink/40 transition-colors gap-4">
                     <span className="text-sm text-white/80 font-serif italic truncate">「{g.title}」</span>
                     <span className="text-[8px] uppercase tracking-widest text-synk-pink shrink-0">{g.type}</span>
                  </div>
               ))}
               {activeGoals.length === 0 && <span className="text-[10px] text-white/20 italic font-serif">Empty archive.</span>}
            </div>
         </div>

         {/* Synergy Analytics */}
         <div className="flex flex-col gap-6 p-6 rounded-2xl bg-white/2 border border-white/5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
               <h4 className="vogue-title-section text-lg md:text-xl">SYNERGY / 能量</h4>
               <span className="text-[10px] font-mono text-white/20 text-synk-blue">MAX SYNC</span>
            </div>
            <div className="flex items-end gap-1.5 h-12">
               {[0.3, 0.8, 0.5, 0.9, 0.4, 0.7, 0.6, 1, 0.8, 0.5, 0.9].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-synk-lavender/20 border-t border-synk-lavender/40 hover:bg-synk-lavender/40 transition-all rounded-sm" 
                    style={{ height: `${h * 100}%` }}
                  />
               ))}
            </div>
            <p className="text-[9px] text-white/40 uppercase tracking-widest mt-auto">
               Synchronizing with flat... <span className="text-white">Active</span>
            </p>
         </div>
      </div>

       {/* Designer Side Panel (Overlayed Modal now for high fashion look) */}
       <AnimatePresence>
        {showDesigner && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDesigner(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" 
            />
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="fixed top-0 right-0 w-full max-w-sm h-full bg-[#080808] border-l border-white/10 z-[70] flex flex-col p-12 overflow-y-auto"
            >
               <div className="flex flex-col gap-12 h-full">
                  <header className="flex flex-col gap-2">
                     <h3 className="vogue-title-section">DESIGNER</h3>
                     <p className="text-[10px] text-synk-lavender uppercase tracking-[0.4em] font-light">宇宙設計中心 / <span className="text-white/30">UNIVERSE EDITOR</span></p>
                  </header>

                  <div className="flex flex-col gap-6">
                     <span className="text-[10px] uppercase tracking-[0.4em] text-white/20 border-b border-white/5 pb-4">具現化模組 / MANIFESTATION</span>
                     <div className="grid grid-cols-2 gap-6">
                        <label className="flex flex-col items-center justify-center aspect-[4/5] border border-white/10 bg-white/2 hover:border-white/30 transition-all cursor-pointer group">
                           <ImageIcon className="w-6 h-6 text-white/20 mb-4 group-hover:text-white transition-colors" />
                           <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-white/30">Shard / 碎片</span>
                           <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        </label>
                        <button 
                           onClick={() => addDecoration('', 'crystal')}
                           className="flex flex-col items-center justify-center aspect-[4/5] border border-white/10 bg-white/2 hover:border-white/30 transition-all group"
                        >
                           <Box className="w-6 h-6 text-white/20 mb-4 group-hover:text-white transition-colors" />
                           <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-white/30">Aura / 水晶</span>
                        </button>
                     </div>
                  </div>

                  <div className="flex flex-col gap-6 flex-1">
                     <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-white/20">正在具現化 / ACTIVE SLOTS</span>
                        <span className="text-[10px] font-mono text-white/40">{decorations.length} / 12</span>
                     </div>
                     <div className="flex flex-col gap-4">
                        {decorations.map((dec) => (
                           <div key={dec.id} className="flex items-center gap-6 border-b border-white/5 pb-4 group">
                              <div className="w-12 h-12 border border-white/10 bg-black/40 overflow-hidden">
                                {dec.type === 'image' ? (
                                   <img src={dec.image} className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
                                ) : (
                                   <div className="w-full h-full flex items-center justify-center"><Box className="w-5 h-5 text-white/10" /></div>
                                )}
                              </div>
                              <div className="flex flex-col flex-1">
                                 <span className="text-[12px] font-serif italic text-white/80">{dec.type === 'image' ? 'Visual Shard' : 'Energy Crystal'}</span>
                                 <span className="text-[8px] uppercase tracking-widest text-white/20">ID {dec.id?.slice(0, 6)}</span>
                              </div>
                              <button onClick={() => removeDecoration(dec.id)} className="text-white/10 hover:text-synk-pink transition-colors">
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  <button 
                    onClick={() => setShowDesigner(false)}
                    className="w-full py-5 text-[11px] uppercase font-bold tracking-[0.5em] bg-white text-black rounded-sm hover:invert transition-all"
                  >
                     CLOSE EDITOR
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bias Selection Sidebar Integrated as a wide block */}
      <section className="bg-synk-glass border border-synk-border rounded-[24px] md:rounded-[40px] p-8 md:p-14 flex flex-col gap-12 md:gap-16 group overflow-hidden">
         <div className="flex flex-col gap-2 items-start border-b border-synk-border pb-8 md:pb-12 w-full">
            <h4 className="vogue-title-section">USER SYNC</h4>
            <p className="text-[10px] text-synk-lavender uppercase tracking-[0.5em] font-light">成員同步模式 / <span className="text-white/30">SELECT RESONANCE TARGET</span></p>
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-16 w-full place-items-center">
            {(['None', 'Karina', 'Winter', 'Giselle', 'Ningning'] as const).map(m => (
               <button 
                  key={m}
                  onClick={() => setBias(m)}
                  className="relative flex flex-col items-center gap-8 group/member bg-transparent"
               >
                  <div className={cn(
                     "w-24 h-24 rounded-full border-[0.5px] transition-all p-2 bg-white/2",
                     bias === m ? "border-white" : "border-white/10 group-hover/member:border-white/30"
                  )}>
                     <img 
                        src={`https://picsum.photos/seed/${m === 'None' ? 'aespa-group' : m}/200/200`} 
                        alt={m} 
                        className={cn("w-full h-full object-cover rounded-full grayscale opacity-40 group-hover/member:opacity-100 group-hover/member:grayscale-0 transition-all duration-1000", bias===m && "grayscale-0 opacity-100")}
                        referrerPolicy="no-referrer"
                     />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className={cn(
                      "text-[12px] font-serif italic tracking-[0.2em] uppercase transition-colors",
                      bias === m ? "text-white" : "text-white/20"
                    )}>
                      {m === 'None' ? 'DEFAULT' : m}
                    </span>
                    {bias === m && (
                      <span className="text-[8px] uppercase tracking-widest text-synk-lavender">Active Link</span>
                    )}
                  </div>
               </button>
            ))}
         </div>
      </section>
    </div>
    </div>
  );
}
