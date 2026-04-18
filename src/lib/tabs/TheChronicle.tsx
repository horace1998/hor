import React, { useState, useRef, useEffect } from "react";
import { useSYNK, JournalEntry } from "../Store";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Image as ImageIcon, Plus, Send, X, Loader2, Sparkles, Globe } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { cn } from "../utils";
import VogueArchiveCard from "../components/VogueArchiveCard";

// Helper to extract colors from image
async function extractImagePalette(url: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(["#60a5fa", "#f472b6", "#a78bfa"]);
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);
        const data = ctx.getImageData(0, 0, 50, 50).data;
        
        // Pick 3 representative colors
        const colors = [
          `rgb(${data[100]}, ${data[101]}, ${data[102]})`,
          `rgb(${data[2500]}, ${data[2501]}, ${data[2502]})`,
          `rgb(${data[4900]}, ${data[4901]}, ${data[4902]})`
        ];
        resolve(colors);
      } catch (e) {
        resolve(["#60a5fa", "#f472b6", "#a78bfa"]);
      }
    };
    img.onerror = () => resolve(["#60a5fa", "#f472b6", "#a78bfa"]);
  });
}

export default function TheChronicle() {
  const { entries, addEntry, bias, setAccentColors } = useSYNK();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [location, setLocation] = useState<{ name: string; coords: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);

  const fetchLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Simplified reverse geocoding or just use coords
            setLocation({
              name: "KWANGYA COORDS",
              coords: `${latitude.toFixed(4)}N, ${longitude.toFixed(4)}E`
            });
          } catch (e) {
            console.error(e);
          } finally {
            setIsLocating(false);
          }
        },
        () => setIsLocating(false)
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleManifestEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) return;

    setLoading(true);
    try {
      let pairedLyrics = "";
      if (imageUrl) {
        // Extract palette
        const palette = await extractImagePalette(imageUrl);
        setAccentColors(palette);

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        // Parallel AI Tasks: Lyrics + Subject Mask Estimation
        const prompt = `
          Analyze this moment: "${content}" and the image provided.
          Member bias: ${bias} (aespa).
          
          TASK 1: Provide ONE iconic aespa lyric that matches the vibe. 
          Respond with BOTH the original (usually KR/EN) and a Traditional Chinese (HK/TW) translation.
          
          TASK 2: If there's an idol/person, give me an SVG polygon path (0-100 coords) that follows their silhouette.
          
          RESPONSE FORMAT:
          LYRIC_EN: "Lyric in English/Original" - Track
          LYRIC_ZH: "Lyric translation in Chinese"
          MASK: M 10,20 L 30,40 ... Z (Omit if no clear subject)
        `;

        const imagePart = {
          inlineData: {
            data: await (await fetch(imageUrl)).blob().then(b => b.arrayBuffer()).then(a => btoa(String.fromCharCode(...new Uint8Array(a)))),
            mimeType: "image/jpeg"
          }
        };

        const result = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: { parts: [imagePart, { text: prompt }] }
        });
        
        const responseText = result.text || "";
        const lyrics_en = responseText.match(/LYRIC_EN: (.*)/)?.[1] || "";
        const lyrics_zh = responseText.match(/LYRIC_ZH: (.*)/)?.[1] || "";
        const mask = responseText.match(/MASK: (.*)/)?.[1];

        await addEntry({
          content,
          imageUrl,
          location: location || undefined,
          lyrics_en,
          lyrics_zh,
          maskPath: mask || undefined,
          mood: "Resonance"
        });
      } else {
        await addEntry({
          content,
          imageUrl,
          location: location || undefined,
          mood: "Minimal"
        });
      }

      setContent("");
      setImageUrl("");
      setLocation(null);
      setIsCapturing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-14 pb-32 overflow-y-auto no-scrollbar scroll-smooth">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-12 md:gap-20">
        
        {/* Editorial Layout Header */}
        <header className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 items-end border-b border-white/10 pb-16">
          <div className="flex flex-col gap-4">
             <span className="text-[10px] tracking-[0.5em] text-synk-lavender uppercase font-light">SPATIAL ARCHIVING SYSTEM V1</span>
             <h1 className="vogue-title-page text-white/90">
               THE CHRONICLE
             </h1>
             <p className="text-[11px] md:text-[13px] tracking-[0.4em] text-white/30 uppercase mt-4 max-w-xl leading-relaxed">
               TRANSFORMING TRANSIENT MOMENTS INTO ETERNAL LATTICE DATA. SECURELY SYNCED TO YOUR PERSONAL SANCTUARY.
             </p>
          </div>
          
          <div className="flex flex-col gap-6 items-start lg:items-end">
             <button 
               onClick={() => setIsCapturing(true)}
               className="group flex items-center gap-6 px-10 py-5 bg-white text-black text-[12px] font-bold tracking-[0.4em] hover:invert transition-all rounded-none"
             >
                <Plus className="w-4 h-4" />
                MOMENT CAPTURE
             </button>
             <div className="flex items-center gap-4 text-[9px] tracking-[0.4em] text-white/20 uppercase">
                <Globe className="w-3 h-3" />
                SYNCHRONIZED WITH THE CORE
             </div>
          </div>
        </header>

        {/* Capture Interface Overlay */}
        <AnimatePresence>
          {isCapturing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 pointer-events-none"
            >
              <div className="absolute inset-0 bg-black/80 backdrop-blur-xl pointer-events-auto" onClick={() => setIsCapturing(false)} />
              
              <div className="relative w-full max-w-4xl bg-synk-glass border border-white/10 p-8 md:p-16 rounded-[40px] pointer-events-auto shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                 <button 
                   onClick={() => setIsCapturing(false)}
                   className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
                 >
                    <X className="w-6 h-6" />
                 </button>

                 <form onSubmit={handleManifestEntry} className="flex flex-col gap-12">
                    <div className="flex flex-col gap-4">
                       <span className="text-[10px] tracking-[0.5em] text-synk-lavender uppercase">INITIATING_RESONANCE_DATA</span>
                       <textarea 
                         value={content}
                         onChange={(e) => setContent(e.target.value)}
                         placeholder="Describe your current spatial state..."
                         className="w-full bg-transparent border-none text-2xl md:text-4xl font-serif italic text-white placeholder:text-white/5 outline-none resize-none h-32"
                       />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="flex flex-col gap-4">
                          <span className="text-[9px] tracking-[0.4em] text-white/30 uppercase">VISUAL INPUT (URL)</span>
                          <div className="flex items-center gap-4 border-b border-white/10 pb-2 group focus-within:border-white transition-colors">
                             <ImageIcon className="w-4 h-4 text-white/20" />
                             <input 
                               type="text"
                               value={imageUrl}
                               onChange={(e) => setImageUrl(e.target.value)}
                               placeholder="https://..."
                               className="flex-1 bg-transparent border-none text-sm font-mono text-white outline-none"
                             />
                          </div>
                       </div>

                       <div className="flex flex-col gap-4">
                          <span className="text-[9px] tracking-[0.4em] text-white/30 uppercase">SPATIAL METADATA</span>
                          <button 
                            type="button"
                            onClick={fetchLocation}
                            disabled={isLocating}
                            className="flex items-center gap-4 text-left border-b border-white/10 pb-2 hover:border-white/40 transition-colors"
                          >
                             <MapPin className={cn("w-4 h-4", isLocating ? "animate-bounce text-synk-blue" : "text-white/20")} />
                             <span className="text-sm font-mono text-white/60">
                               {isLocating ? "LOCATING..." : location ? location.coords : "PULL GPS COORDINATES"}
                             </span>
                          </button>
                       </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading || (!content.trim() && !imageUrl)}
                      className="w-full bg-white text-black font-bold py-6 text-[12px] tracking-[0.6em] transition-all hover:invert disabled:opacity-30 disabled:invert-0 flex items-center justify-center gap-4"
                    >
                       {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>MANIFEST_TO_SANCTUARY <Send className="w-4 h-4" /></>}
                    </button>
                 </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entries Display Section */}
        <section className="flex flex-col gap-16">
           <div className="flex items-center justify-between border-b border-white/5 pb-8">
              <h2 className="text-4xl font-serif tracking-tight text-white/80 uppercase">RESONANCE DATA</h2>
              <span className="text-[10px] tracking-[0.4em] text-white/20 uppercase font-mono">COUNT: {entries.length} ARCHIVES</span>
           </div>

           {entries.length === 0 ? (
             <div className="py-40 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[40px] gap-6">
                <Sparkles className="w-12 h-12 text-white/5" />
                <p className="text-[11px] tracking-[0.5em] text-white/20 uppercase italic font-serif">Empty Chronicle / 期待您的下一個瞬間</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {entries.map((entry, idx) => (
                   <VogueArchiveCard key={entry.id} entry={entry} priority={idx === 0} />
                ))}
             </div>
           )}
        </section>

      </div>
    </div>
  );
}
