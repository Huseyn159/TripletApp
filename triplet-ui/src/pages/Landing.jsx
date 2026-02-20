import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles, PlaneTakeoff, Globe2, Cpu, Map, ChevronRight, Fingerprint, CheckCircle2 } from 'lucide-react';
// Epik Səyahət Şəkilləri
const backgroundImages = [
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2020&auto=format&fit=crop", // Paris Night
    "https://images.unsplash.com/photo-1542051812-f47084f4e272?q=80&w=2074&auto=format&fit=crop", // Neon Tokyo
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"  // Epic Route
];

const Landing = () => {
    const navigate = useNavigate();
    const [currentBg, setCurrentBg] = useState(0);
    const [aiTextIndex, setAiTextIndex] = useState(0);

    useEffect(() => {
        // Əgər istifadəçinin tokeni varsa, onu zorla Dashboard-a at (Login/Landing görməsin)
        const token = localStorage.getItem('token');
        if (token && token !== "undefined" && token !== "null") {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);
    // AI Simulyasiyası üçün mətnlər
    const aiSteps = [
        "Analyzing your travel style...",
        "Scanning flights to Kyoto...",
        "Calculating optimal budget...",
        "Generating day-by-day itinerary...",
        "Journey ready. ✈️"
    ];

    useEffect(() => {
        const bgInterval = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
        }, 6000);
        return () => clearInterval(bgInterval);
    }, []);

    useEffect(() => {
        const textInterval = setInterval(() => {
            setAiTextIndex((prev) => (prev < aiSteps.length - 1 ? prev + 1 : prev));
        }, 2000);
        return () => clearInterval(textInterval);
    }, []);

    // Framer Motion Variantları
    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
    };

    const textReveal = {
        hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen relative flex flex-col overflow-hidden bg-[#050b14] font-sans selection:bg-sky-500/30">

            {/* --- 1. DİNAMİK ARXA FON (Cinematic Overlay) --- */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentBg}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 0.4, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    className="absolute inset-0 bg-cover bg-center mix-blend-screen"
                    style={{ backgroundImage: `url('${backgroundImages[currentBg]}')` }}
                />
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-b from-[#050b14]/90 via-[#050b14]/60 to-[#050b14] z-0"></div>

            {/* --- 2. AURORA İŞIQLARI (God Level Effect) --- */}
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-sky-600/20 rounded-full blur-[150px] animate-pulse pointer-events-none z-0"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-teal-600/20 rounded-full blur-[150px] animate-pulse pointer-events-none z-0 delay-700"></div>
            <div className="absolute top-[20%] right-[20%] w-[30vw] h-[30vw] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none z-0 delay-1000"></div>

            {/* --- 3. GİZLİ ŞƏBƏKƏ (Cyber Grid) --- */}
            <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            {/* --- NAVBAR --- */}
            <header className="relative z-20 flex justify-between items-center px-6 md:px-12 py-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Compass className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-black tracking-[0.25em] text-white">TRIPLET</span>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} className="flex items-center gap-6">
                    <button onClick={() => navigate('/login')} className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white uppercase tracking-widest transition-colors group">
                        <Fingerprint className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" /> Basecamp
                    </button>
                    <button onClick={() => navigate('/register')} className="relative px-6 py-2.5 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] overflow-hidden group">
                        <span className="relative z-10 flex items-center gap-2">Initialize <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /></span>
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-200 to-teal-200 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                </motion.div>
            </header>

            {/* --- HERO SECTION --- */}
            <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center px-6 md:px-12 lg:px-24 w-full max-w-[1600px] mx-auto">

                {/* SOL: Mətn və Düymələr */}
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex-1 w-full flex flex-col items-center lg:items-start text-center lg:text-left pt-10 lg:pt-0">

                    <motion.div variants={textReveal} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-white/10 backdrop-blur-md mb-8 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                        <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></div>
                        <span className="text-[10px] font-black text-sky-200 uppercase tracking-[0.3em]">System Online v2.0</span>
                    </motion.div>

                    <motion.h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-black text-white tracking-tighter leading-[1.05] mb-6 drop-shadow-2xl">
                        <motion.span variants={textReveal} className="block">Redefine</motion.span>
                        <motion.span variants={textReveal} className="block">Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">Reality.</span></motion.span>
                    </motion.h1>

                    <motion.p variants={textReveal} className="text-lg text-slate-400 mb-12 max-w-xl leading-relaxed font-medium">
                        The world's most advanced AI travel architect. Input your coordinates, set your budget, and let the algorithm engineer your perfect expedition in milliseconds.
                    </motion.p>

                    <motion.div variants={textReveal} className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
                        <button onClick={() => navigate('/register')} className="w-full sm:w-auto px-8 py-5 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_40px_rgba(14,165,233,0.4)] hover:shadow-[0_0_60px_rgba(14,165,233,0.6)] flex items-center justify-center gap-3 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-full bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-[shine_1.5s_ease-out]"></div>
                            Generate Route <PlaneTakeoff size={18} />
                        </button>

                        <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-8 py-5 bg-transparent hover:bg-white/5 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-3">
                            Access Terminal <Globe2 size={18} className="text-slate-400" />
                        </button>
                    </motion.div>
                </motion.div>

                {/* SAĞ: God Level UI Simulyasiyası */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                    className="flex-1 w-full h-[500px] lg:h-[700px] relative hidden lg:flex items-center justify-center perspective-[1000px]"
                >
                    {/* Əsas Üzən Şüşə Panel (3D Tilt Effect kimi hərəkət edir) */}
                    <motion.div
                        animate={{ y: [-10, 10, -10], rotateX: [2, -2, 2], rotateY: [-2, 2, -2] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="w-[450px] bg-slate-900/40 backdrop-blur-2xl border-t border-l border-white/20 border-b border-r border-white/5 p-8 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(14,165,233,0.15)] relative z-20"
                    >
                        {/* Üst Header */}
                        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30">
                                    <Cpu className="w-5 h-5 text-emerald-400 animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-sm tracking-widest uppercase">Triplet Core</h3>
                                    <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">Neural Network Active</p>
                                </div>
                            </div>
                            <Sparkles className="w-5 h-5 text-slate-500" />
                        </div>

                        {/* Canlı AI Simulyasiyası (Typewriter effect) */}
                        <div className="space-y-6">
                            {aiSteps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: index <= aiTextIndex ? 1 : 0, x: index <= aiTextIndex ? 0 : -20 }}
                                    transition={{ duration: 0.5 }}
                                    className={`flex items-start gap-4 p-4 rounded-2xl border ${index === aiTextIndex ? 'bg-sky-500/10 border-sky-500/30' : 'bg-white/5 border-white/5'} transition-all`}
                                >
                                    {index < aiTextIndex ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                    ) : index === aiTextIndex ? (
                                        <div className="w-5 h-5 shrink-0 mt-0.5 flex items-center justify-center"><div className="w-2 h-2 bg-sky-400 rounded-full animate-ping"></div></div>
                                    ) : (
                                        <div className="w-5 h-5 shrink-0 mt-0.5 rounded-full border border-slate-700"></div>
                                    )}
                                    <p className={`text-sm font-medium ${index === aiTextIndex ? 'text-white' : 'text-slate-400'}`}>{step}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Kiçik Uçan Kart (Büdcə) */}
                        <motion.div
                            animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -right-16 -bottom-10 bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl w-56 flex items-center gap-4 z-30"
                        >
                            <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                                <span className="text-teal-400 font-black text-lg">$</span>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Saved by AI</p>
                                <p className="text-xl font-black text-white">$450.00</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </main>

            {/* Custom Tailwind Animation for the button shine */}
            <style>{`
                @keyframes shine {
                    100% { left: 125%; }
                }
            `}</style>
        </div>
    );
};

export default Landing;