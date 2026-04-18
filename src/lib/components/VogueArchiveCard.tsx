import React, { useMemo, useState, useEffect } from "react";
import { motion } from "motion/react";
import { JournalEntry } from "../Store";
import { cn } from "../utils";
import { Globe, MapPin, Sparkles } from "lucide-react";

interface VogueArchiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  entry: JournalEntry;
  priority?: boolean;
  key?: React.Key;
}

export default function VogueArchiveCard({ entry, priority = false }: VogueArchiveCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const timestamp = useMemo(() => {
    return new Date(entry.createdAt?.seconds * 1000 || Date.now());
  }, [entry.createdAt]);

  const isoDate = timestamp.toISOString().split('T')[0];
  const resonanceLevel = useMemo(() => {
    return (Math.random() * 20 + 80).toFixed(1); // Mock resonance for aesthetic
  }, []);

  // Simple iridescent background circles
  const Bubbles = () => (
    <div className="absolute inset-0 overflow-hidden opacity-30 mix-blend-screen pointer-events-none">
       {/* Flowing Particles */}
       {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: [Math.random() * 400, Math.random() * 400],
              y: [Math.random() * 600, Math.random() * 600],
              opacity: [0.1, 0.4, 0.1],
              scale: [0.5, 1.5, 0.5]
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-2 h-2 rounded-full bg-white blur-[2px] shadow-[0_0_10px_white]"
          />
       ))}

       <motion.div 
         animate={{ 
           x: [0, 40, 0],
           y: [0, -30, 0],
           scale: [1, 1.2, 1]
         }}
         transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
         className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-synk-blue/40 via-white/10 to-transparent blur-3xl"
       />
       <motion.div 
         animate={{ 
           x: [0, -50, 0],
           y: [0, 40, 0],
           scale: [1, 1.5, 1]
         }}
         transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
         className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-synk-pink/30 via-synk-lavender/10 to-transparent blur-[100px]"
       />
    </div>
  );

  return (
    <motion.div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative overflow-hidden group bg-black border border-white/5",
        priority ? "col-span-1 md:col-span-2 aspect-[16/9]" : "aspect-[3/4]"
      )}
    >
      {/* Background Layer: 3D-ish Particles/Glow */}
      <Bubbles />
      
      {/* Photo Layer */}
      <div className="absolute inset-0 z-10 transition-transform duration-[3000ms] ease-out group-hover:scale-105">
        {entry.imageUrl ? (
          <div className="relative w-full h-full">
            <img 
              src={entry.imageUrl}
              alt="Archive"
              className="w-full h-full object-cover grayscale-[0.3] brightness-75 group-hover:grayscale-0 group-hover:brightness-90 transition-all duration-1000"
              referrerPolicy="no-referrer"
              style={entry.maskPath ? { clipPath: `path('${entry.maskPath}')` } : {}}
            />
            {/* 2.5D Effect: If we have a mask, show particles behind it */}
            {entry.maskPath && (
               <div className="absolute inset-0 z-[-1] bg-gradient-to-tr from-synk-pink/20 to-synk-blue/20 animate-pulse animate-shimmer bg-[length:200%_100%]" />
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-synk-glass border-b border-white/5 flex items-center justify-center">
             <Globe className="w-12 h-12 text-white/5" />
          </div>
        )}
      </div>

      {/* VOGUE Editorial Overlay Layer */}
      <div className="absolute inset-0 z-20 p-6 md:p-10 flex flex-col justify-between pointer-events-none">
        
        {/* Top Header Section */}
        <div className="flex justify-between items-start">
           <div className="flex flex-col gap-1">
              <span className="text-[9px] sm:text-[10px] tracking-[0.5em] text-synk-lavender font-light uppercase italic">ORACLE_LINK_READY</span>
              <span className="text-[10px] sm:text-[12px] font-mono text-white/40 uppercase tracking-tight">{isoDate} // ACCESS: {resonanceLevel}%</span>
           </div>
           <div className="flex flex-col items-end">
              <Sparkles className="w-4 h-4 text-synk-pink opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="flex gap-1 mt-2">
                 <div className="w-1 h-3 bg-synk-blue" />
                 <div className="w-1 h-3 bg-synk-pink" />
              </div>
           </div>
        </div>

        {/* Center Typography (Editorial Overlay) */}
        <div className="flex flex-col gap-6 mt-auto mb-10 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
           <div className="flex flex-col">
              <span className="text-[8px] sm:text-[9px] tracking-[0.6em] text-synk-blue uppercase mb-3">SYNCHRONIZED_MEMORY</span>
              <h2 className="vogue-title-page text-white tracking-tight">
                {entry.content.split(' ')[0] || "NULL"} <br />
                <span className="font-serif italic text-white/40 ml-6 md:ml-10">{entry.content.split(' ')[1] || "DATA"}</span>
              </h2>
           </div>
           
           <div className="max-w-xs border-l-2 border-synk-lavender/40 pl-6 mt-2">
              <p className="font-zh-serif text-[13px] md:text-[15px] leading-relaxed text-white italic">
                「{entry.content}」
              </p>
              <p className="text-[10px] font-mono text-white/30 uppercase mt-4 tracking-widest">
                PERSISTENCE_LAYER: OK
              </p>
           </div>
        </div>

        {/* Global Footer Section */}
        <div className="flex items-end justify-between border-t border-white/10 pt-6">
           {(entry.lyrics_en || entry.lyrics_zh) ? (
              <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-2">
                    <span className="text-[7px] tracking-[0.4em] text-white/30 uppercase font-mono">AGENT_WHISPER // LYRICS</span>
                    <span className="w-1 h-1 rounded-full bg-synk-pink animate-pulse" />
                 </div>
                 <div className="flex flex-col gap-1 max-w-[200px] md:max-w-sm">
                    {entry.lyrics_en && (
                      <p className="text-[11px] md:text-[13px] font-serif italic text-white/80 leading-tight">
                        {entry.lyrics_en}
                      </p>
                    )}
                    {entry.lyrics_zh && (
                      <p className="text-[11px] md:text-[13px] font-zh-serif italic text-synk-lavender leading-tight">
                        {entry.lyrics_zh}
                      </p>
                    )}
                 </div>
              </div>
           ) : (
              <div className="flex items-center gap-3 text-white/30">
                 <MapPin className="w-3 h-3 text-synk-blue" />
                 <span className="text-[9px] tracking-[0.3em] uppercase">{entry.location?.name || "UNBOUND_COORDS"}</span>
              </div>
           )}

           <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] sm:text-[12px] vogue-title-nav text-white/60">THE CHRONICLE</span>
              <div className="text-[7px] font-mono text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                 <span>LOC_ID</span>
                 <span className="w-2 h-[1px] bg-white/10" />
                 <span>{entry.location?.coords || "37.5665° N"}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Decorative Overlays */}
      <div className="absolute inset-0 z-30 pointer-events-none border-[1px] border-white/10 m-3 group-hover:m-2 transition-all duration-500" />
      <div className="absolute top-8 left-8 z-30 pointer-events-none mix-blend-difference">
         <span className="text-[14px] font-serif italic text-white/20">A.E. {resonanceLevel}</span>
      </div>
    </motion.div>
  );
}
