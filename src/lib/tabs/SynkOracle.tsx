import { useState, useEffect } from "react";
import { cn, exportAsImage } from "../utils";
import { Share2, Download, RefreshCw, Shield, X, ArrowDown, Fingerprint } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSYNK } from "../Store";

interface OracleQuote {
  track: string;
  category: 'DEBT_MANAGEMENT' | 'ACADEMIC_PRESSURE' | 'SOCIAL_ANXIETY' | 'CAREER_AMBITION';
  status: 'GREAT_LUCK' | 'STABLE' | 'CAUTION';
  kr: string;
  tc: string;
  en: string;
  keyword: string;
  advice: string;
}

const ORACLE_DB: OracleQuote[] = [
  {
    track: "Supernova",
    category: "CAREER_AMBITION",
    status: "GREAT_LUCK",
    kr: "나는 내 모든 걸 걸고 너에게로 가고 있어",
    tc: "我正賭上我的一切。向著你奔馳而去。",
    en: "I am staking everything I have, sprinting towards you.",
    keyword: "VELOCITY",
    advice: "當你決定賭上一切時，對手就已經輸了。保持你的瞬發力。"
  },
  {
    track: "Supernova",
    category: "DEBT_MANAGEMENT",
    status: "STABLE",
    kr: "다시 태어난 것 같아, 숨이 멎을 듯한 기분",
    tc: "宛如重生一般，令人窒息的悸動。",
    en: "A sensation of rebirth, a breath-stopping frequency.",
    keyword: "REBIRTH",
    advice: "你的帳目正在重新排列。別害怕短暫的停頓，宇宙正為你騰出更廣闊的星際銀行。"
  },
  {
    track: "Next Level",
    category: "CAREER_AMBITION",
    status: "GREAT_LUCK",
    kr: "절대로 뒤를 돌아보지 마",
    tc: "絕對不要回頭看。",
    en: "Never, ever look back.",
    keyword: "ASCENSION",
    advice: "既然已經踏上 Next Level，就別再留戀平庸的影子。未來在你前方瘋狂加速。"
  },
  {
    track: "Drama",
    category: "SOCIAL_ANXIETY",
    status: "GREAT_LUCK",
    kr: "I'm the Drama",
    tc: "我就是 Drama 本身。",
    en: "I'm the total Drama.",
    keyword: "PROTAGONIST",
    advice: "既然生活是一場戲，你必須是那個讓收視率飆升的主角。盡情綻放，不要為任何人的目光而收斂。"
  },
  {
    track: "Armageddon",
    category: "DEBT_MANAGEMENT",
    status: "CAUTION",
    kr: "끝이 아닌 새로운 시작",
    tc: "這不是終結，而是嶄新的起始。",
    en: "Not an ending, but a new genesis.",
    keyword: "GENESIS",
    advice: "重創之後必有重生。清理舊帳，你的財務末日正是新紀元的黎明。"
  },
  {
    track: "Savage",
    category: "SOCIAL_ANXIETY",
    status: "CAUTION",
    kr: "나의 아우라, I'm the Savage",
    tc: "我的氣場，我是 Savage。",
    en: "My aura, I'm the Savage.",
    keyword: "DOMINANCE",
    advice: "如果你的氣場讓人感到威脅，那是他們的問題。別為了合群而收縮你的翅膀。"
  },
  {
    track: "Lucid Dream",
    category: "ACADEMIC_PRESSURE",
    status: "STABLE",
    kr: "마치 꿈을 꾸는 것 같아",
    tc: "就如同進入了一場夢境。",
    en: "It feels just like traversing a dream.",
    keyword: "LUCIDITY",
    advice: "清晰的頭腦只屬於那些睡得夠好的人。不要熬夜到天亮，答案往往隱藏在最深層的呼吸中。"
  },
  {
    track: "Whiplash",
    category: "CAREER_AMBITION",
    status: "GREAT_LUCK",
    kr: "Whiplash, break it down",
    tc: "打破一切限制。",
    en: "Whiplash, break it down completely.",
    keyword: "DISRUPTION",
    advice: "常規是用來打破的。你的反骨正是你通往頂峰的階梯。"
  },
  {
    track: "Welcome To My World",
    category: "SOCIAL_ANXIETY",
    status: "STABLE",
    kr: "Welcome to my world",
    tc: "歡迎來到我的世界。",
    en: "Welcome to my private sanctuary.",
    keyword: "SANCTUARY",
    advice: "不必去融入別人的嘈雜。邀請真正懂得的人進入你的頻率，那才是最高級別的社交。"
  },
  {
    track: "Spicy",
    category: "CAREER_AMBITION",
    status: "GREAT_LUCK",
    kr: "Too spicy for your heart",
    tc: "對你的心臟來說太過火辣。",
    en: "A intensity too spicy for your heart to handle.",
    keyword: "INTENSITY",
    advice: "如果你讓別人感到不適，那是因為你能量滿溢。保持這種高度的熱情，讓平庸者望塵莫及。"
  }
];

