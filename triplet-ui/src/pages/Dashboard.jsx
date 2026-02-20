import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LogOut, MapPin, Calendar, Sparkles, Plane, X, Wallet, User, ChevronDown, Trash2, Compass, Map, AlertTriangle, CheckCircle2, Navigation, Cpu } from 'lucide-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [trips, setTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [currentUser, setCurrentUser] = useState(null);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [tripToDelete, setTripToDelete] = useState(null);
    const [tearingTripId, setTearingTripId] = useState(null);
    const [newTrip, setNewTrip] = useState({ destination: '', startDate: '', endDate: '', budget: '' });

    // 🔥 YENİ: AI Gözləmə Mətnləri üçün State
    const [loadingStep, setLoadingStep] = useState(0);
    const navigate = useNavigate();

    // AI-ın "yalandan" gördüyü işlər (Hər 2 saniyədən bir dəyişəcək)
    const aiProcessingSteps = [
        "Calibrating destination parameters...",
        "Scanning local topography & weather...",
        "Analyzing best route logic...",
        "Optimizing budget constraints...",
        "Crafting day-by-day AI itinerary...",
        "Finalizing travel blueprints..."
    ];


    useEffect(() => {
        let interval;
        if (isCreating) {
            interval = setInterval(() => {
                setLoadingStep((prev) => (prev < aiProcessingSteps.length - 1 ? prev + 1 : prev));
            }, 2500); // Hər 2.5 saniyədən bir mətni dəyişir
        } else {
            setLoadingStep(0); // Yüklənmə bitəndə sıfırla
        }
        return () => clearInterval(interval);
    }, [isCreating]);

    const fetchTrips = useCallback(async () => {
        try {
            const response = await api.get('/trips');
            const data = response.data?.content || response.data || [];
            setTrips(data);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTrips();
        const fetchUser = async () => {
            try {
                // Backend-dən user məlumatlarını çəkirik
                const res = await api.get('/users/me');
                setCurrentUser(res.data);
            } catch (error) {
                console.error("User fetch error:", error);
            }
        };
        fetchUser();
    }, [fetchTrips]);

    const handleCreateTrip = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        setLoadingStep(0);
        try {
            const tripData = { ...newTrip, budget: Number(newTrip.budget) };
            const response = await api.post('/trips', tripData);
            setTrips(prev => [response.data, ...prev]);

            // Uğurlu olanda bir az gözlədib bağlayaq ki, sonuncu mesajı oxusun
            setTimeout(() => {
                setIsModalOpen(false);
                setIsCreating(false);
                setNewTrip({ destination: '', startDate: '', endDate: '', budget: '' });
            }, 1000);

        } catch (err) {
            console.error("Creation failed:", err);
            alert("AI Planlayıcı hazırda məşğuldur. Yenidən yoxlayın.");
            setIsCreating(false);
        }
    };

    const handleDeleteClick = (e, trip) => {
        e.stopPropagation();
        setTripToDelete(trip);
    };

    const confirmDelete = async () => {
        if (!tripToDelete) return;
        const tripId = tripToDelete.id;
        setTripToDelete(null);
        setTearingTripId(tripId);
        setTimeout(async () => {
            try {
                await api.delete(`/trips/${tripId}`);
                setTrips(prev => prev.filter(trip => trip.id !== tripId));
                setTearingTripId(null);
            } catch (error) {
                console.error("Delete failed:", error);
                alert("Səyahət silinə bilmədi! Xəta baş verdi.");
                setTearingTripId(null);
            }
        }, 600);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen relative font-sans text-slate-100 overflow-x-hidden bg-[#0f172a]">
            {/* FON VƏ ANİMASİYALAR */}
            <div className="fixed inset-0 bg-cover bg-center z-0 opacity-60" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2070&auto=format&fit=crop')" }}></div>
            <div className="fixed inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/30 to-slate-900/90 z-0"></div>

            <motion.div animate={{ x: '115vw', y: -50, opacity: [0, 0.4, 0.4, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="fixed z-0 text-white pointer-events-none">
                <Plane className="w-32 h-32 transform rotate-45 opacity-20" />
            </motion.div>

            <motion.div animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="fixed top-[20%] -left-32 z-0 text-white/[0.03] pointer-events-none">
                <Compass className="w-[500px] h-[500px]" strokeWidth={1} />
            </motion.div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative z-10">

                {/* NAVBAR */}
                <nav className="flex justify-between items-center mb-16">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
                                <Compass className="w-6 h-6 text-sky-300" />
                            </motion.div>
                        </div>
                        <span className="text-2xl font-black tracking-[0.15em] text-white">TRIPLET</span>
                    </div>

                    <div className="flex items-center gap-5">
                        <button onClick={() => setIsModalOpen(true)} className="bg-sky-500/20 hover:bg-sky-500/40 text-sky-100 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all border border-sky-400/30 flex items-center gap-2 backdrop-blur-md shadow-lg">
                            <Plus className="w-4 h-4" /> New Plan
                        </button>

                        <div className="relative">
                            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 p-1.5 pr-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all backdrop-blur-md">
                                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10">
                                    {currentUser?.avatarUrl ? (
                                        <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-slate-300" />
                                    )}
                                </div>
                                <span className="text-sm font-bold text-white hidden sm:block">
                                    {currentUser?.name || "Explorer"}
                                </span>
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-3 w-48 bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden">
                                        <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-sm font-medium text-slate-300 transition-colors">
                                            <User className="w-4 h-4 text-slate-400" /> Profile
                                        </button>
                                        <div className="h-px bg-white/10 my-1"></div>
                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 text-sm font-bold text-red-400 transition-colors">
                                            <LogOut className="w-4 h-4" /> Log Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </nav>

                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Your Travel Plans</h1>
                    <p className="text-slate-400 mt-2 text-lg">AI-curated journeys for your next adventure.</p>
                </header>

                {/* KARTLAR */}
                {isLoading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-400"></div></div>
                ) : trips.length === 0 ? (
                    <div className="text-center py-24 bg-white/5 backdrop-blur-sm rounded-[2rem] border border-white/10 border-dashed">
                        <Map className="w-16 h-16 mx-auto text-slate-500 mb-6" />
                        <h2 className="text-2xl font-bold text-slate-200 mb-2">No journeys planned yet</h2>
                        <button onClick={() => setIsModalOpen(true)} className="mt-4 text-sky-400 font-bold hover:text-white transition-colors">Generate your first itinerary</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {trips.map((trip) => {
                            const isTearing = tearingTripId === trip.id;
                            return (
                                <motion.div key={trip.id} layoutId={`trip-card-${trip.id}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => navigate(`/trip/${trip.id}`)} className="group flex flex-col sm:flex-row relative cursor-pointer">
                                    <motion.div animate={isTearing ? { y: 200, x: -50, rotate: -15, opacity: 0 } : { y: 0, x: 0, rotate: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeIn" }} className="flex-1 p-6 sm:p-8 bg-white/10 group-hover:bg-white/15 backdrop-blur-xl rounded-t-[2rem] sm:rounded-l-[2rem] sm:rounded-tr-none border border-white/10 sm:border-r border-dashed border-white/20 sm:border-r-white/30 transition-colors duration-300 relative z-10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest border border-sky-400/30 px-2 py-0.5 rounded-full">AI Itinerary</span>
                                        </div>
                                        <h3 className="text-3xl font-black text-white mb-1 uppercase tracking-wider">{trip.destination}</h3>

                                        <div className="flex items-center gap-4 text-slate-300 text-sm font-medium mt-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Start</span>
                                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {trip.startDate}</span>
                                            </div>
                                            <Compass className="w-4 h-4 text-slate-500" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-500 uppercase tracking-widest">End</span>
                                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {trip.endDate}</span>
                                            </div>
                                        </div>

                                        {trip.aiGeneralAdvice && (
                                            <div className="mt-6 bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex gap-3 items-start">
                                                <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                                                <p className="text-xs text-slate-300 italic pr-2 line-clamp-2">"{trip.aiGeneralAdvice}"</p>
                                            </div>
                                        )}
                                    </motion.div>

                                    <motion.div animate={isTearing ? { y: 200, x: 50, rotate: 15, opacity: 0 } : { y: 0, x: 0, rotate: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeIn" }} className="w-full sm:w-32 p-6 flex sm:flex-col justify-between items-center bg-slate-900/30 group-hover:bg-slate-900/40 backdrop-blur-xl rounded-b-[2rem] sm:rounded-r-[2rem] sm:rounded-bl-none border border-white/10 border-t-0 sm:border-l-0 sm:border-t-white/10 transition-colors duration-300 relative z-10">
                                        <button onClick={(e) => handleDeleteClick(e, trip)} className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all duration-300 hover:scale-110" title="Delete Plan">
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        <div className="text-center my-auto">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Budget</p>
                                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black px-3 py-1.5 rounded-xl flex items-center justify-center gap-1">
                                                <Wallet className="w-3.5 h-3.5" /> {trip.budget}
                                            </div>
                                        </div>

                                        <div className="hidden sm:flex gap-1 h-8 opacity-30 mt-4">
                                            <div className="w-1 bg-white rounded-full"></div>
                                            <div className="w-2 bg-white rounded-full"></div>
                                            <div className="w-1 bg-white rounded-full"></div>
                                            <div className="w-3 bg-white rounded-full"></div>
                                            <div className="w-1 bg-white rounded-full"></div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* SİLMƏ MODALI ... (Bura toxunmuruq, eynidir) ... */}
            <AnimatePresence>
                {tripToDelete && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-sm shadow-2xl text-center">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                                <AlertTriangle className="w-8 h-8 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Səyahəti ləğv edirsən?</h3>
                            <p className="text-slate-400 text-sm mb-8">
                                <span className="text-white font-bold">{tripToDelete.destination}</span> planı qalıcı olaraq silinəcək.
                            </p>
                            <div className="flex gap-4">
                                <button onClick={() => setTripToDelete(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors">Ləğv et</button>
                                <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/20 transition-all">Bəli, Sil</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🔥 YENİLƏNMİŞ PLANLAMA MODALI (GÖZLƏMƏ EKRANI İLƏ) */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-slate-900 border border-slate-700 p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative overflow-hidden min-h-[420px] flex flex-col justify-center">

                            <button onClick={() => !isCreating && setIsModalOpen(false)} className={`absolute right-6 top-6 text-slate-500 hover:text-white bg-slate-800 p-1.5 rounded-full transition-colors z-20 ${isCreating ? 'hidden' : ''}`}><X className="w-5 h-5" /></button>

                            {/* Əgər yüklənirsə Gözləmə Ekranını göstər, yoxsa Formu göstər */}
                            <AnimatePresence mode="wait">
                                {isCreating ? (
                                    <motion.div key="loading" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex flex-col items-center justify-center text-center space-y-8 w-full">

                                        {/* Fırlanan Kosmik Dairələr */}
                                        <div className="relative flex items-center justify-center w-32 h-32">
                                            <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-xl animate-pulse"></div>
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-t-2 border-l-2 border-sky-400 rounded-full"></motion.div>
                                            <motion.div animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-4 border-b-2 border-r-2 border-teal-400 rounded-full opacity-70"></motion.div>
                                            <Cpu className="w-10 h-10 text-white z-10 animate-pulse" />
                                        </div>

                                        {/* Dinamik Dəyişən Mətn */}
                                        <div className="space-y-3 h-16">
                                            <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-400 uppercase tracking-widest">
                                                Neural Network Active
                                            </h3>
                                            <motion.p
                                                key={loadingStep}
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                                className="text-sm font-medium text-slate-300"
                                            >
                                                {aiProcessingSteps[loadingStep]}
                                            </motion.p>
                                        </div>

                                        {/* İmitasiya Edilmiş Progress Bar */}
                                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                                            <motion.div
                                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-500 to-teal-400"
                                                initial={{ width: "0%" }}
                                                animate={{ width: `${((loadingStep + 1) / aiProcessingSteps.length) * 100}%` }}
                                                transition={{ duration: 2.5, ease: "easeInOut" }}
                                            />
                                        </div>

                                    </motion.div>
                                ) : (
                                    <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                        <div className="mb-8">
                                            <h2 className="text-2xl font-black text-white flex items-center gap-2"><MapPin className="w-6 h-6 text-sky-400" /> Journey Details</h2>
                                            <p className="text-slate-400 text-sm mt-1">Let our AI craft your perfect itinerary.</p>
                                        </div>
                                        <form onSubmit={handleCreateTrip} className="space-y-5">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Destination</label>
                                                <input type="text" placeholder="e.g. Kyoto, Japan" value={newTrip.destination} onChange={(e) => setNewTrip({...newTrip, destination: e.target.value})} required className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl focus:border-sky-500/50 outline-none text-white transition-all placeholder-slate-500" />
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="w-1/2 space-y-1.5">
                                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                                                    <input type="date" value={newTrip.startDate} onChange={(e) => setNewTrip({...newTrip, startDate: e.target.value})} required className="w-full px-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-sm text-white [color-scheme:dark] outline-none focus:border-sky-500/50 transition-all" />
                                                </div>
                                                <div className="w-1/2 space-y-1.5">
                                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                                                    <input type="date" value={newTrip.endDate} onChange={(e) => setNewTrip({...newTrip, endDate: e.target.value})} required className="w-full px-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-sm text-white [color-scheme:dark] outline-none focus:border-sky-500/50 transition-all" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest ml-1">Budget Limit ($)</label>
                                                <input type="number" placeholder="0.00" value={newTrip.budget} onChange={(e) => setNewTrip({...newTrip, budget: e.target.value})} required className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl outline-none focus:border-emerald-500/50 transition-all text-white placeholder-slate-500" />
                                            </div>
                                            <button type="submit" className="w-full bg-sky-500 hover:bg-sky-400 text-slate-900 py-4 rounded-2xl font-black transition-all mt-4 flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20">
                                                Generate Plan <Sparkles className="w-5 h-5" />
                                            </button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;