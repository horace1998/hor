import { useState } from "react";
import { useSYNK } from "../Store";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Music, Sparkles } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import VogueArchiveCard from "../components/VogueArchiveCard";

interface ArchiveItem {
  id: string;
  title_zh: string;
  title_en: string;
  category_zh: string;
  category_en: string;
  image: string;
  tags: string[];
  lyric_zh: string;
  lyric_en: string;
}

const INITIAL_ITEMS: ArchiveItem[] = [
  {
    id: "1",
    title_zh: "氖色之雨",
    title_en: "Neon Rain",
    category_zh: "空間氛圍",
    category_en: "Spatial Mood",
    image: "https://picsum.photos/seed/cyberpunk/400/300",
    tags: ["數碼", "雨夜", "都市"],
    lyric_zh: "靜電中的淚水。",
    lyric_en: "Tears in static electricity."
  },
  {
    id: "2",
    title_zh: "水晶花園",
    title_en: "Crystal Garden",
    category_zh: "庇護所",
    category_en: "Sanctuary",
    image: "https://picsum.photos/seed/crystal/400/300",
    tags: ["發光", "和平", "礦物"],
    lyric_zh: "在黑暗中茁壯。",
    lyric_en: "Thriving in the shadows."
  }
];

export default function Archive() {
  const { bias, entries } = useSYNK();
  const [items, setItems] = useState<ArchiveItem[]>(INITIAL_ITEMS);
  const [loading, setLoading] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string>("calm");

  const generateOracleResponse = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Generate a new digital artifact for the aespa SYNK portal. 
      The artifact should be inspired by the mood "${selectedMood}" and the member bias "${bias}".
      Theme: Futuristic K-pop, Neo-Kwangya, Cyber-mystique.
      
      Provide fields in BOTH Traditional Chinese (HK/TW) and English.
      Provide only valid JSON matching this schema:
      {
        "title_zh": "Artifact Title In Chinese",
        "title_en": "Artifact Title In English",
        "category_zh": "Lore Category In Chinese",
        "category_en": "Lore Category In English",
        "tags": ["tag1", "tag2"],
        "lyric_zh": "Short poetic line in Chinese",
        "lyric_en": "Short poetic line in English"
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        setItems(prev => [{
          id: Math.random().toString(),
          title_zh: data.title_zh,
          title_en: data.title_en,
          category_zh: data.category_zh,
          category_en: data.category_en,
          tags: data.tags,
          lyric_zh: data.lyric_zh,
          lyric_en: data.lyric_en,
          image: `https://picsum.photos/seed/${data.title_en.replace(/ /g, '')}/400/300?blur=1`
        }, ...prev]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-14 pb-32 overflow-y-auto custom-scrollbar overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-12 md:gap-16">
        
        {/* Editorial Header Section */}
        <header className="flex flex-col md:flex-row gap-8 md:gap-12 justify-between items-start md:items-end border-b border-white/10 pb-8 md:pb-12">
          <div className="flex flex-col gap-1 md:gap-2">
            <span className="text-[9px] md:text-[10px] tracking-[0.4em] md:tracking-[0.5em] text-white/20 mb-2 block uppercase font-light italic">ORACLE_SYSTEM_INDEX</span>
            <h1 className="vogue-title-page">ARCHIVE</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
               <span className="text-[9px] md:text-[10px] tracking-[0.4em] text-synk-lavender uppercase font-light leading-none font-zh-serif">數據檔案日誌 // CHRONICLE DATA</span>
               <span className="hidden sm:block w-12 h-[1px] bg-synk-lavender/30" />
               <p className="text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] text-white/30 uppercase font-light font-zh-serif truncate">從曠野回收的數位遺物與您的個人共鳴。</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto">
            <span className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] text-white/30 font-mono">ORACLE_MANIFEST_PROTOCOL</span>
            <div className="flex bg-synk-glass p-1.5 md:p-2 rounded-xl border border-synk-border backdrop-blur-md w-full md:w-auto">
              <select 
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="bg-transparent text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-white outline-none px-2 md:px-4 mr-2 md:mr-4 cursor-pointer flex-1 md:flex-none font-mono"
              >
                <option value="calm" className="bg-[#080808]">CALM / 平靜</option>
                <option value="energized" className="bg-[#080808]">ENERGY / 活力</option>
                <option value="melancholic" className="bg-[#080808]">BLUE / 憂鬱</option>
                <option value="focused" className="bg-[#080808]">FOCUS / 專注</option>
              </select>
              <button 
                onClick={generateOracleResponse}
                disabled={loading}
                className="flex items-center justify-center gap-3 md:gap-4 px-6 md:px-8 py-2 md:py-3 bg-white text-black text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] hover:invert transition-all disabled:opacity-50 rounded-sm"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "MANIFEST"}
              </button>
            </div>
          </div>
        </header>

        {/* Section: Your Memories (The Chronicle) */}
        {entries.length > 0 && (
          <section className="flex flex-col gap-10">
            <div className="flex items-center gap-4">
              <span className="text-[10px] tracking-[0.5em] text-synk-pink uppercase">RESONANCE_DATA</span>
              <div className="flex-1 h-[1px] bg-white/5" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {entries.map(entry => (
                  <VogueArchiveCard key={entry.id} entry={entry} />
               ))}
            </div>
          </section>
        )}

        {/* Section: Recovered Artifacts */}
        <section className="flex flex-col gap-10">
          <div className="flex items-center gap-4">
            <span className="text-[10px] tracking-[0.5em] text-white/20 uppercase">RECOVERED_ARTIFACTS</span>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
            <AnimatePresence>
              {items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col group relative"
                >
                  <div className="aspect-[4/5] w-full overflow-hidden relative border border-synk-border bg-white/2 rounded-xl">
                     {/* Editorial Badge */}
                     <div className="absolute top-6 left-0 z-20">
                        <div className="bg-black py-1 px-4 border border-white/10">
                           <span className="text-[10px] uppercase tracking-[0.4em] text-white font-serif italic">{item.category_en}</span>
                        </div>
                     </div>
  
                    <img 
                      src={item.image} 
                      alt={item.title_en} 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-20 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Hover Overlay Title */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-8 text-center gap-4">
                       <span className="text-[12px] uppercase tracking-[0.6em] text-white font-light leading-relaxed">
                          SYNK_STABLE_SIGNAL
                       </span>
                       <p className="font-zh-serif italic text-white/60 text-sm leading-relaxed">
                         「此遺物正在向現實滲透」
                       </p>
                    </div>
  
                    <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                       <span className="text-[8px] uppercase tracking-[0.4em] text-synk-pink font-mono">ARTIFACT_P_ID</span>
                       <span className="text-[10px] font-mono text-white/40">{item.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                  </div>
  
                  <div className="break-inside-avoid break-after-auto mt-8 flex flex-col gap-6 border-l border-white/10 pl-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-[8px] uppercase tracking-[0.5em] text-synk-blue">MANIFEST_HEADER</span>
                      <h3 className="vogue-title-section group-hover:text-synk-lavender transition-colors underline decoration-synk-pink/20 underline-offset-8">
                        {item.title_en}
                      </h3>
                      <span className="font-zh-serif text-[18px] text-white/40 italic leading-none">{item.title_zh}</span>
                    </div>
                    
                    <div className="flex flex-col gap-3 py-6 border-t border-white/5 group-hover:border-white/20 transition-all">
                      <div className="flex items-center gap-3">
                         <span className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-mono">RESONANCE_WHISPER</span>
                      </div>
                      <p className="font-serif italic text-white/90 text-[16px] leading-relaxed">
                         "{item.lyric_en}"
                      </p>
                      <p className="font-zh-serif italic text-synk-lavender text-[18px] leading-relaxed">
                         「{item.lyric_zh}」
                      </p>
                      <div className="flex gap-2 mt-2">
                        {item.tags.map(tag => (
                          <span key={tag} className="text-[8px] text-white/30 font-mono uppercase tracking-widest bg-white/5 border border-white/10 px-2 py-0.5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

      </div>
    </div>
  );
}