function PrismHold({ onReveal }: { onReveal: () => void }) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frameId: number;
    if (isHolding) {
      const startTime = Date.now();
      const duration = 1000; // Exactly 1 second (1000ms)

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const currentProgress = Math.min((elapsed / duration) * 100, 100);
        setProgress(currentProgress);

        if (currentProgress < 100) {
          frameId = requestAnimationFrame(animate);
        }
      };
      
      frameId = requestAnimationFrame(animate);
    } else {
      setProgress(0);
    }
    
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [isHolding]);

  useEffect(() => {
    if (progress >= 100) {
      onReveal();
    }
  }, [progress, onReveal]);

  return (
    <div className="relative flex flex-col items-center gap-10 py-8">
      <div 
        className="relative w-48 h-48 flex items-center justify-center cursor-pointer select-none group touch-none [-webkit-touch-callout:none]"
        onMouseDown={() => setIsHolding(true)}
        onMouseUp={() => setIsHolding(false)}
        onMouseLeave={() => setIsHolding(false)}
        onTouchStart={() => setIsHolding(true)}
        onTouchEnd={() => setIsHolding(false)}
        onTouchCancel={() => setIsHolding(false)}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Progress Halo */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-white/10"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="502.4"
            animate={{ strokeDashoffset: 502.4 - (502.4 * progress) / 100 }}
            className="text-synk-lavender"
          />
        </svg>

        {/* Central Core */}
        <motion.div 
          animate={{
            scale: isHolding ? 1.1 : 1,
            rotate: isHolding ? 45 : 0,
            boxShadow: isHolding ? "0 0 50px rgba(167,139,250,0.5)" : "0 0 20px rgba(255,255,255,0.1)"
          }}
          className={cn(
            "w-24 h-24 bg-black border border-white/20 flex items-center justify-center transition-colors duration-500",
            isHolding ? "border-synk-lavender" : "border-white/20"
          )}
        >
          <Fingerprint className={cn(
            "w-10 h-10 transition-colors duration-500",
            isHolding ? "text-synk-lavender animate-pulse" : "text-white/20"
          )} />
        </motion.div>

        {/* Floating Sparks */}
        <AnimatePresence>
          {isHolding && Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200,
              }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
              className="absolute w-1 h-1 bg-white rounded-full"
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.5em] text-synk-lavender font-bold">
          {progress > 0 ? `DECODING: ${Math.floor(progress)}%` : "STEADY HOLD TO DECODE"}
        </span>
        <span className="text-[8px] uppercase tracking-[0.3em] text-white/20">
          ALIGNING WITH THE NEURAL CORE
        </span>
      </div>
    </div>
  );
}

