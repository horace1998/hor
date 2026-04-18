import React, { useState } from "react";
import { useSYNK } from "../Store";
import { Fingerprint, Download, User as UserIcon, Shield, Map, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { cn, exportAsImage } from "../utils";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";

export default function IdentityCard() {
  const { stats, customBackground, setCustomBackground, bias, roomAtmosphere, setRoomAtmosphere, customName, setCustomName, customPhoto, setCustomPhoto, user } = useSYNK();
  const [showMotivation, setShowMotivation] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(customName);

  const handleUpdateName = () => {
    setCustomName(tempName);
    setEditingName(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setCustomPhoto(compressedDataUrl);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomBackground(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-5 md:p-14 pb-32 overflow-y-auto custom-scrollbar overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center justify-start text-center gap-8 md:gap-16">
        {/* Editorial Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 mb-12 sm:mb-20 mt-4 sm:mt-8 border-b border-white/10 w-full justify-center pb-4">
        <button 
          onClick={() => setShowMotivation(false)}
          className={`text-[10px] md:text-[11px] py-2 uppercase tracking-[0.4em] transition-all font-serif italic ${!showMotivation ? 'text-white border-b border-white' : 'text-white/30 hover:text-white/60'}`}
        >
          RESONANCE ACCESS / 共鳴存取
        </button>
        <button 
          onClick={() => setShowMotivation(true)}
          className={`text-[10px] md:text-[11px] py-2 uppercase tracking-[0.4em] transition-all font-serif italic ${showMotivation ? 'text-white border-b border-white' : 'text-white/30 hover:text-white/60'}`}
        >
          MY AUTHENTICATION / 會員認證
        </button>
      </div>

      {!showMotivation ? (
        <motion.div
          key="identity"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-16 items-start"
        >
          {/* Left Column: Visuals */}
          <div className="flex flex-col gap-10">
            <div className="relative group w-full max-w-[320px] mx-auto">
                <span className="absolute -top-8 sm:-top-12 left-0 text-[8px] sm:text-[10px] tracking-[0.5em] text-white/20 uppercase font-light">IDENTIFICATION SCAN</span>
                <div className="aspect-[4/5] bg-synk-glass border border-synk-border rounded-xl md:rounded-3xl overflow-hidden relative group">
                   {customPhoto || bias !== 'None' ? (
                     <img 
                       src={customPhoto || `https://picsum.photos/seed/${bias}/600/800`} 
                       alt={bias} 
                       className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 transition-all duration-1000"
                       referrerPolicy="no-referrer"
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-black">
                       <Fingerprint className="w-20 h-20 text-white/5" />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                   <div className="absolute bottom-8 left-8 flex flex-col items-start gap-1">
                      <span className="text-[9px] uppercase tracking-[0.4em] text-synk-lavender">ACCESS CODE</span>
                      <span className="text-2xl font-serif italic uppercase tracking-widest text-white">
                         {customName || (bias === 'None' ? 'GUEST MY' : `MY ${bias.toUpperCase()}`)}
                      </span>
                   </div>
                </div>
            </div>

            <div className="flex flex-col gap-6 w-full max-w-[320px] mx-auto">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-white/20 border-b border-white/5 pb-3 sm:pb-4 text-left">AESTHETICS CONFIG / 美學配置</span>
              <div className="grid grid-cols-1 gap-6">
                 <div className="flex flex-col gap-3">
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-white/20 text-left">NICKNAME SYNC / 暱稱</span>
                    {editingName ? (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          className="flex-1 bg-black border border-white/20 px-3 py-2 text-xs text-white focus:border-synk-lavender outline-none uppercase tracking-widest"
                          autoFocus
                        />
                        <button 
                          onClick={handleUpdateName}
                          className="bg-white text-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest"
                        >
                          SET
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setTempName(customName); setEditingName(true); }}
                        className="w-full py-3 sm:py-2 text-[9px] sm:text-[10px] text-left uppercase tracking-[0.3em] border border-white/10 text-white/30 hover:border-white/30 px-4"
                      >
                        {customName || "SYSTEM ASSIGNED"}
                      </button>
                    )}
                 </div>

                 <div className="flex flex-col gap-3">
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-white/20 text-left">VISUAL ID / 照片</span>
                    <label className="flex items-center gap-4 px-4 py-3 border border-white/10 bg-synk-glass hover:bg-white/5 transition-all cursor-pointer group">
                      <UserIcon className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                      <span className="text-[9px] uppercase tracking-[0.4em] font-serif italic text-left">UPLOAD BIO-METRIC / 上傳</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                 </div>

                 <div className="flex flex-col gap-3">
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-white/20 text-left">AMBIENT AURA / 靈氣</span>
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                       {(['Standard', 'Neon', 'Void'] as const).map(atmos => (
                          <button 
                             key={atmos}
                             onClick={() => setRoomAtmosphere(atmos)}
                             className={cn(
                               "flex-1 min-w-[80px] py-3 sm:py-2 text-[9px] sm:text-[10px] uppercase tracking-[0.3em] border transition-all",
                               roomAtmosphere === atmos ? "bg-white text-black font-bold border-white" : "border-white/10 text-white/30 hover:border-white/30"
                             )}
                          >
                             {atmos}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="flex flex-col gap-3">
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-white/20 text-left">TEXTURE SYNC / 紋理</span>
                    <label className="flex items-center gap-4 sm:gap-6 px-4 sm:px-8 py-4 sm:py-5 border border-synk-border bg-synk-glass hover:bg-white/5 transition-all rounded-xl cursor-pointer group">
                      <Map className="w-4 h-4 sm:w-5 sm:h-5 text-white/20 group-hover:text-white transition-colors" />
                      <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.4em] font-serif italic text-left">MANIFEST SPATIAL SYNC / 同步</span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                 </div>
              </div>
            </div>
          </div>

          {/* Right Column: Credentials */}
          <div className="flex flex-col gap-10 sm:gap-16 text-left">
            <header className="flex flex-col gap-3 sm:gap-4">
               <h1 className="vogue-title-page">SYNKID</h1>
               <p className="text-[10px] sm:text-[12px] text-synk-lavender/60 uppercase tracking-[0.4em] font-serif italic">身份認證 / REDEFINING REALITY</p>
            </header>

            <div className="flex flex-col gap-10 sm:gap-12">
               <div className="flex flex-col gap-8">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-white/20 border-b border-white/5 pb-3 sm:pb-4">CORE METRICS / 核心指標</span>
                  <div className="grid grid-cols-1 gap-8 sm:gap-12">
                     <div className="flex flex-col">
                        <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.3em] text-white/30 mb-1 sm:mb-2 text-left">RESONANCE INDEX</span>
                        <div className="flex items-end gap-3 sm:gap-4">
                           <span className="text-4xl sm:text-5xl font-serif italic text-white leading-none">{stats.level}</span>
                           <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-synk-lavender mb-1">LEVEL</span>
                        </div>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.3em] text-white/30 mb-1 sm:mb-2 text-left">EXPERIENCE ACCUMULATION</span>
                        <div className="flex items-end gap-3 sm:gap-4">
                           <span className="text-4xl sm:text-5xl font-serif italic text-white leading-none">{stats.experience}</span>
                           <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-white/10 mb-1">UNITS</span>
                        </div>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.3em] text-white/30 mb-1 sm:mb-2 text-left">ANOMALY ERASURE COUNT</span>
                        <div className="flex items-end gap-3 sm:gap-4">
                           <span className="text-4xl sm:text-5xl font-serif italic text-white leading-none">{stats.completed_goals}</span>
                           <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-synk-pink mb-1">PROTOCOLS</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-4 sm:gap-6">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-white/20 border-b border-white/5 pb-3 sm:pb-4">STATUS RATING</span>
                  <div className="flex items-center gap-4 sm:gap-6">
                     <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-synk-pink animate-pulse" />
                     <h2 className="text-xl sm:text-3xl font-serif italic uppercase tracking-widest text-white leading-tight">ELITE AGENT / 精英特工</h2>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-white/40 uppercase tracking-[0.1em] sm:tracking-[0.2em] max-w-sm leading-relaxed text-left">
                     VIRTUAL ACCESSID MY V2. AUTHORIZED TO NAVIGATE THE VOID AND SYNCHRONIZE WITH THE CORE.
                  </p>
               </div>

               {/* Account Information Panel (Small Box at bottom) */}
               <div className="flex justify-between items-center w-full max-w-sm bg-white/[0.02] border border-white/10 p-3 sm:p-4 rounded-xl mt-4 sm:mt-6">
                 <div className="flex items-center gap-3">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-white/20 object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/5 border border-white/20 flex items-center justify-center">
                        <UserIcon className="w-3 h-3 text-white/40" />
                      </div>
                    )}
                    <div className="flex flex-col">
                       <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">SYNCED ID</span>
                       <span className="text-[9px] sm:text-[11px] font-bold text-white tracking-widest uppercase truncate max-w-[120px] sm:max-w-[180px]">
                          {user?.displayName || "UNKNOWN AGENT"}
                          {user?.isAnonymous && <span className="ml-2 text-[8px] text-synk-pink opacity-80">[GUEST]</span>}
                        </span>
                    </div>
                 </div>

                 <button 
                   onClick={handleSignOut}
                   className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg group transition-all"
                 >
                    <LogOut className="w-3 h-3 sm:w-4 sm:h-4 text-white/40 group-hover:text-synk-pink transition-colors" />
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors">DISCONNECT</span>
                 </button>
               </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <MotivationCard />
      )}
    </div>
    </div>
  );
}

