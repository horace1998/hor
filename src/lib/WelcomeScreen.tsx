import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useState } from "react";
import { Fingerprint, Sparkles, Loader2, ChevronRight } from "lucide-react";
import { cn } from "./utils";
import { auth, googleProvider, db, OperationType, handleFirestoreError, signInAnonymously } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useSYNK, MemberBias } from "./Store";

const ONBOARDING_QUESTIONS = [
  {
    id: "bias",
    question: "選擇你的共鳴導師",
    sub: "WHO WILL GUIDE YOUR AURA REFINEMENT?",
    options: [
      { label: "KARINA / 核心視覺", value: "Karina", color: "bg-blue-600" },
      { label: "WINTER / 系統動力", value: "Winter", color: "bg-cyan-400" },
      { label: "GISELLE / 數位語境", value: "Giselle", color: "bg-synk-pink" },
      { label: "NINGNING / 藝術編碼", value: "Ningning", color: "bg-purple-600" }
    ]
  },
  {
    id: "directive",
    question: "設定你的主導協定",
    sub: "WHICH SYSTEM MODULE IS YOUR PRIORITY?",
    options: [
      { label: "TASK DIRECTIVE / 目標管理", value: "Vault", color: "bg-synk-blue/50" },
      { label: "CHRONICLE / 空間存檔", value: "Archive", color: "bg-synk-lavender/50" },
      { label: "RITUAL / 共鳴儀式", value: "Dashboard", color: "bg-cyan-400/50" },
      { label: "ORACLE / 數位靈感", value: "Oracle", color: "bg-synk-pink/50" }
    ]
  },
  {
    id: "frequency",
    question: "識別你的視覺頻率",
    sub: "SET THE COLOR SPACE OF YOUR PORTAL.",
    options: [
      { label: "NEON CYAN / 霓虹氰", value: "Electric", color: "bg-cyan-500" },
      { label: "MINIMAL WHITE / 極簡白", value: "Minimal", color: "bg-white" },
      { label: "LAVENDER ETHER / 薰衣草紫", value: "Aurora", color: "bg-purple-400" },
      { label: "DEEP MAGENTA / 深洋紅", value: "Ether", color: "bg-pink-600" }
    ]
  },
  {
    id: "atmosphere",
    question: "選擇空間大氣",
    sub: "DETERMINE THE IMMERSION DEPTH.",
    options: [
      { label: "STANDARD / 全透視", value: "Standard", color: "bg-white/10" },
      { label: "NEON / 霓虹增強", value: "Neon", color: "bg-cyan-500/20" },
      { label: "VOID / 深度虛空", value: "Void", color: "bg-black" },
      { label: "DREAM / 夢境過濾", value: "Dream", color: "bg-purple-500/20" }
    ]
  }
];

const WelcomeScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { user, loading: authLoading, hasProfile } = useSYNK();
  const [phase, setPhase] = useState<"intro" | "pact" | "questions" | "auth" | "loading" | "success">("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ bias: MemberBias, atmosphere: string, directive: string, frequency: string }>({
    bias: 'None',
    atmosphere: 'Standard',
    directive: 'Archiving',
    frequency: 'Electric'
  });
  const [tempSelection, setTempSelection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding) {
      interval = setInterval(() => {
        setHoldProgress(prev => {
          if (prev >= 100) {
            handleStartOnboarding();
            setIsHolding(false);
            return 100;
          }
          return prev + 1.25; // Completes 100% in 1200ms (1.2s) at 15ms interval
        });
      }, 15);
    } else {
      setHoldProgress(0);
    }
    return () => clearInterval(interval);
  }, [isHolding]);

  useEffect(() => {
    if (user && phase === "auth") {
      handleFinalizeProfile();
    }
  }, [user, phase]);

  const handleStartOnboarding = () => {
    setPhase("pact");
  };

  const handleAcceptPact = () => {
    if (user && hasProfile) {
      handleFinalizeProfile();
    } else {
      setPhase("questions");
    }
  };

  const handleAnswerClick = (value: string) => {
    setTempSelection(value);
  };

  const handleNextStep = () => {
    if (!tempSelection) return;
    
    const currentId = ONBOARDING_QUESTIONS[currentQuestion].id;
    const updatedAnswers = { ...answers, [currentId]: tempSelection };
    setAnswers(updatedAnswers);

    if (currentQuestion < ONBOARDING_QUESTIONS.length - 1) {
      const nextQuestion = currentQuestion + 1;
      const nextId = ONBOARDING_QUESTIONS[nextQuestion].id;
      setCurrentQuestion(nextQuestion);
      // Pre-set temp selection if user is moving back and forth
      setTempSelection((updatedAnswers as any)[nextId] || null);
    } else {
      setPhase("auth");
    }
  };

  const handlePrevStep = () => {
    if (currentQuestion > 0) {
      const prevQuestion = currentQuestion - 1;
      const prevId = ONBOARDING_QUESTIONS[prevQuestion].id;
      setCurrentQuestion(prevQuestion);
      setTempSelection((answers as any)[prevId] || null);
    } else {
      setPhase("pact");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Initiating Google Sign In...");
      await signInWithPopup(auth, googleProvider);
      console.log("Google Sign In successful");
      // Success will trigger the useEffect to handleFinalizeProfile
    } catch (err: any) {
      console.error("Auth error:", err);
      setLoading(false);
      if (err.code === 'auth/popup-blocked') {
        setError("Pop-up blocked! Please allow pop-ups or open the app in a new tab.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError("This domain is not authorized. Please check your Firebase settings.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Network error detected. This often happens in the preview iframe. Please try opening the app in a new tab using the button in the top right.");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    }
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Initiating Guest Access...");
      await signInAnonymously(auth);
      console.log("Guest Access successful");
    } catch (err: any) {
      console.error("Guest Auth error:", err);
      setLoading(false);
      if (err.code === 'auth/admin-restricted-operation') {
        setError("Guest Access is disabled in the Firebase Console. Please enable 'Anonymous' authentication in the Firebase Auth settings.");
      } else {
        setError(err.message || "Guest access failed. Please try again.");
      }
    }
  };

  const handleFinalizeProfile = async () => {
    if (!auth.currentUser) return;
    setPhase("loading");
    setLoading(true);
    
    const userRef = doc(db, 'users', auth.currentUser.uid);
    try {
      console.log("Checking if profile exists...");
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        console.log("Creating new profile...");
        // Create new profile
        await setDoc(userRef, {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email || "guest@synkify.local",
          displayName: auth.currentUser.displayName || "GUEST_AGENT",
          photoURL: auth.currentUser.photoURL || null,
          isAnonymous: auth.currentUser.isAnonymous,
          bias: answers.bias,
          roomAtmosphere: answers.atmosphere,
          directive: answers.directive,
          frequency: answers.frequency,
          stats: {
            level: 1,
            experience: 0,
            crystals: 10,
            completed_goals: 0
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      console.log("Profile ready, showing success phase");
      setPhase("success");
      setTimeout(() => onComplete(), 2000);
    } catch (e: any) {
      console.error("Finalize profile error:", e);
      setPhase("auth");
      setError(e.message || "Failed to finalize profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 text-white overflow-hidden tracking-widest px-6 md:px-8 backdrop-blur-[2px]">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[-100%] opacity-20 mix-blend-screen pointer-events-none"
      >
        <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] rounded-full bg-synk-blue/30 blur-[150px]" />
        <div className="absolute bottom-[20%] right-[30%] w-[50%] h-[50%] rounded-full bg-synk-pink/30 blur-[180px]" />
      </motion.div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center justify-center min-h-[70vh]">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
              className="flex flex-col items-center text-center gap-12"
            >
              <div className="flex flex-col gap-4 w-full px-4">
                <span className="text-[10px] tracking-[0.6em] text-synk-lavender opacity-60 uppercase text-center">ESTABLISHED CONNECTION</span>
                <h1 className="vogue-title-hero text-center w-full drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">SYNKIFY</h1>
                <p className="text-[10px] sm:text-[12px] md:text-[14px] tracking-[0.4em] md:tracking-[0.6em] text-white/60 uppercase text-center mt-2">探索你的數位共鳴中心 / FIND YOUR RESONANCE</p>
              </div>

              <motion.div
                onPointerDown={() => setIsHolding(true)}
                onPointerUp={() => setIsHolding(false)}
                onPointerLeave={() => setIsHolding(false)}
                onContextMenu={(e) => e.preventDefault()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group flex flex-col items-center gap-6 mt-8 relative z-50 bg-transparent border-none cursor-pointer touch-none select-none [WebkitTouchCallout:none]"
              >
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {/* Progress Ring */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                    <circle
                      cx="48"
                      cy="48"
                      r="46"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="transparent"
                      className="text-white/10"
                    />
                    <motion.circle
                      cx="48"
                      cy="48"
                      r="46"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="transparent"
                      strokeDasharray="290"
                      strokeDashoffset={290 - (290 * holdProgress) / 100}
                      className="text-cyan-400"
                    />
                  </svg>

                  {/* Outer spinning aura */}
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: isHolding ? 1.1 : 1,
                      opacity: isHolding ? 0.8 : 0.3
                    }}
                    transition={{
                      rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                    }}
                    className="absolute inset-0 rounded-full border-t-2 border-r-2 border-cyan-400 blur-[2px]"
                  />
                  
                  {/* Pulsing ring */}
                  <motion.div
                    animate={{ 
                      scale: isHolding ? [1, 1.1, 1] : [1, 1.3, 1],
                      opacity: isHolding ? 0.8 : [0.8, 0, 0.8],
                    }}
                    transition={{
                      duration: isHolding ? 0.5 : 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-2 rounded-full border border-synk-lavender shadow-[0_0_15px_rgba(167,139,250,0.6)]"
                  />
                  
                  {/* Center core */}
                  <div className="absolute inset-4 rounded-full bg-black/60 border border-cyan-500/30 backdrop-blur-md flex items-center justify-center overflow-hidden group-hover:border-cyan-400/80 transition-all shadow-[inset_0_0_20px_rgba(34,211,238,0.3)]">
                    <motion.div
                      animate={{
                        scale: isHolding ? 1.2 : 1,
                        opacity: isHolding ? [1, 0.3, 1] : [1, 0.5, 1, 1, 0.2, 1],
                      }}
                      transition={{
                        duration: isHolding ? 0.2 : 2,
                        repeat: Infinity,
                      }}
                    >
                      <Fingerprint className="w-8 h-8 text-cyan-300 fill-cyan-300/40" />
                    </motion.div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 items-center">
                  <motion.span 
                    animate={{ 
                      opacity: isHolding ? 1 : [0.6, 1, 0.6],
                      scale: isHolding ? 1.1 : 1
                    }}
                    className="text-[11px] font-bold uppercase tracking-[0.6em] text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                  >
                    {isHolding ? "SCANNING KEY..." : "HOLD TO SYNK"}
                  </motion.span>
                  <span className="text-[8px] tracking-[0.4em] text-white/40 uppercase">長按指紋開啟</span>
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {phase === "pact" && (
            <motion.div
              key="pact"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, filter: "blur(20px)" }}
              className="flex flex-col items-center text-center gap-10 md:gap-14 max-w-xl"
            >
              <div className="flex flex-col gap-6">
                <span className="text-[10px] tracking-[0.6em] text-synk-pink uppercase">AFFIRMATION_PACT // 誓約</span>
                <h2 className="vogue-title-page">BECOME YOUR TRUE SELF</h2>
                <div className="w-12 h-[1px] bg-white/20 mx-auto" />
                <p className="font-zh-serif text-[16px] md:text-[18px] text-white/80 leading-relaxed italic px-4">
                  「我承諾相信自己的力量，<br />
                  跨越數碼與現實的邊界，<br />
                  在共鳴中找回真實的自我。」
                </p>
                <p className="text-[10px] tracking-[0.4em] text-white/60 uppercase mt-4">
                  I PROMISE TO BELIEVE IN MY OWN STRENGTH <br />
                  AND EVOLVE INTO MY AUTHENTIC SELF.
                </p>
              </div>

              <button
                onClick={handleAcceptPact}
                className="group relative px-14 py-5 overflow-hidden transition-all"
              >
                <div className="absolute inset-0 bg-white group-hover:bg-synk-lavender transition-colors" />
                <span className="relative z-10 text-black text-[11px] font-bold uppercase tracking-[0.4em]">
                  ACCEPT PACT / 接受誓約
                </span>
                <motion.div 
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 border border-white scale-110" 
                />
              </button>
            </motion.div>
          )}

          {phase === "questions" && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full h-full max-w-md flex flex-col items-center pt-8 px-4"
            >
              <div className="flex flex-col items-center text-center gap-3 mb-10">
                <span className="text-[10px] tracking-[0.5em] text-synk-lavender uppercase font-mono">NODE {currentQuestion + 1} // {ONBOARDING_QUESTIONS.length}</span>
                <h2 className="vogue-title-section text-white px-2 uppercase min-h-[3.5rem] flex items-center text-center justify-center">{ONBOARDING_QUESTIONS[currentQuestion].question}</h2>
                <p className="text-[9px] md:text-[10px] tracking-[0.4em] text-white/60 uppercase px-4 leading-relaxed">{ONBOARDING_QUESTIONS[currentQuestion].sub}</p>
              </div>

              <div className="flex flex-col gap-3 w-full flex-grow">
                {ONBOARDING_QUESTIONS[currentQuestion].options.map((opt) => {
                  const isSelected = tempSelection === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswerClick(opt.value)}
                      className={cn(
                        "group relative h-16 border transition-all text-left px-8 flex items-center justify-between overflow-hidden",
                        isSelected 
                          ? "border-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                          : "border-white/10 hover:border-white/40 bg-white/2 hover:bg-white/5"
                      )}
                    >
                       <div className={cn(
                         "absolute left-0 bottom-0 w-[4px] transition-all duration-500", 
                         opt.color,
                         isSelected ? "h-full" : "h-0 group-hover:h-full"
                       )} />
                       <div className="flex flex-col">
                         <span className={cn(
                           "text-[12px] md:text-[13px] uppercase tracking-[0.4em] font-serif transition-all",
                           isSelected ? "text-white translate-x-1" : "text-white/80 group-hover:text-white"
                         )}>
                           {opt.label.split(' / ')[0]}
                         </span>
                         <span className="text-[8px] tracking-[0.2em] text-white/50 mt-1 uppercase italic">
                           {opt.label.split(' / ')[1] || ""}
                         </span>
                       </div>
                       {isSelected && (
                         <motion.div layoutId="check" className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]" />
                       )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between w-full mt-10 mb-8">
                <button
                  onClick={handlePrevStep}
                  className="text-[10px] tracking-[0.4em] text-white/60 hover:text-white uppercase transition-colors py-4 px-2"
                >
                  [ BACK ]
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!tempSelection}
                  className={cn(
                    "relative px-12 py-4 overflow-hidden transition-all disabled:opacity-30 disabled:cursor-not-allowed",
                    tempSelection ? "cursor-pointer" : ""
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 transition-colors duration-500",
                    tempSelection ? "bg-white" : "bg-white/20"
                  )} />
                  <span className={cn(
                    "relative z-10 text-[10px] font-bold uppercase tracking-[0.4em] transition-colors whitespace-nowrap",
                    tempSelection ? "text-black" : "text-white/60"
                  )}>
                    NEXT STEP
                  </span>
                </button>
              </div>
            </motion.div>
          )}

          {phase === "auth" && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
              className="flex flex-col items-center text-center gap-8 md:gap-12"
            >
              <div className="flex flex-col gap-5">
                <span className="text-[10px] tracking-[0.6em] text-cyan-400 uppercase">SYNCHRONIZATION PROFILE</span>
                <h2 className="vogue-title-page">IDENTIFY YOURSELF</h2>
                
                <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto mt-4 px-4">
                  {[
                    { label: "BIAS", val: answers.bias },
                    { label: "DIRECTIVE", val: answers.directive },
                    { label: "FREQUENCY", val: answers.frequency },
                    { label: "PLANE", val: answers.atmosphere }
                  ].map((tag, i) => (
                    <motion.div 
                      key={tag.label} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 flex flex-col items-start gap-1"
                    >
                      <span className="text-[7px] tracking-widest text-white/60 uppercase font-mono">{tag.label}</span>
                      <span className="text-[9px] tracking-[0.2em] text-cyan-300 uppercase font-bold truncate w-full">{tag.val}</span>
                    </motion.div>
                  ))}
                </div>

                <p className="text-[10px] tracking-[0.4em] text-white/60 uppercase max-w-xs leading-relaxed mx-auto mt-4">
                  請使用 GOOGLE 帳戶進行最終身分授權以儲存您的宇宙軌跡。<br />
                  AUTHORIZE IDENTITY TO ARCHIVE YOUR RESONANCE.
                </p>
              </div>

              <div className="flex flex-col gap-4 w-full items-center">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full max-w-sm relative z-50 flex items-center justify-center gap-6 px-12 py-5 bg-white text-black text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-synk-pink hover:text-white hover:shadow-[0_0_20px_rgba(244,114,182,0.5)] transition-all group disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>MANIFEST WITH GOOGLE // 登入</>
                  )}
                </button>

                <button
                  onClick={handleGuestSignIn}
                  disabled={loading}
                  className="w-full max-w-sm relative z-50 flex items-center justify-center gap-6 px-12 py-4 border border-white/20 text-white/60 text-[10px] uppercase tracking-[0.4em] hover:bg-white/5 hover:text-white transition-all group disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>CONTINUE AS GUEST // 訪客進入</>
                  )}
                </button>
              </div>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 w-full max-w-sm border border-red-500/50 bg-black/40 backdrop-blur-md overflow-hidden flex flex-col items-stretch text-left"
                >
                  <div className="bg-red-500/20 px-4 py-2 border-bottom border-red-500/20 flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-red-400 tracking-[0.3em] uppercase">SYSTEM_DIAGNOSTICS // error</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
                      <div className="w-1 h-1 rounded-full bg-red-400/40" />
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col gap-4">
                    <p className="text-[10px] tracking-[0.1em] text-red-200/90 leading-relaxed font-mono uppercase">
                      {error.includes("OPENING THE APP IN A NEW TAB") ? (
                        <>
                          RESONANCE INTERRUPTED BY BROWSER SECURITY POLICIES.<br />
                          IFRAME RESTRICTIONS DETECTED.
                        </>
                      ) : (
                        `STATION_ERROR: ${error}`
                      )}
                    </p>
                    
                    <div className="flex flex-col gap-2 pt-2 border-t border-red-500/10">
                      <span className="text-[8px] tracking-[0.2em] text-red-400/60 uppercase font-bold">REPAIR_PROTOCOLS:</span>
                      <ul className="flex flex-col gap-1.5">
                        <li className="text-[9px] tracking-[0.1em] text-white/40 flex items-start gap-2">
                          <span className="text-red-500">01</span>
                          <span>CLICK THE "OPEN IN NEW TAB" ICON IN THE TOP RIGHT OF THIS WINDOW. (CRITICAL)</span>
                        </li>
                        <li className="text-[9px] tracking-[0.1em] text-white/40 flex items-start gap-2">
                          <span className="text-red-500">02</span>
                          <span>ENSURE "PREVENT CROSS-SITE TRACKING" IS DISABLED IN SAFARI SETTINGS.</span>
                        </li>
                        <li className="text-[9px] tracking-[0.1em] text-white/40 flex items-start gap-2">
                          <span className="text-red-500">03</span>
                          <span>DISABLE AD-BLOCKERS TEMP. FOR THIS SESSION.</span>
                        </li>
                      </ul>
                    </div>

                    <button 
                      onClick={() => { setError(null); setLoading(false); }}
                      className="mt-2 text-[9px] tracking-[0.4em] text-red-400 hover:text-white uppercase font-bold py-2 border border-red-500/30 hover:bg-red-500/20 transition-all text-center"
                    >
                      [ RESET_TERMINAL ]
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {(phase === "loading" || authLoading) && (phase !== "success") && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-8"
            >
              <Loader2 className="w-16 h-16 text-synk-lavender animate-spin opacity-40" />
              <div className="flex flex-col gap-2 items-center">
                <span className="text-[10px] uppercase tracking-[0.6em] text-white/60">SYNCHRONIZING CORE...</span>
                <span className="text-[8px] tracking-[0.3em] text-white/40 uppercase font-mono">UPLOADING RESISTANCE DATA</span>
              </div>
            </motion.div>
          )}

          {phase === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, filter: "blur(20px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              className="flex flex-col items-center gap-8 text-center"
            >
              <motion.div 
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: [0, 90, 0] }}
                transition={{ 
                  scale: { type: "spring", damping: 12 },
                  rotate: { duration: 1.5, ease: "easeInOut" }
                }}
                className="w-24 h-24 rounded-full bg-white flex items-center justify-center relative shadow-[0_0_50px_rgba(255,255,255,0.4)]"
              >
                 <Sparkles className="w-10 h-10 text-black" />
              </motion.div>
              <div className="flex flex-col gap-2">
                <h2 className="vogue-title-section text-white">ACCESS GRANTED</h2>
                <span className="text-[10px] tracking-[0.6em] text-synk-lavender uppercase">同步完成，特工 {(auth.currentUser?.displayName?.split(' ')[0] || "PROTAGONIST").toUpperCase()}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Meta */}
      <div className="absolute bottom-12 left-0 w-full px-12 flex justify-between items-end opacity-20 pointer-events-none">
         <div className="flex flex-col gap-1">
            <span className="text-[8px] uppercase tracking-widest font-mono">STATUS: {loading ? 'FETCHING' : 'IDLE'}</span>
            <span className="text-[8px] uppercase tracking-widest font-mono">SESSION: {Math.random().toString(16).slice(2, 10)}</span>
         </div>
         <span className="text-[8px] uppercase tracking-[0.5em]">SYNK V4.2.1-BETA</span>
      </div>
    </div>
  );
};

export default WelcomeScreen;