export default function SynkOracle() {
  const { bias } = useSYNK();
  const [phase, setPhase] = useState<'prism' | 'result'>('prism');
  const [result, setResult] = useState<OracleQuote | null>(null);

  const handleShatter = () => {
    const randomIndex = Math.floor(Math.random() * ORACLE_DB.length);
    setResult(ORACLE_DB[randomIndex]);
    setPhase('result');
  };

  const handleReset = () => {
    setPhase('prism');
    setResult(null);
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'GREAT_LUCK': return 'text-synk-blue';
      case 'STABLE': return 'text-synk-lavender';
      case 'CAUTION': return 'text-synk-pink';
      default: return 'text-white';
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-14 pb-32 overflow-y-auto no-scrollbar overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-12 md:gap-20">
        
        {/* Cinematic Header Block */}
        <header className="flex flex-col md:flex-row justify-between items-center md:items-end gap-10 border-b border-white/10 pb-16 relative">
          <div className="flex flex-col items-center md:items-start gap-4">
             <div className="flex items-center gap-4 text-[10px] tracking-[0.5em] text-synk-lavender uppercase mb-2">
                <Shield className="w-3 h-3" />
                <span>Encrypted Channel / 加密頻道</span>
             </div>
             <h1 className="vogue-title-hero scale-y-90 origin-bottom px-4 md:px-0">ORACLE</h1>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-6 text-center md:text-right">
             <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-white/30">CALIBRATION COORDINATES</span>
                <span className="text-xl font-serif italic text-white/80">35.6895° N, 139.6917° E</span>
             </div>
             <div className="flex items-center gap-6">
                <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-white/20 to-transparent md:via-white/20 md:to-white/10" />
                <span className="text-[9px] uppercase tracking-[0.6em] text-synk-pink">V.4.92 SYNC</span>
             </div>
          </div>
        </header>

        {phase === 'prism' ? (
          <div className="flex flex-col items-center gap-16 py-12">
            <div className="max-w-xl text-center flex flex-col items-center gap-8 px-6">
              <p className="text-xl md:text-3xl font-zh-serif leading-relaxed italic text-white/90">
                「將意志凝聚於核心碎片。」
              </p>
              <div className="flex flex-col gap-16 items-center">
                 <p className="text-[10px] md:text-[12px] text-white/40 tracking-[0.4em] uppercase font-light text-center">
                    Concentrate your neural frequency on the core.
                 </p>
                 
                 <PrismHold onReveal={handleShatter} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-16 md:gap-24 animate-in fade-in zoom-in duration-700">
             
             {/* THE PHOTOCARD */}
             <div className="relative w-full max-w-[340px] md:max-w-[380px] aspect-[2.5/3.5] mx-auto [perspective:1000px] group transition-transform duration-500 hover:[transform:rotateX(5deg)_rotateY(5deg)] active:scale-95 cursor-pointer">
                <div id="oracle-photocard" className="relative w-full h-full bg-[#0a0a0a] border border-white/20 p-5 md:p-6 flex flex-col shadow-[0_0_80px_rgba(179,136,255,0.1)] overflow-hidden rounded-[4px]">
                   
                   {/* Holographic Shimmer Layer */}
                   <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none bg-[linear-gradient(110deg,transparent_20%,rgba(179,136,255,0.4)_40%,transparent_60%)] bg-[length:200%_100%] animate-shimmer" />

                   {/* Background Aesthetic Element */}
                   <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <Shield className="w-24 h-24 rotate-12" />
                   </div>

                   {/* Close Button */}
                   <button 
                     onClick={(e) => { e.stopPropagation(); handleReset(); }} 
                     className="absolute top-3 right-3 z-50 text-white/40 hover:text-white transition-colors"
                   >
                     <X className="w-4 h-4" />
                   </button>

                   {/* Photocard Header */}
                   <div className="flex justify-between items-start border-b border-white/10 pb-3 md:pb-4 pr-6">
                      <div className="flex flex-col">
                         <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-synk-lavender font-bold">SYNK PHOTOCARD</span>
                         <span className="text-[7px] md:text-[8px] font-mono text-white/20 uppercase">No. {Math.floor(Math.random() * 9999).toString().padStart(4, '0')}</span>
                      </div>
                      <span className={cn("text-[9px] md:text-[10px] font-mono font-bold tracking-tighter uppercase", getStatusColor(result?.status))}>
                         {result?.status?.replace(/_/g, ' ')}
                      </span>
                   </div>

                   {/* Photocard Image Section */}
                   <div className="relative w-full flex-1 min-h-[35%] overflow-hidden bg-black/40 border border-white/5 mt-3 md:mt-4shrink-0">
                      <img 
                        src={`https://picsum.photos/seed/${result?.keyword}/800/800?blur=4`}
                        alt="Manifest Vibe"
                        className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[2000ms]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 flex gap-1">
                         {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-synk-lavender/40" />)}
                      </div>
                   </div>

                   {/* Main Content Area */}
                   <div className="flex flex-col gap-2 md:gap-3 py-3 md:py-4 shrink-0">
                      <span className="text-[7px] md:text-[8px] uppercase tracking-[0.4em] text-synk-pink border-l-2 border-synk-pink pl-2 md:pl-3">PRIMARY MANIFEST</span>
                      <div className="flex flex-col gap-2">
                        <h2 className={cn(
                          "font-zh-serif leading-[1.1] text-white font-bold transition-all line-clamp-2",
                          result?.kr && result.kr.length > 30 ? "text-lg md:text-xl" : 
                          result?.kr && result.kr.length > 15 ? "text-xl md:text-2xl" : 
                          "text-2xl md:text-3xl"
                        )}>
                           {result?.kr}
                        </h2>
                        
                        <div className="space-y-1 md:space-y-2 pt-2 border-t border-white/5">
                           <p className="text-[9px] md:text-[10px] font-serif italic text-white/40 leading-relaxed uppercase tracking-wide line-clamp-1">
                               "{result?.en}"
                           </p>
                           <p className="font-zh-serif text-[10px] md:text-[11px] text-synk-lavender/60 leading-relaxed italic line-clamp-1">
                               「{result?.tc}」
                           </p>
                        </div>
                      </div>
                   </div>

                   {/* Footer Metadata */}
                   <div className="mt-auto space-y-3 shrink-0">
                      <div className="bg-white/[0.03] p-2 md:p-3 border border-white/5 rounded-sm">
                         <span className="text-[6px] md:text-[7px] uppercase tracking-[0.4em] text-white/30 block mb-1">SYNC ADVICE</span>
                         <div>
                           <p className="text-[9px] md:text-[10px] font-zh-serif text-white/80 leading-relaxed italic line-clamp-2">
                               {result?.advice}
                           </p>
                         </div>
                      </div>

                      <div className="flex justify-between items-end gap-2 md:gap-4">
                         <div className="flex flex-col">
                            <span className="text-[6px] md:text-[7px] uppercase tracking-widest text-white/20">SOURCE ARCHIVE</span>
                            <span className="text-[9px] md:text-[11px] font-serif uppercase tracking-widest text-white/60">{result?.track}</span>
                         </div>
                         <div className="text-right">
                            <span className="text-[6px] md:text-[7px] uppercase tracking-widest text-white/20">IDENTIFIER</span>
                            <span className="text-[9px] md:text-[11px] font-mono uppercase text-white/60 block leading-none">{result?.keyword}</span>
                         </div>
                      </div>
                   </div>

                   {/* Gloss/Reflect Effect */}
                   <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.05] pointer-events-none group-hover:translate-x-full transition-transform duration-1000" />
                </div>

                {/* Corner Decoration */}
                <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-synk-lavender" />
                <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-synk-lavender" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-synk-lavender" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-synk-lavender" />
             </div>

             <footer className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-5xl mx-auto">
                <button 
                  onClick={handleReset}
                  className="w-full md:w-auto flex items-center justify-center gap-5 px-12 py-5 bg-white/[0.03] border border-white/10 text-white text-[10px] font-bold uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all group rounded-none"
                >
                   <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-1000" />
                   RE CALIBRATE
                </button>

                <button 
                  className="w-full md:w-auto flex items-center justify-center gap-5 px-14 py-5 bg-synk-lavender text-black text-[10px] font-bold uppercase tracking-[0.6em] hover:bg-white transition-all shadow-[0_25px_60px_-10px_rgba(179,136,255,0.4)] relative overflow-hidden rounded-none group"
                >
                   <span className="relative z-10">COLLECT DATA</span>
                   <Share2 className="w-4 h-4 relative z-10" />
                </button>

                <button 
                  onClick={() => exportAsImage('oracle-photocard', 'synk-oracle.png')}
                  className="w-full md:w-auto flex items-center justify-center gap-5 px-12 py-5 bg-transparent border border-white/20 text-white/40 text-[10px] font-bold uppercase tracking-[0.5em] hover:text-white hover:border-white transition-all rounded-none"
                >
                   <Download className="w-4 h-4" />
                   STORAGE
                </button>
             </footer>
          </div>
        )}
      </div>
    </div>
  );
}