function MotivationCard() {
  const { bias, customName, customPhoto } = useSYNK();
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <motion.div
      key="passport"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-16"
      style={{ perspective: 1200 }}
    >
      <header className="flex flex-col gap-2 items-center px-4">
         <h1 className="vogue-title-page text-white">PASSPORT</h1>
         <p className="text-[10px] sm:text-[12px] text-synk-lavender uppercase tracking-[0.4em] sm:tracking-[0.6em] font-serif italic text-center">虛擬准入證 / VIRTUAL ACCESS PASS</p>
      </header>

      <motion.div
        id="synk-passport-card"
        className="w-[90vw] max-w-[400px] aspect-[1/1.4] bg-white text-black relative overflow-hidden flex flex-col justify-between p-6 sm:p-12 cursor-pointer shadow-2xl"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: rotate.x,
          rotateY: rotate.y,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="flex justify-between items-start w-full relative z-10 border-b border-black/10 pb-6 sm:pb-8">
          <div className="flex flex-col gap-5">
             <Fingerprint className="w-10 h-10 sm:w-12 sm:h-12 text-black" />
             <div className="w-20 h-28 sm:w-28 sm:h-36 bg-black/5 border border-black/10 overflow-hidden relative">
                {customPhoto || bias !== 'None' ? (
                   <img 
                     src={customPhoto || `https://picsum.photos/seed/${bias}/300/400`} 
                     alt="Agent Profile"
                     className="w-full h-full object-cover grayscale"
                     referrerPolicy="no-referrer"
                   />
                ) : (
                   <div className="w-full h-full flex items-center justify-center bg-black/5">
                      <Fingerprint className="w-10 h-10 text-black/10" />
                   </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
             </div>
          </div>
          <div className="text-right flex flex-col items-end pt-1">
            <span className="text-[10px] sm:text-[12px] uppercase tracking-[0.4em] font-serif italic font-bold">SYNK PASSPORT TOKEN</span>
            <span className="text-[8px] sm:text-[10px] font-mono text-black/40">#AE-KW 0X9192</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:gap-8 relative z-10 mt-6 sm:mt-0">
          <h3 className="vogue-title-section text-black">
            {customName ? customName.toUpperCase() : "MANIFEST"}<br/>{customName ? "" : "DESTINY"}
          </h3>
          <div className="flex flex-col gap-1 sm:gap-2">
            <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.4em] text-black/30 font-bold">AGENT RESOLUTION / 宣示命運</span>
            <p className="text-[12px] sm:text-[14px] font-serif italic text-black leading-relaxed">
              「我們在宇宙的負空間中<br/>建立自己的現實。」
            </p>
          </div>
        </div>

        <div className="flex justify-between items-end relative z-10 border-t border-black/10 pt-6 sm:pt-8 mt-6 sm:mt-0">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.4em] text-black/40">ORIGIN COORD / 座標</span>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-bold">UNKNOWN / 未知</span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 border border-black/20 bg-black flex items-center justify-center">
             <div className="w-4 h-4 sm:w-6 sm:h-6 border border-white/20" />
          </div>
        </div>
      </motion.div>

      <button 
        onClick={() => exportAsImage("synk-passport-card", "synk-passport.png")}
        className="flex items-center justify-center gap-4 sm:gap-6 px-10 sm:px-12 py-4 sm:py-5 bg-white text-black text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.4em] hover:invert transition-all group w-[80%] sm:w-auto"
      >
        <Download className="w-4 h-4 group-hover:translate-y-1 transition-transform" /> SAVE CREDENTIALS / 儲存通行證
      </button>
    </motion.div>
  );
}
